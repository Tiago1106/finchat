import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module.js';
import * as schema from '../database/schema.js';
import { OllamaService } from '../ollama/ollama.service.js';
import type { OllamaInterpretation } from '../ollama/ollama.service.js';
import { ExpensesService } from '../expenses/expenses.service.js';
import type { InterpretationDto } from './dto/chat.dto.js';

export interface StoredInterpretation extends InterpretationDto {
  needs_amount?: boolean;
  needs_payment_method?: boolean;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    private ollamaService: OllamaService,
    private expensesService: ExpensesService,
  ) {}

  // ============================================================
  // Conversations
  // ============================================================

  async listConversations(userId: string) {
    const rows = await this.db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.userId, userId))
      .orderBy(desc(schema.conversations.updatedAt));

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    }));
  }

  async getConversationMessages(userId: string, conversationId: string) {
    // Verificar ownership
    const [conv] = await this.db
      .select()
      .from(schema.conversations)
      .where(
        and(
          eq(schema.conversations.id, conversationId),
          eq(schema.conversations.userId, userId),
        ),
      )
      .limit(1);

    if (!conv) {
      throw new NotFoundException('Conversa não encontrada');
    }

    const rows = await this.db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.conversationId, conversationId))
      .orderBy(schema.messages.createdAt);

    return rows.map((row) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      interpretation: row.interpretation
        ? (JSON.parse(row.interpretation) as InterpretationDto)
        : null,
      created_at: row.createdAt.toISOString(),
    }));
  }

  // ============================================================
  // Send Message (interpret)
  // ============================================================

  async sendMessage(
    userId: string,
    conversationId: string | null | undefined,
    content: string,
  ) {
    // 1. Criar ou buscar conversa
    let convId = conversationId;
    if (!convId) {
      const [newConv] = await this.db
        .insert(schema.conversations)
        .values({ userId, title: content.slice(0, 50) })
        .returning();
      convId = newConv!.id;
    } else {
      // Verificar ownership
      const [conv] = await this.db
        .select()
        .from(schema.conversations)
        .where(
          and(
            eq(schema.conversations.id, convId),
            eq(schema.conversations.userId, userId),
          ),
        )
        .limit(1);

      if (!conv) {
        throw new NotFoundException('Conversa não encontrada');
      }
    }

    // 2. Salvar mensagem do usuário
    await this.db.insert(schema.messages).values({
      conversationId: convId,
      role: 'user',
      content,
    });

    // 3. Buscar categorias e cartões do usuário
    const [categories, cards] = await Promise.all([
      this.getUserCategories(userId),
      this.getUserCards(userId),
    ]);

    // 4. Consultar category_mapping ANTES do Ollama
    const mappingCategory = await this.lookupCategoryMapping(userId, content);

    // 5. Interpretar com Ollama (ou fallback)
    const ollamaResult = await this.ollamaService.interpretExpense(
      content,
      categories.map((c) => ({ id: c.id, name: c.name })),
      cards.map((c) => ({ id: c.id, name: c.name })),
    );

    // 6. Montar interpretação final
    const interpretation = await this.buildInterpretation(
      ollamaResult,
      mappingCategory,
      categories,
      cards,
      userId,
    );

    // 7. Gerar mensagem do assistente
    const assistantMessage = this.buildAssistantMessage(interpretation);

    // 8. Salvar mensagem do assistente
    const [assistantMsg] = await this.db
      .insert(schema.messages)
      .values({
        conversationId: convId,
        role: 'assistant',
        content: assistantMessage,
        interpretation: JSON.stringify(interpretation),
      })
      .returning();

    // 9. Atualizar updated_at da conversa
    await this.db
      .update(schema.conversations)
      .set({ updatedAt: new Date() })
      .where(eq(schema.conversations.id, convId));

    return {
      message_id: assistantMsg!.id,
      conversation_id: convId,
      interpretation,
      confirmation_required: interpretation.total_amount !== null,
      assistant_message: assistantMessage,
    };
  }

  // ============================================================
  // Confirm
  // ============================================================

  async confirmExpense(userId: string, messageId: string) {
    // 1. Buscar a mensagem do assistente com a interpretação
    const [msg] = await this.db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.id, messageId))
      .limit(1);

    if (!msg || msg.role !== 'assistant' || !msg.interpretation) {
      throw new NotFoundException(
        'Mensagem de interpretação não encontrada',
      );
    }

    // Verificar ownership via conversa
    const [conv] = await this.db
      .select()
      .from(schema.conversations)
      .where(
        and(
          eq(schema.conversations.id, msg.conversationId),
          eq(schema.conversations.userId, userId),
        ),
      )
      .limit(1);

    if (!conv) {
      throw new NotFoundException('Conversa não encontrada');
    }

    const interpretation = JSON.parse(msg.interpretation) as StoredInterpretation;

    if (!interpretation.total_amount) {
      throw new BadRequestException(
        'Interpretação incompleta — valor não identificado',
      );
    }

    if (!interpretation.payment_method) {
      throw new BadRequestException(
        'Interpretação incompleta — método de pagamento não definido',
      );
    }

    // 2. Criar o(s) lançamento(s) via ExpensesService
    const result = await this.expensesService.create(userId, {
      description: interpretation.description,
      total_amount: interpretation.total_amount,
      installments: interpretation.installments,
      payment_method: interpretation.payment_method,
      category_id: interpretation.category?.id ?? undefined,
      card_id: interpretation.card?.id ?? undefined,
      date: interpretation.date,
      confirmed: true,
      message_id: messageId,
    });

    // 3. Salvar/atualizar category_mapping
    if (interpretation.category) {
      await this.saveCategoryMapping(
        userId,
        interpretation.description,
        interpretation.category.id,
      );
    }

    // 4. Salvar mensagem de confirmação do assistente
    const expenseIds = Array.isArray(result)
      ? result.map((e: { id: string }) => e.id)
      : [(result as { id: string }).id];

    const confirmMsg = this.buildConfirmMessage(interpretation, expenseIds);

    await this.db.insert(schema.messages).values({
      conversationId: msg.conversationId,
      role: 'assistant',
      content: confirmMsg,
    });

    await this.db
      .update(schema.conversations)
      .set({ updatedAt: new Date() })
      .where(eq(schema.conversations.id, msg.conversationId));

    return {
      message: confirmMsg,
      conversation_id: msg.conversationId,
      expense_ids: expenseIds,
    };
  }

  // ============================================================
  // Correct
  // ============================================================

  async correctExpense(
    userId: string,
    messageId: string,
    correctionText: string,
  ) {
    // 1. Buscar a mensagem original do assistente
    const [msg] = await this.db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.id, messageId))
      .limit(1);

    if (!msg || msg.role !== 'assistant' || !msg.interpretation) {
      throw new NotFoundException(
        'Mensagem de interpretação não encontrada',
      );
    }

    // Verificar ownership
    const [conv] = await this.db
      .select()
      .from(schema.conversations)
      .where(
        and(
          eq(schema.conversations.id, msg.conversationId),
          eq(schema.conversations.userId, userId),
        ),
      )
      .limit(1);

    if (!conv) {
      throw new NotFoundException('Conversa não encontrada');
    }

    const currentInterpretation = JSON.parse(
      msg.interpretation,
    ) as StoredInterpretation;

    // 2. Salvar a correção do usuário como mensagem
    await this.db.insert(schema.messages).values({
      conversationId: msg.conversationId,
      role: 'user',
      content: correctionText,
    });

    // 3. Aplicar correções com parsing simples
    const updatedInterpretation = await this.applyCorrections(
      userId,
      currentInterpretation,
      correctionText,
    );

    // 4. Gerar nova mensagem do assistente
    const assistantMessage = this.buildAssistantMessage(updatedInterpretation);

    // 5. Salvar nova mensagem do assistente
    const [newMsg] = await this.db
      .insert(schema.messages)
      .values({
        conversationId: msg.conversationId,
        role: 'assistant',
        content: assistantMessage,
        interpretation: JSON.stringify(updatedInterpretation),
      })
      .returning();

    await this.db
      .update(schema.conversations)
      .set({ updatedAt: new Date() })
      .where(eq(schema.conversations.id, msg.conversationId));

    return {
      message_id: newMsg!.id,
      conversation_id: msg.conversationId,
      interpretation: updatedInterpretation,
      confirmation_required: updatedInterpretation.total_amount !== null,
      assistant_message: assistantMessage,
    };
  }

  // ============================================================
  // Private helpers
  // ============================================================

  private async getUserCategories(userId: string) {
    return this.db
      .select({ id: schema.categories.id, name: schema.categories.name })
      .from(schema.categories)
      .where(
        eq(schema.categories.isGlobal, true),
      );
    // TODO: também incluir categorias customizadas do usuário
  }

  private async getUserCards(userId: string) {
    return this.db
      .select({
        id: schema.cards.id,
        name: schema.cards.name,
        closingDay: schema.cards.closingDay,
      })
      .from(schema.cards)
      .where(eq(schema.cards.userId, userId));
  }

  /**
   * Consulta category_mapping para a descrição.
   * Retorna a categoria mapeada ou null.
   */
  private async lookupCategoryMapping(
    userId: string,
    text: string,
  ): Promise<{ id: string; name: string } | null> {
    const normalized = text.toLowerCase();

    // Buscar todos os mappings do usuário
    const mappings = await this.db
      .select({
        keyword: schema.categoryMappings.keyword,
        categoryId: schema.categoryMappings.categoryId,
        categoryName: schema.categories.name,
      })
      .from(schema.categoryMappings)
      .innerJoin(
        schema.categories,
        eq(schema.categoryMappings.categoryId, schema.categories.id),
      )
      .where(eq(schema.categoryMappings.userId, userId));

    // Procurar keyword no texto
    for (const mapping of mappings) {
      if (normalized.includes(mapping.keyword.toLowerCase())) {
        return { id: mapping.categoryId, name: mapping.categoryName };
      }
    }

    return null;
  }

  /**
   * Salva ou atualiza category_mapping após confirmação
   */
  private async saveCategoryMapping(
    userId: string,
    description: string,
    categoryId: string,
  ) {
    const keyword = description.toLowerCase().trim();

    // Verificar se já existe
    const [existing] = await this.db
      .select()
      .from(schema.categoryMappings)
      .where(
        and(
          eq(schema.categoryMappings.userId, userId),
          eq(schema.categoryMappings.keyword, keyword),
        ),
      )
      .limit(1);

    if (existing) {
      // Atualizar categoria se mudou
      if (existing.categoryId !== categoryId) {
        await this.db
          .update(schema.categoryMappings)
          .set({ categoryId })
          .where(eq(schema.categoryMappings.id, existing.id));
      }
    } else {
      // Criar novo mapping
      await this.db.insert(schema.categoryMappings).values({
        userId,
        keyword,
        categoryId,
      });
    }
  }

  /**
   * Monta a interpretação final combinando Ollama + category_mapping + dados do usuário
   */
  private async buildInterpretation(
    ollama: OllamaInterpretation,
    mappingCategory: { id: string; name: string } | null,
    categories: { id: string; name: string }[],
    cards: { id: string; name: string; closingDay: number }[],
    userId: string,
  ): Promise<StoredInterpretation> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]!;

    // Categoria: mapping > ollama
    let category: { id: string; name: string } | null = mappingCategory;
    if (!category && ollama.category_name) {
      const found = categories.find(
        (c) =>
          c.name.toLowerCase() === ollama.category_name!.toLowerCase(),
      );
      if (found) {
        category = found;
      }
    }

    // Cartão: buscar pelo nome mencionado
    let card: { id: string; name: string } | null = null;
    if (ollama.card_name) {
      const found = cards.find(
        (c) =>
          c.name.toLowerCase() === ollama.card_name!.toLowerCase(),
      );
      if (found) {
        card = { id: found.id, name: found.name };
      }
    }

    // Billing month
    let billingMonth: string | null = null;
    if (ollama.amount !== null) {
      const paymentMethod = ollama.payment_method;
      if (paymentMethod === 'credit' && card) {
        const cardData = cards.find((c) => c.id === card!.id);
        const day = today.getDate();
        const month = today.getMonth(); // 0-indexed
        const year = today.getFullYear();

        if (cardData && day > cardData.closingDay) {
          const nextMonth = month + 1;
          if (nextMonth > 11) {
            billingMonth = `${year + 1}-01`;
          } else {
            billingMonth = `${year}-${String(nextMonth + 1).padStart(2, '0')}`;
          }
        } else {
          billingMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
        }
      } else {
        billingMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      }
    }

    const installments = ollama.installments;
    const installmentAmount =
      ollama.amount !== null
        ? Math.round((ollama.amount / installments) * 100) / 100
        : null;

    return {
      description: ollama.description,
      total_amount: ollama.amount,
      installments,
      installment_amount: installmentAmount,
      category,
      payment_method: ollama.payment_method,
      card,
      billing_month: billingMonth,
      date: dateStr,
      needs_amount: ollama.amount === null,
      needs_payment_method: ollama.payment_method === null,
    };
  }

  /**
   * Monta a mensagem textual do assistente a partir da interpretação
   */
  private buildAssistantMessage(interpretation: StoredInterpretation): string {
    if (interpretation.needs_amount) {
      return `Entendi "${interpretation.description}", mas não identifiquei o valor. Qual o valor do gasto?`;
    }

    const parts: string[] = [];
    parts.push(`${interpretation.description}`);
    parts.push(`R$${interpretation.total_amount!.toFixed(2)}`);

    if (interpretation.installments > 1) {
      parts.push(
        `em ${interpretation.installments}x de R$${interpretation.installment_amount!.toFixed(2)}`,
      );
    }

    if (interpretation.payment_method) {
      const methodLabel: Record<string, string> = {
        credit: 'crédito',
        debit: 'débito',
        pix: 'pix',
        cash: 'dinheiro',
      };
      parts.push(`no ${methodLabel[interpretation.payment_method] ?? interpretation.payment_method}`);
    }

    if (interpretation.card) {
      parts.push(`(${interpretation.card.name})`);
    }

    if (interpretation.category) {
      parts.push(`- ${interpretation.category.name}`);
    }

    let msg = `Entendi! ${parts.join(' ')}`;

    if (interpretation.needs_payment_method) {
      msg += '\n\nNão identifiquei o método de pagamento. É crédito, débito, pix ou dinheiro?';
    } else {
      msg += '. Confirma?';
    }

    return msg;
  }

  private buildConfirmMessage(
    interpretation: StoredInterpretation,
    expenseIds: string[],
  ): string {
    if (interpretation.installments > 1) {
      return `Pronto! ${interpretation.description} R$${interpretation.total_amount!.toFixed(2)} em ${interpretation.installments}x salvo com sucesso.`;
    }
    return `Pronto! ${interpretation.description} R$${interpretation.total_amount!.toFixed(2)} salvo com sucesso.`;
  }

  /**
   * Aplica correções textuais na interpretação existente.
   * O usuário corrige por texto livre (ex: "muda pra débito", "categoria alimentação").
   */
  private async applyCorrections(
    userId: string,
    current: StoredInterpretation,
    correctionText: string,
  ): Promise<StoredInterpretation> {
    // Normalizar Unicode (NFC) para tratar é composto vs decomposto,
    // e também criar versão sem acentos para fallback
    const text = correctionText.normalize('NFC').toLowerCase().trim();
    const textNoAccents = text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const updated = { ...current };

    this.logger.debug(
      `applyCorrections input: "${correctionText}" → normalized: "${text}" → noAccents: "${textNoAccents}" (charCodes: ${[...correctionText].map((c) => c.charCodeAt(0)).join(',')})`,
    );

    // Corrigir método de pagamento
    if (/\bpix\b/.test(text)) {
      updated.payment_method = 'pix';
      updated.card = null;
      updated.needs_payment_method = false;
    } else if (/\bd[eé]bito\b/.test(text) || /\bdebito\b/.test(textNoAccents)) {
      updated.payment_method = 'debit';
      updated.card = null;
      updated.needs_payment_method = false;
    } else if (/\bdinheiro\b|\bcash\b/.test(text)) {
      updated.payment_method = 'cash';
      updated.card = null;
      updated.needs_payment_method = false;
    } else if (/\bcr[eé]dito\b/.test(text) || /\bcredito\b/.test(textNoAccents)) {
      updated.payment_method = 'credit';
      updated.needs_payment_method = false;
    }

    if (updated.payment_method !== current.payment_method) {
      this.logger.debug(
        `Payment method changed: "${current.payment_method}" → "${updated.payment_method}"`,
      );
    }

    // Corrigir valor
    const amountMatch = text.match(/(\d+(?:[.,]\d{1,2})?)\s*(?:reais|r\$)?/);
    if (amountMatch && /(?:valor|reais|r\$|\bpra\s+\d)/.test(text)) {
      const newAmount = parseFloat(amountMatch[1]!.replace(',', '.'));
      updated.total_amount = newAmount;
      updated.installment_amount =
        Math.round((newAmount / updated.installments) * 100) / 100;
      updated.needs_amount = false;
    }

    // Corrigir categoria (aceitar "categoria X" ou "categor X")
    const categoryMatch =
      text.match(/categor(?:ia)?\s+(.+)/i) ||
      textNoAccents.match(/categor(?:ia)?\s+(.+)/i);
    if (categoryMatch) {
      const catName = categoryMatch[1]!.trim();
      const categories = await this.getUserCategories(userId);
      // Comparar com e sem acentos
      const catNameNorm = catName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const found = categories.find((c) => {
        const cNorm = c.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return (
          c.name.toLowerCase() === catName.toLowerCase() ||
          cNorm === catNameNorm
        );
      });
      if (found) {
        updated.category = found;
      }
    }

    // Corrigir cartão (aceitar "cartão X" ou "cartao X")
    const cardMatch =
      text.match(/cart[aã]o\s+(.+)/i) ||
      textNoAccents.match(/cartao\s+(.+)/i);
    if (cardMatch) {
      const cardName = cardMatch[1]!.trim();
      const cards = await this.getUserCards(userId);
      const cardNameNorm = cardName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const found = cards.find((c) => {
        const cNorm = c.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return (
          c.name.toLowerCase() === cardName.toLowerCase() ||
          cNorm === cardNameNorm
        );
      });
      if (found) {
        updated.card = { id: found.id, name: found.name };
      }
    }

    // Recalcular billing_month se algo relevante mudou
    if (updated.total_amount !== null) {
      const today = new Date();
      if (updated.payment_method === 'credit' && updated.card) {
        const cards = await this.getUserCards(userId);
        const cardData = cards.find((c) => c.id === updated.card!.id);
        const day = today.getDate();
        const month = today.getMonth();
        const year = today.getFullYear();

        if (cardData && day > cardData.closingDay) {
          const nextMonth = month + 1;
          if (nextMonth > 11) {
            updated.billing_month = `${year + 1}-01`;
          } else {
            updated.billing_month = `${year}-${String(nextMonth + 1).padStart(2, '0')}`;
          }
        } else {
          updated.billing_month = `${year}-${String(month + 1).padStart(2, '0')}`;
        }
      } else {
        updated.billing_month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      }
    }

    return updated;
  }
}

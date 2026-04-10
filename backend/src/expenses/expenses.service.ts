import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, and, sql, count } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module.js';
import * as schema from '../database/schema.js';
import type { CreateExpenseDto } from './dto/create-expense.dto.js';
import type { UpdateExpenseDto } from './dto/update-expense.dto.js';
import type { QueryExpenseDto } from './dto/query-expense.dto.js';

@Injectable()
export class ExpensesService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  /**
   * Lista lançamentos com filtros e paginação
   */
  async findAll(userId: string, query: QueryExpenseDto) {
    const page = query.page ?? 1;
    const perPage = query.per_page ?? 20;
    const offset = (page - 1) * perPage;

    // Montar condições dinâmicas
    const conditions = [eq(schema.expenses.userId, userId)];

    if (query.category_id) {
      conditions.push(eq(schema.expenses.categoryId, query.category_id));
    }
    if (query.payment_method) {
      conditions.push(eq(schema.expenses.paymentMethod, query.payment_method));
    }
    if (query.card_id) {
      conditions.push(eq(schema.expenses.cardId, query.card_id));
    }
    if (query.month) {
      conditions.push(eq(schema.expenses.billingMonth, query.month));
    }

    const whereClause = and(...conditions);

    // Contar total
    const [totalResult] = await this.db
      .select({ total: count() })
      .from(schema.expenses)
      .where(whereClause);

    const total = totalResult?.total ?? 0;

    // Buscar dados com joins
    const rows = await this.db
      .select({
        expense: schema.expenses,
        categoryName: schema.categories.name,
        categoryIcon: schema.categories.icon,
        cardName: schema.cards.name,
      })
      .from(schema.expenses)
      .leftJoin(schema.categories, eq(schema.expenses.categoryId, schema.categories.id))
      .leftJoin(schema.cards, eq(schema.expenses.cardId, schema.cards.id))
      .where(whereClause)
      .orderBy(sql`${schema.expenses.date} DESC`)
      .limit(perPage)
      .offset(offset);

    return {
      data: rows.map((row) => this.toResponse(row)),
      total,
      page,
      per_page: perPage,
    };
  }

  /**
   * Detalhes de um lançamento
   */
  async findOne(userId: string, expenseId: string) {
    const [row] = await this.db
      .select({
        expense: schema.expenses,
        categoryName: schema.categories.name,
        categoryIcon: schema.categories.icon,
        cardName: schema.cards.name,
      })
      .from(schema.expenses)
      .leftJoin(schema.categories, eq(schema.expenses.categoryId, schema.categories.id))
      .leftJoin(schema.cards, eq(schema.expenses.cardId, schema.cards.id))
      .where(eq(schema.expenses.id, expenseId))
      .limit(1);

    if (!row) {
      throw new NotFoundException('Lançamento não encontrado');
    }

    if (row.expense.userId !== userId) {
      throw new ForbiddenException('Lançamento pertence a outro usuário');
    }

    return this.toResponse(row);
  }

  /**
   * Cria lançamento(s) — se installments > 1, gera N parcelas
   */
  async create(userId: string, dto: CreateExpenseDto) {
    const installments = dto.installments ?? 1;
    const totalAmount = dto.total_amount;
    const date = dto.date ? new Date(dto.date) : new Date();

    // Buscar cartão se informado (para calcular billing_month)
    let card: typeof schema.cards.$inferSelect | null = null;
    if (dto.card_id) {
      const [cardRow] = await this.db
        .select()
        .from(schema.cards)
        .where(and(eq(schema.cards.id, dto.card_id), eq(schema.cards.userId, userId)))
        .limit(1);

      if (!cardRow) {
        throw new NotFoundException('Cartão não encontrado');
      }
      card = cardRow;
    }

    // Calcular valor das parcelas com regra de arredondamento
    const baseAmount = Math.floor((totalAmount / installments) * 100) / 100;
    const remainder = Math.round((totalAmount - baseAmount * installments) * 100) / 100;

    // Gerar installment_group_id se parcelado
    const groupId = installments > 1
      ? crypto.randomUUID()
      : null;

    const expensesToInsert = [];

    for (let i = 1; i <= installments; i++) {
      // Primeira parcela absorve o centavo excedente
      const installmentAmount = i === 1 ? baseAmount + remainder : baseAmount;

      // Calcular data da parcela (mês a mês)
      const installmentDate = new Date(date);
      installmentDate.setMonth(installmentDate.getMonth() + (i - 1));

      // Calcular billing_month
      const billingMonth = this.calculateBillingMonth(
        installmentDate,
        dto.payment_method,
        card,
      );

      expensesToInsert.push({
        userId,
        description: dto.description,
        totalAmount: totalAmount.toString(),
        installmentAmount: installmentAmount.toString(),
        installments,
        installmentNumber: i,
        installmentGroupId: groupId,
        categoryId: dto.category_id ?? null,
        cardId: dto.card_id ?? null,
        paymentMethod: dto.payment_method,
        date: installmentDate,
        billingMonth,
        confirmed: dto.confirmed ?? false,
        messageId: dto.message_id ?? null,
      });
    }

    const inserted = await this.db
      .insert(schema.expenses)
      .values(expensesToInsert)
      .returning();

    // Retornar com joins para ter category/card info
    if (inserted.length === 1) {
      return this.findOne(userId, inserted[0]!.id);
    }

    // Parcelado — retornar todas as parcelas
    const ids = inserted.map((e) => e.id);
    const rows = await this.db
      .select({
        expense: schema.expenses,
        categoryName: schema.categories.name,
        categoryIcon: schema.categories.icon,
        cardName: schema.cards.name,
      })
      .from(schema.expenses)
      .leftJoin(schema.categories, eq(schema.expenses.categoryId, schema.categories.id))
      .leftJoin(schema.cards, eq(schema.expenses.cardId, schema.cards.id))
      .where(sql`${schema.expenses.id} IN ${ids}`)
      .orderBy(schema.expenses.installmentNumber);

    return rows.map((row) => this.toResponse(row));
  }

  /**
   * Edita um lançamento individual
   */
  async update(userId: string, expenseId: string, dto: UpdateExpenseDto) {
    const [existing] = await this.db
      .select()
      .from(schema.expenses)
      .where(eq(schema.expenses.id, expenseId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Lançamento não encontrado');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('Lançamento pertence a outro usuário');
    }

    const updateData: Record<string, unknown> = {};

    if (dto.description !== undefined) updateData['description'] = dto.description;
    if (dto.payment_method !== undefined) updateData['paymentMethod'] = dto.payment_method;
    if (dto.category_id !== undefined) updateData['categoryId'] = dto.category_id;
    if (dto.card_id !== undefined) updateData['cardId'] = dto.card_id;
    if (dto.confirmed !== undefined) updateData['confirmed'] = dto.confirmed;

    if (dto.date !== undefined) {
      updateData['date'] = new Date(dto.date);
    }

    // Se mudou valor total, recalcular installment_amount
    if (dto.total_amount !== undefined) {
      updateData['totalAmount'] = dto.total_amount.toString();
      const installmentAmount = dto.total_amount / existing.installments;
      updateData['installmentAmount'] = installmentAmount.toString();
    }

    // Se mudou método/cartão/data, recalcular billing_month
    if (dto.payment_method !== undefined || dto.card_id !== undefined || dto.date !== undefined) {
      const paymentMethod = dto.payment_method ?? existing.paymentMethod;
      const cardId = dto.card_id !== undefined ? dto.card_id : existing.cardId;
      const expenseDate = dto.date ? new Date(dto.date) : existing.date;

      let card: typeof schema.cards.$inferSelect | null = null;
      if (cardId) {
        const [cardRow] = await this.db
          .select()
          .from(schema.cards)
          .where(eq(schema.cards.id, cardId))
          .limit(1);
        card = cardRow ?? null;
      }

      updateData['billingMonth'] = this.calculateBillingMonth(expenseDate, paymentMethod, card);
    }

    if (Object.keys(updateData).length === 0) {
      return this.findOne(userId, expenseId);
    }

    await this.db
      .update(schema.expenses)
      .set(updateData)
      .where(eq(schema.expenses.id, expenseId));

    return this.findOne(userId, expenseId);
  }

  /**
   * Exclui um lançamento
   */
  async remove(userId: string, expenseId: string) {
    const [existing] = await this.db
      .select()
      .from(schema.expenses)
      .where(eq(schema.expenses.id, expenseId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Lançamento não encontrado');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('Lançamento pertence a outro usuário');
    }

    await this.db
      .delete(schema.expenses)
      .where(eq(schema.expenses.id, expenseId));

    return { message: 'Lançamento excluído com sucesso' };
  }

  /**
   * Lista todas as parcelas de uma compra (por installment_group_id)
   */
  async findInstallments(userId: string, groupId: string) {
    const rows = await this.db
      .select({
        expense: schema.expenses,
        categoryName: schema.categories.name,
        categoryIcon: schema.categories.icon,
        cardName: schema.cards.name,
      })
      .from(schema.expenses)
      .leftJoin(schema.categories, eq(schema.expenses.categoryId, schema.categories.id))
      .leftJoin(schema.cards, eq(schema.expenses.cardId, schema.cards.id))
      .where(
        and(
          eq(schema.expenses.installmentGroupId, groupId),
          eq(schema.expenses.userId, userId),
        ),
      )
      .orderBy(schema.expenses.installmentNumber);

    if (rows.length === 0) {
      throw new NotFoundException('Parcelas não encontradas');
    }

    return rows.map((row) => this.toResponse(row));
  }

  /**
   * Calcula billing_month baseado na data, método e cartão
   *
   * Regras:
   * - Crédito com cartão: usa ciclo de fatura (closing_day)
   *   - Se date.day <= closing_day → billing_month = mês da date
   *   - Se date.day > closing_day → billing_month = mês seguinte
   * - Crédito sem cartão / Débito / Pix / Dinheiro: mês calendário
   */
  private calculateBillingMonth(
    date: Date,
    paymentMethod: string,
    card: typeof schema.cards.$inferSelect | null,
  ): string {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed
    const day = date.getDate();

    if (paymentMethod === 'credit' && card) {
      // Se o dia do gasto é DEPOIS do fechamento, entra na fatura do mês seguinte
      if (day > card.closingDay) {
        const nextMonth = month + 1;
        if (nextMonth > 11) {
          return `${year + 1}-01`;
        }
        return `${year}-${String(nextMonth + 1).padStart(2, '0')}`;
      }
      // Se é no dia ou antes do fechamento, entra na fatura do mês atual
      return `${year}-${String(month + 1).padStart(2, '0')}`;
    }

    // Fallback: mês calendário
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  }

  private toResponse(row: {
    expense: typeof schema.expenses.$inferSelect;
    categoryName: string | null;
    categoryIcon: string | null;
    cardName: string | null;
  }) {
    const { expense } = row;
    return {
      id: expense.id,
      description: expense.description,
      total_amount: parseFloat(expense.totalAmount),
      installment_amount: parseFloat(expense.installmentAmount),
      installments: expense.installments,
      installment_number: expense.installmentNumber,
      installment_group_id: expense.installmentGroupId,
      category: expense.categoryId
        ? { id: expense.categoryId, name: row.categoryName!, icon: row.categoryIcon! }
        : null,
      card: expense.cardId
        ? { id: expense.cardId, name: row.cardName! }
        : null,
      payment_method: expense.paymentMethod,
      date: expense.date.toISOString().split('T')[0],
      billing_month: expense.billingMonth,
      confirmed: expense.confirmed,
      created_at: expense.createdAt.toISOString(),
    };
  }
}

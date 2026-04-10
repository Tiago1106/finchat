import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildInterpretExpensePrompt } from './prompts/interpret-expense.prompt.js';

export interface OllamaInterpretation {
  amount: number | null;
  description: string;
  installments: number;
  payment_method: 'credit' | 'debit' | 'pix' | 'cash' | null;
  card_name: string | null;
  category_name: string | null;
}

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('OLLAMA_BASE_URL') ??
      'http://localhost:11434';
    this.model =
      this.configService.get<string>('OLLAMA_MODEL') ?? 'llama3.2:3b';
  }

  /**
   * Interpreta uma mensagem de gasto usando o Ollama.
   * Se o Ollama falhar ou não responder, usa fallback regex.
   */
  async interpretExpense(
    text: string,
    categories: { id: string; name: string }[],
    cards: { id: string; name: string }[],
  ): Promise<OllamaInterpretation> {
    try {
      const systemPrompt = buildInterpretExpensePrompt(categories, cards);
      const result = await this.callOllama(systemPrompt, text);

      if (result) {
        return this.validateInterpretation(result);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Ollama falhou, usando fallback regex: ${msg}`);
    }

    // Fallback: parsing com regex
    return this.fallbackParse(text);
  }

  /**
   * Chama a API do Ollama (POST /api/generate)
   */
  private async callOllama(
    systemPrompt: string,
    userMessage: string,
  ): Promise<OllamaInterpretation | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          stream: false,
          options: {
            temperature: 0.1,
            num_predict: 256,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.warn(`Ollama HTTP ${response.status}`);
        return null;
      }

      const data = (await response.json()) as {
        message?: { content?: string };
      };
      const content = data.message?.content?.trim();

      if (!content) {
        this.logger.warn('Ollama retornou resposta vazia');
        return null;
      }

      this.logger.debug(`Ollama raw response: ${content}`);

      // Tentar extrair JSON da resposta (pode vir com markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.warn('Ollama não retornou JSON válido');
        return null;
      }

      return JSON.parse(jsonMatch[0]) as OllamaInterpretation;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Valida e normaliza a interpretação do Ollama
   */
  private validateInterpretation(
    raw: OllamaInterpretation,
  ): OllamaInterpretation {
    return {
      amount: typeof raw.amount === 'number' ? raw.amount : null,
      description:
        typeof raw.description === 'string' && raw.description.length > 0
          ? raw.description
          : 'Gasto',
      installments:
        typeof raw.installments === 'number' && raw.installments >= 1
          ? raw.installments
          : 1,
      payment_method: this.normalizePaymentMethod(raw.payment_method),
      card_name:
        typeof raw.card_name === 'string' && raw.card_name.length > 0
          ? raw.card_name
          : null,
      category_name:
        typeof raw.category_name === 'string' && raw.category_name.length > 0
          ? raw.category_name
          : null,
    };
  }

  private normalizePaymentMethod(
    method: string | null | undefined,
  ): 'credit' | 'debit' | 'pix' | 'cash' | null {
    if (!method) return null;
    const m = method.toLowerCase();
    if (m === 'credit' || m === 'crédito' || m === 'credito') return 'credit';
    if (m === 'debit' || m === 'débito' || m === 'debito') return 'debit';
    if (m === 'pix') return 'pix';
    if (m === 'cash' || m === 'dinheiro') return 'cash';
    return null;
  }

  /**
   * Fallback: parsing simples com regex quando Ollama não está disponível.
   *
   * Padrões suportados:
   * - "300 ração 3x nubank"
   * - "ração 300 pix"
   * - "50.90 gasolina"
   */
  fallbackParse(text: string): OllamaInterpretation {
    const normalized = text.trim().toLowerCase();

    // Extrair valor numérico
    const amountMatch = normalized.match(
      /(\d+(?:[.,]\d{1,2})?)/,
    );
    const amount = amountMatch
      ? parseFloat(amountMatch[1]!.replace(',', '.'))
      : null;

    // Extrair parcelas (Nx ou NX)
    const installmentMatch = normalized.match(/(\d+)\s*x\b/i);
    const installments = installmentMatch
      ? parseInt(installmentMatch[1]!, 10)
      : 1;

    // Extrair método de pagamento
    let paymentMethod: 'credit' | 'debit' | 'pix' | 'cash' | null = null;
    if (/\bpix\b/.test(normalized)) paymentMethod = 'pix';
    else if (/\bd[eé]bito\b/.test(normalized)) paymentMethod = 'debit';
    else if (/\bdinheiro\b|\bcash\b/.test(normalized)) paymentMethod = 'cash';
    else if (/\bcr[eé]dito\b/.test(normalized)) paymentMethod = 'credit';
    else if (installments > 1) paymentMethod = 'credit';

    // Extrair descrição (remover valor, parcelas, método de pagamento e palavras-chave)
    let description = normalized
      .replace(/\d+(?:[.,]\d{1,2})?/g, '')
      .replace(/\d+\s*x\b/gi, '')
      .replace(
        /\b(pix|d[eé]bito|debito|dinheiro|cash|cr[eé]dito|credito)\b/gi,
        '',
      )
      .trim();

    // Capitalize primeira letra
    if (description.length > 0) {
      description =
        description.charAt(0).toUpperCase() + description.slice(1);
    } else {
      description = 'Gasto';
    }

    // Limpar espaços extras
    description = description.replace(/\s+/g, ' ').trim();

    return {
      amount,
      description,
      installments,
      payment_method: paymentMethod,
      card_name: null, // Fallback não identifica cartão
      category_name: null, // Fallback não categoriza
    };
  }
}

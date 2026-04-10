import { Injectable, Inject } from '@nestjs/common';
import { eq, and, sql, ne } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module.js';
import * as schema from '../database/schema.js';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  /**
   * Resumo do mês: totais de crédito e direto + comparação com mês anterior
   */
  async getSummary(userId: string, month: string) {
    // Total do mês atual
    const currentRows = await this.db
      .select({
        paymentMethod: schema.expenses.paymentMethod,
        total: sql<string>`SUM(${schema.expenses.installmentAmount})`,
      })
      .from(schema.expenses)
      .where(
        and(
          eq(schema.expenses.userId, userId),
          eq(schema.expenses.billingMonth, month),
          eq(schema.expenses.confirmed, true),
        ),
      )
      .groupBy(schema.expenses.paymentMethod);

    let creditTotal = 0;
    let directTotal = 0;

    for (const row of currentRows) {
      const amount = parseFloat(row.total) || 0;
      if (row.paymentMethod === 'credit') {
        creditTotal += amount;
      } else {
        directTotal += amount;
      }
    }

    const total = Math.round((creditTotal + directTotal) * 100) / 100;
    creditTotal = Math.round(creditTotal * 100) / 100;
    directTotal = Math.round(directTotal * 100) / 100;

    // Total do mês anterior
    const previousMonth = this.getPreviousMonth(month);
    const [previousResult] = await this.db
      .select({
        total: sql<string>`COALESCE(SUM(${schema.expenses.installmentAmount}), 0)`,
      })
      .from(schema.expenses)
      .where(
        and(
          eq(schema.expenses.userId, userId),
          eq(schema.expenses.billingMonth, previousMonth),
          eq(schema.expenses.confirmed, true),
        ),
      );

    const previousMonthTotal = parseFloat(previousResult?.total ?? '0');
    let variationPercentage: number | null = null;

    if (previousMonthTotal > 0) {
      variationPercentage =
        Math.round(((total - previousMonthTotal) / previousMonthTotal) * 10000) / 100;
    }

    return {
      month,
      total,
      credit_total: creditTotal,
      direct_total: directTotal,
      previous_month_total: previousMonthTotal > 0 ? previousMonthTotal : null,
      variation_percentage: variationPercentage,
    };
  }

  /**
   * Gastos por categoria no mês
   */
  async getByCategory(userId: string, month: string) {
    const rows = await this.db
      .select({
        categoryId: schema.expenses.categoryId,
        categoryName: schema.categories.name,
        categoryIcon: schema.categories.icon,
        total: sql<string>`SUM(${schema.expenses.installmentAmount})`,
      })
      .from(schema.expenses)
      .leftJoin(
        schema.categories,
        eq(schema.expenses.categoryId, schema.categories.id),
      )
      .where(
        and(
          eq(schema.expenses.userId, userId),
          eq(schema.expenses.billingMonth, month),
          eq(schema.expenses.confirmed, true),
        ),
      )
      .groupBy(
        schema.expenses.categoryId,
        schema.categories.name,
        schema.categories.icon,
      )
      .orderBy(sql`SUM(${schema.expenses.installmentAmount}) DESC`);

    const grandTotal = rows.reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0);

    const categories = rows.map((row) => ({
      id: row.categoryId ?? 'sem-categoria',
      name: row.categoryName ?? 'Sem categoria',
      icon: row.categoryIcon ?? 'help-circle',
      total: Math.round((parseFloat(row.total) || 0) * 100) / 100,
      percentage:
        grandTotal > 0
          ? Math.round(((parseFloat(row.total) || 0) / grandTotal) * 10000) / 100
          : 0,
    }));

    return { month, categories };
  }

  /**
   * Faturas de crédito agrupadas por cartão
   */
  async getInvoices(userId: string, month: string) {
    // Buscar todos os gastos de crédito do mês com cartão
    const rows = await this.db
      .select({
        expense: schema.expenses,
        cardId: schema.cards.id,
        cardName: schema.cards.name,
        closingDay: schema.cards.closingDay,
        dueDay: schema.cards.dueDay,
        creditLimit: schema.cards.creditLimit,
        categoryName: schema.categories.name,
      })
      .from(schema.expenses)
      .innerJoin(schema.cards, eq(schema.expenses.cardId, schema.cards.id))
      .leftJoin(
        schema.categories,
        eq(schema.expenses.categoryId, schema.categories.id),
      )
      .where(
        and(
          eq(schema.expenses.userId, userId),
          eq(schema.expenses.billingMonth, month),
          eq(schema.expenses.paymentMethod, 'credit'),
          eq(schema.expenses.confirmed, true),
        ),
      )
      .orderBy(schema.expenses.date);

    // Agrupar por cartão
    const cardMap = new Map<
      string,
      {
        card: {
          id: string;
          name: string;
          closing_day: number;
          due_day: number;
          credit_limit: number | null;
        };
        expenses: {
          id: string;
          description: string;
          installment_amount: number;
          installment_number: number;
          installments: number;
          category_name: string | null;
        }[];
      }
    >();

    for (const row of rows) {
      const cardId = row.cardId;
      if (!cardMap.has(cardId)) {
        cardMap.set(cardId, {
          card: {
            id: cardId,
            name: row.cardName,
            closing_day: row.closingDay,
            due_day: row.dueDay,
            credit_limit: row.creditLimit ? parseFloat(String(row.creditLimit)) : null,
          },
          expenses: [],
        });
      }

      cardMap.get(cardId)!.expenses.push({
        id: row.expense.id,
        description: row.expense.description,
        installment_amount: parseFloat(row.expense.installmentAmount),
        installment_number: row.expense.installmentNumber,
        installments: row.expense.installments,
        category_name: row.categoryName,
      });
    }

    // Montar resposta com totais
    const [year, monthNum] = month.split('-').map(Number) as [number, number];
    const invoices = Array.from(cardMap.values()).map((entry) => {
      const total = Math.round(
        entry.expenses.reduce((sum, e) => sum + e.installment_amount, 0) * 100,
      ) / 100;

      const limitUsedPercentage = entry.card.credit_limit
        ? Math.round((total / entry.card.credit_limit) * 10000) / 100
        : null;

      // Calcular due_date: dueDay do mês selecionado
      const dueDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(entry.card.due_day).padStart(2, '0')}`;

      return {
        card: entry.card,
        total,
        limit_used_percentage: limitUsedPercentage,
        due_date: dueDate,
        expenses: entry.expenses,
      };
    });

    return { month, invoices };
  }

  /**
   * Gastos diretos (débito/pix/dinheiro) agrupados por método
   */
  async getDirectExpenses(userId: string, month: string) {
    const rows = await this.db
      .select({
        expense: schema.expenses,
        categoryName: schema.categories.name,
        categoryIcon: schema.categories.icon,
      })
      .from(schema.expenses)
      .leftJoin(
        schema.categories,
        eq(schema.expenses.categoryId, schema.categories.id),
      )
      .where(
        and(
          eq(schema.expenses.userId, userId),
          eq(schema.expenses.billingMonth, month),
          ne(schema.expenses.paymentMethod, 'credit'),
          eq(schema.expenses.confirmed, true),
        ),
      )
      .orderBy(sql`${schema.expenses.date} DESC`);

    // Agrupar por método de pagamento
    const methodMap = new Map<
      string,
      {
        payment_method: string;
        expenses: {
          id: string;
          description: string;
          total_amount: number;
          payment_method: string;
          category_name: string | null;
          category_icon: string | null;
          date: string;
        }[];
      }
    >();

    for (const row of rows) {
      const method = row.expense.paymentMethod;
      if (!methodMap.has(method)) {
        methodMap.set(method, {
          payment_method: method,
          expenses: [],
        });
      }

      methodMap.get(method)!.expenses.push({
        id: row.expense.id,
        description: row.expense.description,
        total_amount: parseFloat(row.expense.totalAmount),
        payment_method: method,
        category_name: row.categoryName,
        category_icon: row.categoryIcon,
        date: row.expense.date.toISOString().split('T')[0]!,
      });
    }

    const byMethod = Array.from(methodMap.values()).map((entry) => ({
      ...entry,
      total:
        Math.round(
          entry.expenses.reduce((sum, e) => sum + e.total_amount, 0) * 100,
        ) / 100,
    }));

    const grandTotal =
      Math.round(byMethod.reduce((sum, m) => sum + m.total, 0) * 100) / 100;

    return { month, total: grandTotal, by_method: byMethod };
  }

  /**
   * Evolução mensal dos gastos (últimos 12 meses)
   */
  async getTimeline(userId: string) {
    const rows = await this.db
      .select({
        month: schema.expenses.billingMonth,
        total: sql<string>`SUM(${schema.expenses.installmentAmount})`,
      })
      .from(schema.expenses)
      .where(
        and(
          eq(schema.expenses.userId, userId),
          eq(schema.expenses.confirmed, true),
        ),
      )
      .groupBy(schema.expenses.billingMonth)
      .orderBy(schema.expenses.billingMonth)
      .limit(12);

    const timeline = rows.map((row) => ({
      month: row.month,
      total: Math.round((parseFloat(row.total) || 0) * 100) / 100,
    }));

    return { timeline };
  }

  /**
   * Parcelas ativas: compras parceladas que ainda têm parcelas futuras
   */
  async getActiveInstallments(userId: string) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Buscar todas as parcelas de compras parceladas do usuário
    const rows = await this.db
      .select({
        expense: schema.expenses,
        cardName: schema.cards.name,
      })
      .from(schema.expenses)
      .leftJoin(schema.cards, eq(schema.expenses.cardId, schema.cards.id))
      .where(
        and(
          eq(schema.expenses.userId, userId),
          eq(schema.expenses.confirmed, true),
          sql`${schema.expenses.installments} > 1`,
        ),
      )
      .orderBy(schema.expenses.installmentGroupId, schema.expenses.installmentNumber);

    // Agrupar por installment_group_id
    const groupMap = new Map<
      string,
      {
        description: string;
        totalAmount: number;
        installments: number;
        installmentAmount: number;
        cardName: string | null;
        billingMonths: string[];
      }
    >();

    for (const row of rows) {
      const groupId = row.expense.installmentGroupId;
      if (!groupId) continue;

      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, {
          description: row.expense.description,
          totalAmount: parseFloat(row.expense.totalAmount),
          installments: row.expense.installments,
          installmentAmount: parseFloat(row.expense.installmentAmount),
          cardName: row.cardName,
          billingMonths: [],
        });
      }

      groupMap.get(groupId)!.billingMonths.push(row.expense.billingMonth);
    }

    // Calcular paid/remaining e filtrar apenas as que têm parcelas futuras
    const installments = [];

    for (const [groupId, group] of groupMap) {
      const paid = group.billingMonths.filter((bm) => bm <= currentMonth).length;
      const remaining = group.installments - paid;

      if (remaining <= 0) continue;

      // Próximo billing_month futuro
      const futureMonths = group.billingMonths
        .filter((bm) => bm > currentMonth)
        .sort();
      const nextBillingMonth = futureMonths[0] ?? group.billingMonths[group.billingMonths.length - 1]!;

      installments.push({
        installment_group_id: groupId,
        description: group.description,
        total_amount: group.totalAmount,
        installments: group.installments,
        paid,
        remaining,
        installment_amount: group.installmentAmount,
        card: group.cardName ? { name: group.cardName } : null,
        next_billing_month: nextBillingMonth,
      });
    }

    return { installments };
  }

  // ============================================================
  // Helpers
  // ============================================================

  private getPreviousMonth(month: string): string {
    const [year, monthNum] = month.split('-').map(Number) as [number, number];
    if (monthNum === 1) {
      return `${year - 1}-12`;
    }
    return `${year}-${String(monthNum - 1).padStart(2, '0')}`;
  }
}

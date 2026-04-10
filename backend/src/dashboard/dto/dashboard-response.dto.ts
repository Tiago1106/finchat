import { ApiProperty } from '@nestjs/swagger';

// ============================================================
// DTOs de resposta do DashboardModule
// ============================================================

// --- Summary ---

export class SummaryResponseDto {
  @ApiProperty({ example: '2026-04' })
  month!: string;

  @ApiProperty({ example: 2850.0 })
  total!: number;

  @ApiProperty({ example: 2100.0 })
  credit_total!: number;

  @ApiProperty({ example: 750.0 })
  direct_total!: number;

  @ApiProperty({ example: 3200.0, nullable: true })
  previous_month_total!: number | null;

  @ApiProperty({ example: -10.94, nullable: true })
  variation_percentage!: number | null;
}

// --- By Category ---

class CategoryBreakdownItem {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440020' })
  id!: string;

  @ApiProperty({ example: 'Alimentação' })
  name!: string;

  @ApiProperty({ example: 'utensils' })
  icon!: string;

  @ApiProperty({ example: 850.0 })
  total!: number;

  @ApiProperty({ example: 29.82 })
  percentage!: number;
}

export class ByCategoryResponseDto {
  @ApiProperty({ example: '2026-04' })
  month!: string;

  @ApiProperty({ type: [CategoryBreakdownItem] })
  categories!: CategoryBreakdownItem[];
}

// --- Invoices ---

class InvoiceCardInfo {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440030' })
  id!: string;

  @ApiProperty({ example: 'Nubank' })
  name!: string;

  @ApiProperty({ example: 3 })
  closing_day!: number;

  @ApiProperty({ example: 10 })
  due_day!: number;

  @ApiProperty({ example: 5000.0, nullable: true })
  credit_limit!: number | null;
}

class InvoiceExpenseItem {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440040' })
  id!: string;

  @ApiProperty({ example: 'Ração Golden' })
  description!: string;

  @ApiProperty({ example: 100.0 })
  installment_amount!: number;

  @ApiProperty({ example: 1 })
  installment_number!: number;

  @ApiProperty({ example: 3 })
  installments!: number;

  @ApiProperty({ example: 'Pets', nullable: true })
  category_name!: string | null;
}

class InvoiceItem {
  @ApiProperty({ type: InvoiceCardInfo })
  card!: InvoiceCardInfo;

  @ApiProperty({ example: 1500.0 })
  total!: number;

  @ApiProperty({ example: 30.0, nullable: true })
  limit_used_percentage!: number | null;

  @ApiProperty({ example: '2026-04-10' })
  due_date!: string;

  @ApiProperty({ type: [InvoiceExpenseItem] })
  expenses!: InvoiceExpenseItem[];
}

export class InvoicesResponseDto {
  @ApiProperty({ example: '2026-04' })
  month!: string;

  @ApiProperty({ type: [InvoiceItem] })
  invoices!: InvoiceItem[];
}

// --- Direct Expenses ---

class DirectExpenseItem {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440040' })
  id!: string;

  @ApiProperty({ example: 'Mercado' })
  description!: string;

  @ApiProperty({ example: 150.0 })
  total_amount!: number;

  @ApiProperty({ example: 'pix', enum: ['debit', 'pix', 'cash'] })
  payment_method!: string;

  @ApiProperty({ example: 'Alimentação', nullable: true })
  category_name!: string | null;

  @ApiProperty({ example: 'utensils', nullable: true })
  category_icon!: string | null;

  @ApiProperty({ example: '2026-04-09' })
  date!: string;
}

class DirectExpensesByMethod {
  @ApiProperty({ example: 'pix', enum: ['debit', 'pix', 'cash'] })
  payment_method!: string;

  @ApiProperty({ example: 500.0 })
  total!: number;

  @ApiProperty({ type: [DirectExpenseItem] })
  expenses!: DirectExpenseItem[];
}

export class DirectExpensesResponseDto {
  @ApiProperty({ example: '2026-04' })
  month!: string;

  @ApiProperty({ example: 750.0 })
  total!: number;

  @ApiProperty({ type: [DirectExpensesByMethod] })
  by_method!: DirectExpensesByMethod[];
}

// --- Timeline ---

class TimelineItem {
  @ApiProperty({ example: '2026-04' })
  month!: string;

  @ApiProperty({ example: 2850.0 })
  total!: number;
}

export class TimelineResponseDto {
  @ApiProperty({ type: [TimelineItem] })
  timeline!: TimelineItem[];
}

// --- Active Installments ---

class ActiveInstallmentCardInfo {
  @ApiProperty({ example: 'Nubank' })
  name!: string;
}

class ActiveInstallmentItem {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440050' })
  installment_group_id!: string;

  @ApiProperty({ example: 'Ração Golden' })
  description!: string;

  @ApiProperty({ example: 300.0 })
  total_amount!: number;

  @ApiProperty({ example: 3 })
  installments!: number;

  @ApiProperty({ example: 1 })
  paid!: number;

  @ApiProperty({ example: 2 })
  remaining!: number;

  @ApiProperty({ example: 100.0 })
  installment_amount!: number;

  @ApiProperty({ type: ActiveInstallmentCardInfo, nullable: true })
  card!: ActiveInstallmentCardInfo | null;

  @ApiProperty({ example: '2026-05' })
  next_billing_month!: string;
}

export class ActiveInstallmentsResponseDto {
  @ApiProperty({ type: [ActiveInstallmentItem] })
  installments!: ActiveInstallmentItem[];
}

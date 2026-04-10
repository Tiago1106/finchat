import { ApiProperty } from '@nestjs/swagger';

class CategoryInfo {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440020' })
  id!: string;

  @ApiProperty({ example: 'Pets' })
  name!: string;

  @ApiProperty({ example: 'paw-print' })
  icon!: string;
}

class CardInfo {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440030' })
  id!: string;

  @ApiProperty({ example: 'Nubank' })
  name!: string;
}

export class ExpenseResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440040' })
  id!: string;

  @ApiProperty({ example: 'Ração Golden' })
  description!: string;

  @ApiProperty({ example: 300.0 })
  total_amount!: number;

  @ApiProperty({ example: 100.0 })
  installment_amount!: number;

  @ApiProperty({ example: 3 })
  installments!: number;

  @ApiProperty({ example: 1 })
  installment_number!: number;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440050', nullable: true })
  installment_group_id!: string | null;

  @ApiProperty({ type: CategoryInfo, nullable: true })
  category!: CategoryInfo | null;

  @ApiProperty({ type: CardInfo, nullable: true })
  card!: CardInfo | null;

  @ApiProperty({ example: 'credit', enum: ['credit', 'debit', 'pix', 'cash'] })
  payment_method!: string;

  @ApiProperty({ example: '2026-04-07' })
  date!: string;

  @ApiProperty({ example: '2026-04' })
  billing_month!: string;

  @ApiProperty({ example: true })
  confirmed!: boolean;

  @ApiProperty({ example: '2026-04-07T20:30:00.000Z' })
  created_at!: string;
}

export class ExpenseListResponseDto {
  @ApiProperty({ type: [ExpenseResponseDto] })
  data!: ExpenseResponseDto[];

  @ApiProperty({ example: 1 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  per_page!: number;
}

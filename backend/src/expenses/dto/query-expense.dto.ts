import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryExpenseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440020',
    description: 'Filtrar por categoria',
    required: false,
  })
  @IsString()
  @IsOptional()
  category_id?: string;

  @ApiProperty({
    example: 'credit',
    description: 'Filtrar por método de pagamento',
    enum: ['credit', 'debit', 'pix', 'cash'],
    required: false,
  })
  @IsIn(['credit', 'debit', 'pix', 'cash'])
  @IsOptional()
  payment_method?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440030',
    description: 'Filtrar por cartão',
    required: false,
  })
  @IsString()
  @IsOptional()
  card_id?: string;

  @ApiProperty({
    example: '2026-04',
    description: 'Filtrar por mês de referência (billing_month)',
    required: false,
  })
  @IsString()
  @IsOptional()
  month?: string;

  @ApiProperty({ example: 1, description: 'Página', required: false, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({ example: 20, description: 'Itens por página', required: false, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  per_page?: number;
}

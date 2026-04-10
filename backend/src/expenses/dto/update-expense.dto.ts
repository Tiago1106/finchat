import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsUUID,
  IsIn,
  IsDateString,
  IsBoolean,
  Min,
} from 'class-validator';

export class UpdateExpenseDto {
  @ApiProperty({ example: 'Ração Premium', description: 'Descrição do gasto', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 350.0, description: 'Valor total da compra', required: false })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  total_amount?: number;

  @ApiProperty({
    example: 'credit',
    description: 'Método de pagamento',
    enum: ['credit', 'debit', 'pix', 'cash'],
    required: false,
  })
  @IsIn(['credit', 'debit', 'pix', 'cash'])
  @IsOptional()
  payment_method?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440020',
    description: 'ID da categoria',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  category_id?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440030',
    description: 'ID do cartão de crédito',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  card_id?: string;

  @ApiProperty({ example: '2026-04-07', description: 'Data do gasto', required: false })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({ example: true, description: 'Confirmar o lançamento', required: false })
  @IsBoolean()
  @IsOptional()
  confirmed?: boolean;
}

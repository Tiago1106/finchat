import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsUUID,
  IsIn,
  IsDateString,
  Min,
  IsBoolean,
} from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({ example: 'Ração Golden', description: 'Descrição do gasto' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 300.0, description: 'Valor total da compra' })
  @IsNumber()
  @Min(0.01)
  total_amount!: number;

  @ApiProperty({ example: 3, description: 'Número de parcelas (1 = à vista)', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  installments?: number;

  @ApiProperty({
    example: 'credit',
    description: 'Método de pagamento',
    enum: ['credit', 'debit', 'pix', 'cash'],
  })
  @IsIn(['credit', 'debit', 'pix', 'cash'])
  payment_method!: string;

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
    description: 'ID do cartão de crédito (somente para crédito)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  card_id?: string;

  @ApiProperty({
    example: '2026-04-07',
    description: 'Data do gasto (padrão = hoje)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({
    example: true,
    description: 'Se o lançamento está confirmado',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  confirmed?: boolean;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440099',
    description: 'ID da mensagem que gerou o lançamento (via chat)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  message_id?: string;
}

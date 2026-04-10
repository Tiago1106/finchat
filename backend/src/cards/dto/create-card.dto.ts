import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, Min, Max, IsOptional, IsNumber } from 'class-validator';

export class CreateCardDto {
  @ApiProperty({ example: 'Nubank', description: 'Apelido do cartão' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 3, description: 'Dia de fechamento da fatura (1-31)' })
  @IsInt()
  @Min(1)
  @Max(31)
  closing_day!: number;

  @ApiProperty({ example: 10, description: 'Dia de vencimento da fatura (1-31)' })
  @IsInt()
  @Min(1)
  @Max(31)
  due_day!: number;

  @ApiProperty({ example: 5000.00, description: 'Limite de crédito (opcional)', required: false })
  @IsNumber()
  @IsOptional()
  credit_limit?: number;
}

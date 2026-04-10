import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsNumber } from 'class-validator';

export class UpdateCardDto {
  @ApiProperty({ example: 'Nubank Ultravioleta', description: 'Apelido do cartão', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 3, description: 'Dia de fechamento da fatura (1-31)', required: false })
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  closing_day?: number;

  @ApiProperty({ example: 10, description: 'Dia de vencimento da fatura (1-31)', required: false })
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  due_day?: number;

  @ApiProperty({ example: 8000.00, description: 'Limite de crédito', required: false })
  @IsNumber()
  @IsOptional()
  credit_limit?: number;
}

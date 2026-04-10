import { ApiProperty } from '@nestjs/swagger';

export class CardResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440030' })
  id!: string;

  @ApiProperty({ example: 'Nubank' })
  name!: string;

  @ApiProperty({ example: 3 })
  closing_day!: number;

  @ApiProperty({ example: 10 })
  due_day!: number;

  @ApiProperty({ example: 5000.00, nullable: true })
  credit_limit!: number | null;

  @ApiProperty({ example: '2026-04-07T20:00:00.000Z' })
  created_at!: string;
}

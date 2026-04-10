import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440060' })
  id!: string;

  @ApiProperty({ example: 'Alimentação' })
  name!: string;

  @ApiProperty({ example: 'utensils' })
  icon!: string;

  @ApiProperty({ example: null, nullable: true, description: 'NULL para categorias globais' })
  user_id!: string | null;

  @ApiProperty({ example: true })
  is_global!: boolean;

  @ApiProperty({ example: '2026-04-07T20:00:00.000Z' })
  created_at!: string;
}

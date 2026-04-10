import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Assinaturas Digitais', description: 'Nome da categoria', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'repeat', description: 'Ícone representativo da categoria', required: false })
  @IsString()
  @IsOptional()
  icon?: string;
}

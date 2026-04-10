import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Assinaturas', description: 'Nome da categoria' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'repeat', description: 'Ícone representativo da categoria' })
  @IsString()
  @IsNotEmpty()
  icon!: string;
}

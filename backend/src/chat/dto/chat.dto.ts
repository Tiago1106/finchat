import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    example: null,
    description:
      'ID da conversa. Se null, cria uma nova conversa automaticamente.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  conversation_id?: string | null;

  @ApiProperty({
    example: '300 ração 3x nubank',
    description: 'Mensagem do usuário em linguagem natural',
  })
  @IsNotEmpty()
  @IsString()
  content!: string;
}

export class ConfirmExpenseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID da mensagem do assistente com a interpretação',
  })
  @IsNotEmpty()
  @IsUUID()
  message_id!: string;
}

export class CorrectExpenseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID da mensagem do assistente com a interpretação',
  })
  @IsNotEmpty()
  @IsUUID()
  message_id!: string;

  @ApiProperty({
    example: 'muda pra débito',
    description:
      'Texto do usuário com a correção desejada. Ex: "muda pra débito", "categoria alimentação", "250 reais"',
  })
  @IsNotEmpty()
  @IsString()
  content!: string;
}

// --- Response DTOs ---

export class InterpretationDto {
  @ApiProperty({ example: 'Ração' })
  description!: string;

  @ApiProperty({ example: 300.0 })
  total_amount!: number | null;

  @ApiProperty({ example: 3 })
  installments!: number;

  @ApiProperty({ example: 100.0 })
  installment_amount!: number | null;

  @ApiPropertyOptional({
    example: { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Pets' },
  })
  category!: { id: string; name: string } | null;

  @ApiProperty({ example: 'credit' })
  payment_method!: string | null;

  @ApiPropertyOptional({
    example: { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Nubank' },
  })
  card!: { id: string; name: string } | null;

  @ApiProperty({ example: '2026-04' })
  billing_month!: string | null;

  @ApiProperty({ example: '2026-04-09' })
  date!: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  message_id!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  conversation_id!: string;

  @ApiProperty()
  interpretation!: InterpretationDto;

  @ApiProperty({ example: true })
  confirmation_required!: boolean;

  @ApiPropertyOptional({ example: 'Entendi! Ração R$300 em 3x no Nubank (Pets). Confirma?' })
  assistant_message!: string;
}

export class ConfirmResponseDto {
  @ApiProperty({ example: 'Gasto salvo com sucesso!' })
  message!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  conversation_id!: string;

  @ApiProperty({
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    description: 'IDs dos lançamentos criados (pode ser mais de 1 se parcelado)',
  })
  expense_ids!: string[];
}

export class ConversationListItemDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiPropertyOptional({ example: 'Ração 3x Nubank' })
  title!: string | null;

  @ApiProperty({ example: '2026-04-09T15:30:00.000Z' })
  created_at!: string;

  @ApiProperty({ example: '2026-04-09T15:30:00.000Z' })
  updated_at!: string;
}

export class ConversationMessageDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'user', enum: ['user', 'assistant'] })
  role!: string;

  @ApiProperty({ example: '300 ração 3x nubank' })
  content!: string;

  @ApiPropertyOptional()
  interpretation!: InterpretationDto | null;

  @ApiProperty({ example: '2026-04-09T15:30:00.000Z' })
  created_at!: string;
}

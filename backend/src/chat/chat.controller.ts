import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import { ChatService } from './chat.service.js';
import {
  SendMessageDto,
  ConfirmExpenseDto,
  CorrectExpenseDto,
  MessageResponseDto,
  ConfirmResponseDto,
  ConversationListItemDto,
  ConversationMessageDto,
} from './dto/chat.dto.js';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({
    summary: 'Listar conversas',
    description: 'Retorna todas as conversas do usuário, ordenadas pela mais recente.',
  })
  @ApiResponse({ status: 200, type: [ConversationListItemDto] })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async listConversations(@Request() req: { user: { userId: string } }) {
    return this.chatService.listConversations(req.user.userId);
  }

  @Get('conversations/:id')
  @ApiOperation({
    summary: 'Mensagens de uma conversa',
    description: 'Retorna todas as mensagens de uma conversa, em ordem cronológica.',
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID da conversa',
  })
  @ApiResponse({ status: 200, type: [ConversationMessageDto] })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Conversa não encontrada' })
  async getConversationMessages(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
  ) {
    return this.chatService.getConversationMessages(req.user.userId, id);
  }

  @Post('message')
  @ApiOperation({
    summary: 'Enviar mensagem',
    description:
      'Envia uma mensagem em linguagem natural. A IA interpreta o gasto e retorna a interpretação para confirmação.',
  })
  @ApiResponse({ status: 201, type: MessageResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async sendMessage(
    @Request() req: { user: { userId: string } },
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(
      req.user.userId,
      dto.conversation_id,
      dto.content,
    );
  }

  @Post('confirm')
  @ApiOperation({
    summary: 'Confirmar gasto',
    description:
      'Confirma a interpretação de um gasto. Cria o(s) lançamento(s) no banco de dados.',
  })
  @ApiResponse({ status: 201, type: ConfirmResponseDto })
  @ApiResponse({ status: 400, description: 'Interpretação incompleta' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Mensagem não encontrada' })
  async confirmExpense(
    @Request() req: { user: { userId: string } },
    @Body() dto: ConfirmExpenseDto,
  ) {
    return this.chatService.confirmExpense(req.user.userId, dto.message_id);
  }

  @Post('correct')
  @ApiOperation({
    summary: 'Corrigir interpretação',
    description:
      'Corrige a interpretação enviando um texto com a correção. Ex: "muda pra débito", "categoria alimentação".',
  })
  @ApiResponse({ status: 201, type: MessageResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Mensagem não encontrada' })
  async correctExpense(
    @Request() req: { user: { userId: string } },
    @Body() dto: CorrectExpenseDto,
  ) {
    return this.chatService.correctExpense(
      req.user.userId,
      dto.message_id,
      dto.content,
    );
  }
}

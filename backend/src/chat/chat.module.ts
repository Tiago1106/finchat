import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';
import { OllamaModule } from '../ollama/ollama.module.js';
import { ExpensesModule } from '../expenses/expenses.module.js';

@Module({
  imports: [OllamaModule, ExpensesModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}

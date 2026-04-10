import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { CardsModule } from './cards/cards.module.js';
import { ExpensesModule } from './expenses/expenses.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { OllamaModule } from './ollama/ollama.module.js';
import { ChatModule } from './chat/chat.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    CategoriesModule,
    CardsModule,
    ExpensesModule,
    DashboardModule,
    OllamaModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix para todas as rotas
  app.setGlobalPrefix('api');

  // CORS habilitado para o app mobile
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Validation pipe global — valida DTOs automaticamente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger — documentação interativa da API
  const config = new DocumentBuilder()
    .setTitle('FinChat API')
    .setDescription('API do FinChat - Controle financeiro via chat com IA')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`FinChat API rodando em http://localhost:${port}`);
  console.log(`Swagger disponível em http://localhost:${port}/api/docs`);
}

bootstrap();

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CardsService } from './cards.service.js';
import { CreateCardDto } from './dto/create-card.dto.js';
import { UpdateCardDto } from './dto/update-card.dto.js';
import { CardResponseDto } from './dto/card-response.dto.js';
import { JwtAuthGuard } from '../auth/auth.guard.js';

@ApiTags('Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar cartões de crédito do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de cartões', type: [CardResponseDto] })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  findAll(@Request() req: { user: { userId: string } }) {
    return this.cardsService.findAll(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar novo cartão de crédito' })
  @ApiResponse({ status: 201, description: 'Cartão cadastrado com sucesso', type: CardResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  create(
    @Request() req: { user: { userId: string } },
    @Body() dto: CreateCardDto,
  ) {
    return this.cardsService.create(req.user.userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar cartão de crédito' })
  @ApiParam({ name: 'id', description: 'ID do cartão', example: '550e8400-e29b-41d4-a716-446655440030' })
  @ApiResponse({ status: 200, description: 'Cartão atualizado', type: CardResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Cartão pertence a outro usuário' })
  @ApiResponse({ status: 404, description: 'Cartão não encontrado' })
  update(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
  ) {
    return this.cardsService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir cartão de crédito' })
  @ApiParam({ name: 'id', description: 'ID do cartão', example: '550e8400-e29b-41d4-a716-446655440030' })
  @ApiResponse({ status: 200, description: 'Cartão excluído com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Cartão pertence a outro usuário' })
  @ApiResponse({ status: 404, description: 'Cartão não encontrado' })
  remove(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
  ) {
    return this.cardsService.remove(req.user.userId, id);
  }
}

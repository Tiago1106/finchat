import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
import { ExpensesService } from './expenses.service.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { UpdateExpenseDto } from './dto/update-expense.dto.js';
import { QueryExpenseDto } from './dto/query-expense.dto.js';
import { ExpenseResponseDto, ExpenseListResponseDto } from './dto/expense-response.dto.js';
import { JwtAuthGuard } from '../auth/auth.guard.js';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar lançamentos com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de lançamentos', type: ExpenseListResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  findAll(
    @Request() req: { user: { userId: string } },
    @Query() query: QueryExpenseDto,
  ) {
    return this.expensesService.findAll(req.user.userId, query);
  }

  @Get('installments/:groupId')
  @ApiOperation({ summary: 'Listar parcelas de uma compra' })
  @ApiParam({ name: 'groupId', description: 'ID do grupo de parcelas', example: '550e8400-e29b-41d4-a716-446655440050' })
  @ApiResponse({ status: 200, description: 'Lista de parcelas', type: [ExpenseResponseDto] })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Parcelas não encontradas' })
  findInstallments(
    @Request() req: { user: { userId: string } },
    @Param('groupId') groupId: string,
  ) {
    return this.expensesService.findInstallments(req.user.userId, groupId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de um lançamento' })
  @ApiParam({ name: 'id', description: 'ID do lançamento', example: '550e8400-e29b-41d4-a716-446655440040' })
  @ApiResponse({ status: 200, description: 'Detalhes do lançamento', type: ExpenseResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Lançamento não encontrado' })
  findOne(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
  ) {
    return this.expensesService.findOne(req.user.userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar lançamento (gera parcelas automaticamente se installments > 1)' })
  @ApiResponse({ status: 201, description: 'Lançamento(s) criado(s)', type: ExpenseResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Cartão não encontrado' })
  create(
    @Request() req: { user: { userId: string } },
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.create(req.user.userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar um lançamento' })
  @ApiParam({ name: 'id', description: 'ID do lançamento', example: '550e8400-e29b-41d4-a716-446655440040' })
  @ApiResponse({ status: 200, description: 'Lançamento atualizado', type: ExpenseResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Lançamento pertence a outro usuário' })
  @ApiResponse({ status: 404, description: 'Lançamento não encontrado' })
  update(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um lançamento' })
  @ApiParam({ name: 'id', description: 'ID do lançamento', example: '550e8400-e29b-41d4-a716-446655440040' })
  @ApiResponse({ status: 200, description: 'Lançamento excluído com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Lançamento pertence a outro usuário' })
  @ApiResponse({ status: 404, description: 'Lançamento não encontrado' })
  remove(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
  ) {
    return this.expensesService.remove(req.user.userId, id);
  }
}

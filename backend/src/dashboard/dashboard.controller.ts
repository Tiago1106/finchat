import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard.js';
import { DashboardService } from './dashboard.service.js';
import {
  SummaryResponseDto,
  ByCategoryResponseDto,
  InvoicesResponseDto,
  DirectExpensesResponseDto,
  TimelineResponseDto,
  ActiveInstallmentsResponseDto,
} from './dto/dashboard-response.dto.js';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary/:month')
  @ApiOperation({
    summary: 'Resumo do mês',
    description:
      'Retorna total gasto no mês, separado por crédito e direto, com comparação ao mês anterior.',
  })
  @ApiParam({
    name: 'month',
    example: '2026-04',
    description: 'Mês no formato YYYY-MM',
  })
  @ApiResponse({ status: 200, type: SummaryResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getSummary(
    @Request() req: { user: { userId: string } },
    @Param('month') month: string,
  ) {
    return this.dashboardService.getSummary(req.user.userId, month);
  }

  @Get('by-category/:month')
  @ApiOperation({
    summary: 'Gastos por categoria',
    description:
      'Retorna gastos agrupados por categoria no mês, com valor absoluto e percentual.',
  })
  @ApiParam({
    name: 'month',
    example: '2026-04',
    description: 'Mês no formato YYYY-MM',
  })
  @ApiResponse({ status: 200, type: ByCategoryResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getByCategory(
    @Request() req: { user: { userId: string } },
    @Param('month') month: string,
  ) {
    return this.dashboardService.getByCategory(req.user.userId, month);
  }

  @Get('invoices/:month')
  @ApiOperation({
    summary: 'Faturas de crédito do mês',
    description:
      'Retorna faturas de crédito agrupadas por cartão, com total, uso do limite e lista de gastos.',
  })
  @ApiParam({
    name: 'month',
    example: '2026-04',
    description: 'Mês no formato YYYY-MM',
  })
  @ApiResponse({ status: 200, type: InvoicesResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getInvoices(
    @Request() req: { user: { userId: string } },
    @Param('month') month: string,
  ) {
    return this.dashboardService.getInvoices(req.user.userId, month);
  }

  @Get('direct-expenses/:month')
  @ApiOperation({
    summary: 'Gastos diretos do mês',
    description:
      'Retorna gastos diretos (débito, pix, dinheiro) agrupados por método de pagamento.',
  })
  @ApiParam({
    name: 'month',
    example: '2026-04',
    description: 'Mês no formato YYYY-MM',
  })
  @ApiResponse({ status: 200, type: DirectExpensesResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getDirectExpenses(
    @Request() req: { user: { userId: string } },
    @Param('month') month: string,
  ) {
    return this.dashboardService.getDirectExpenses(req.user.userId, month);
  }

  @Get('timeline')
  @ApiOperation({
    summary: 'Evolução mensal dos gastos',
    description:
      'Retorna total gasto por mês (últimos 12 meses) para gráfico de linha.',
  })
  @ApiResponse({ status: 200, type: TimelineResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getTimeline(@Request() req: { user: { userId: string } }) {
    return this.dashboardService.getTimeline(req.user.userId);
  }

  @Get('active-installments')
  @ApiOperation({
    summary: 'Parcelas ativas',
    description:
      'Retorna compras parceladas que ainda têm parcelas futuras, com contagem de pagas/restantes.',
  })
  @ApiResponse({ status: 200, type: ActiveInstallmentsResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getActiveInstallments(@Request() req: { user: { userId: string } }) {
    return this.dashboardService.getActiveInstallments(req.user.userId);
  }
}

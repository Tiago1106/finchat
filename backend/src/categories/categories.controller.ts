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
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { CategoryResponseDto } from './dto/category-response.dto.js';
import { JwtAuthGuard } from '../auth/auth.guard.js';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorias (globais + do usuário)' })
  @ApiResponse({ status: 200, description: 'Lista de categorias', type: [CategoryResponseDto] })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  findAll(@Request() req: { user: { userId: string } }) {
    return this.categoriesService.findAll(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova categoria do usuário' })
  @ApiResponse({ status: 201, description: 'Categoria criada com sucesso', type: CategoryResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  create(
    @Request() req: { user: { userId: string } },
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(req.user.userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar categoria do usuário' })
  @ApiParam({ name: 'id', description: 'ID da categoria', example: '550e8400-e29b-41d4-a716-446655440060' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada', type: CategoryResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Não é possível editar categorias globais' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  update(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir categoria do usuário' })
  @ApiParam({ name: 'id', description: 'ID da categoria', example: '550e8400-e29b-41d4-a716-446655440060' })
  @ApiResponse({ status: 200, description: 'Categoria excluída com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Não é possível excluir categorias globais' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  remove(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
  ) {
    return this.categoriesService.remove(req.user.userId, id);
  }
}

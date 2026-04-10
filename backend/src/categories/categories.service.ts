import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, or, isNull, and } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module.js';
import * as schema from '../database/schema.js';
import type { CreateCategoryDto } from './dto/create-category.dto.js';
import type { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  /**
   * Lista categorias globais + categorias do usuário
   */
  async findAll(userId: string) {
    const rows = await this.db
      .select()
      .from(schema.categories)
      .where(
        or(
          eq(schema.categories.isGlobal, true),
          eq(schema.categories.userId, userId),
        ),
      )
      .orderBy(schema.categories.name);

    return rows.map((row) => this.toResponse(row));
  }

  /**
   * Cria categoria do usuário (is_global = false)
   */
  async create(userId: string, dto: CreateCategoryDto) {
    const [category] = await this.db
      .insert(schema.categories)
      .values({
        name: dto.name,
        icon: dto.icon,
        userId,
        isGlobal: false,
      })
      .returning();

    return this.toResponse(category!);
  }

  /**
   * Edita categoria do usuário (não permite editar globais)
   */
  async update(userId: string, categoryId: string, dto: UpdateCategoryDto) {
    const [existing] = await this.db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, categoryId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Categoria não encontrada');
    }

    if (existing.isGlobal) {
      throw new ForbiddenException('Não é possível editar categorias globais');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('Categoria pertence a outro usuário');
    }

    const updateData: Record<string, string> = {};
    if (dto.name !== undefined) updateData['name'] = dto.name;
    if (dto.icon !== undefined) updateData['icon'] = dto.icon;

    if (Object.keys(updateData).length === 0) {
      return this.toResponse(existing);
    }

    const [updated] = await this.db
      .update(schema.categories)
      .set(updateData)
      .where(eq(schema.categories.id, categoryId))
      .returning();

    return this.toResponse(updated!);
  }

  /**
   * Exclui categoria do usuário (não permite excluir globais)
   */
  async remove(userId: string, categoryId: string) {
    const [existing] = await this.db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, categoryId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Categoria não encontrada');
    }

    if (existing.isGlobal) {
      throw new ForbiddenException('Não é possível excluir categorias globais');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('Categoria pertence a outro usuário');
    }

    await this.db
      .delete(schema.categories)
      .where(eq(schema.categories.id, categoryId));

    return { message: 'Categoria excluída com sucesso' };
  }

  /**
   * Seed de categorias globais — executado uma vez na inicialização
   */
  async seedGlobalCategories() {
    const globalCategories = [
      { name: 'Alimentação', icon: 'utensils' },
      { name: 'Transporte', icon: 'car' },
      { name: 'Moradia', icon: 'home' },
      { name: 'Pets', icon: 'paw-print' },
      { name: 'Lazer', icon: 'gamepad-2' },
      { name: 'Saúde', icon: 'heart-pulse' },
      { name: 'Educação', icon: 'graduation-cap' },
      { name: 'Vestuário', icon: 'shirt' },
      { name: 'Outros', icon: 'ellipsis' },
    ];

    // Verificar se já existem categorias globais
    const existing = await this.db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.isGlobal, true))
      .limit(1);

    if (existing.length > 0) {
      return; // Já foram criadas
    }

    await this.db.insert(schema.categories).values(
      globalCategories.map((cat) => ({
        name: cat.name,
        icon: cat.icon,
        isGlobal: true,
        userId: null,
      })),
    );
  }

  private toResponse(row: typeof schema.categories.$inferSelect) {
    return {
      id: row.id,
      name: row.name,
      icon: row.icon,
      user_id: row.userId,
      is_global: row.isGlobal,
      created_at: row.createdAt.toISOString(),
    };
  }
}

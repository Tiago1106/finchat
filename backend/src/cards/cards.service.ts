import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module.js';
import * as schema from '../database/schema.js';
import type { CreateCardDto } from './dto/create-card.dto.js';
import type { UpdateCardDto } from './dto/update-card.dto.js';

@Injectable()
export class CardsService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  /**
   * Lista cartões do usuário
   */
  async findAll(userId: string) {
    const rows = await this.db
      .select()
      .from(schema.cards)
      .where(eq(schema.cards.userId, userId))
      .orderBy(schema.cards.name);

    return rows.map((row) => this.toResponse(row));
  }

  /**
   * Cadastra novo cartão
   */
  async create(userId: string, dto: CreateCardDto) {
    const [card] = await this.db
      .insert(schema.cards)
      .values({
        userId,
        name: dto.name,
        closingDay: dto.closing_day,
        dueDay: dto.due_day,
        creditLimit: dto.credit_limit?.toString() ?? null,
      })
      .returning();

    return this.toResponse(card!);
  }

  /**
   * Edita um cartão do usuário
   */
  async update(userId: string, cardId: string, dto: UpdateCardDto) {
    const [existing] = await this.db
      .select()
      .from(schema.cards)
      .where(eq(schema.cards.id, cardId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Cartão não encontrado');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('Cartão pertence a outro usuário');
    }

    const updateData: Record<string, string | number> = {};
    if (dto.name !== undefined) updateData['name'] = dto.name;
    if (dto.closing_day !== undefined) updateData['closingDay'] = dto.closing_day;
    if (dto.due_day !== undefined) updateData['dueDay'] = dto.due_day;
    if (dto.credit_limit !== undefined) updateData['creditLimit'] = dto.credit_limit.toString();

    if (Object.keys(updateData).length === 0) {
      return this.toResponse(existing);
    }

    const [updated] = await this.db
      .update(schema.cards)
      .set(updateData)
      .where(eq(schema.cards.id, cardId))
      .returning();

    return this.toResponse(updated!);
  }

  /**
   * Exclui um cartão do usuário
   */
  async remove(userId: string, cardId: string) {
    const [existing] = await this.db
      .select()
      .from(schema.cards)
      .where(eq(schema.cards.id, cardId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Cartão não encontrado');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('Cartão pertence a outro usuário');
    }

    await this.db
      .delete(schema.cards)
      .where(eq(schema.cards.id, cardId));

    return { message: 'Cartão excluído com sucesso' };
  }

  private toResponse(row: typeof schema.cards.$inferSelect) {
    return {
      id: row.id,
      name: row.name,
      closing_day: row.closingDay,
      due_day: row.dueDay,
      credit_limit: row.creditLimit ? parseFloat(row.creditLimit) : null,
      created_at: row.createdAt.toISOString(),
    };
  }
}

import { NotFoundException } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { DatabaseService, SqlParam } from '../database/database.service';
import { BaseEntity, likeParam, Repository } from '../database/repository';

/** Shared phone rule for public forms. */
export function phoneError(phone?: string): string | undefined {
  const v = (phone ?? '').trim();
  if (!v) return undefined;
  if (!/^[0-9+().\-\s]+$/.test(v)) return 'Use digits and + ( ) - only.';
  const n = v.replace(/\D/g, '').length;
  if (n < 10 || n > 15) return 'Enter a phone number with area code (10–15 digits).';
  return undefined;
}

export class AdminListQuery {
  @IsOptional() @IsString() @MaxLength(20) status?: string;
  @IsOptional() @IsString() @MaxLength(100) q?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number;
}

/** Admin helpers shared by membership inquiries and contact messages. */
export class SubmissionStore<T extends BaseEntity & { ipHash: string; status: string }> {
  constructor(
    private readonly db: DatabaseService,
    readonly repo: Repository<T>,
    private readonly searchColumns: string[],
    private readonly statuses: readonly string[],
    private readonly label: string,
  ) {}

  list(q: AdminListQuery) {
    const where: string[] = [];
    const params: SqlParam[] = [];
    if (q.status) { where.push('status = ?'); params.push(q.status); }
    if (q.q?.trim()) {
      const like = likeParam(q.q.trim());
      where.push(`(${this.searchColumns.map((c) => `${c} LIKE ? ESCAPE '\\'`).join(' OR ')})`);
      this.searchColumns.forEach(() => params.push(like));
    }
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 25;
    const total = this.repo.count(where, params);
    const items = this.repo.find({ where, params, orderBy: 'created_at DESC, id DESC', limit: pageSize, offset: (page - 1) * pageSize }).map((i) => this.strip(i));
    return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
  }

  strip(item: T) {
    const { ipHash: _ip, ...rest } = item;
    return rest;
  }

  get(id: number) {
    const item = this.repo.findById(id);
    if (!item) throw new NotFoundException(`${this.label} not found.`);
    return this.strip(item);
  }

  update(id: number, data: { status?: string; notes?: string }) {
    this.get(id);
    this.repo.update(id, { ...data });
    return this.get(id);
  }

  remove(id: number) {
    this.get(id);
    this.repo.delete(id);
  }

  countByStatus(table: string): Record<string, number> {
    const rows = this.db.all<{ status: string; n: number }>(`SELECT status, COUNT(*) AS n FROM ${table} GROUP BY status`);
    const out: Record<string, number> = { total: 0 };
    for (const s of this.statuses) out[s] = 0;
    for (const r of rows) { out[r.status] = r.n; out.total += r.n; }
    return out;
  }
}

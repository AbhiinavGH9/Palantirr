import { db } from "./db";
import {
  conflicts,
  conflictSources,
  type InsertConflict,
  type InsertConflictSource,
  type ConflictWithSources,
  type GlobalSummary,
  type Conflict
} from "@shared/schema";
import { eq, desc, ilike, sql } from "drizzle-orm";

export interface IStorage {
  getConflicts(): Promise<ConflictWithSources[]>;
  getConflict(id: number): Promise<ConflictWithSources | undefined>;
  getConflictsByCountry(countryName: string): Promise<ConflictWithSources[]>;
  getGlobalSummary(): Promise<GlobalSummary>;
  createConflict(conflict: InsertConflict): Promise<Conflict>;
  createConflictSource(source: InsertConflictSource): Promise<void>;
  updateConflict(id: number, data: Partial<InsertConflict>): Promise<Conflict>;
  deleteConflict(id: number): Promise<void>;
  clearConflicts(): Promise<void>; // Useful for daily updates if we just truncate and rebuild, or we can use upserts
}

export class DatabaseStorage implements IStorage {
  async getConflicts(): Promise<ConflictWithSources[]> {
    const allConflicts = await db.query.conflicts.findMany({
      with: {
        sources: true,
      },
      orderBy: [desc(conflicts.intensityScore)],
    });
    return allConflicts;
  }

  async getConflict(id: number): Promise<ConflictWithSources | undefined> {
    return await db.query.conflicts.findFirst({
      where: eq(conflicts.id, id),
      with: {
        sources: true,
      },
    });
  }

  async getConflictsByCountry(countryName: string): Promise<ConflictWithSources[]> {
    // Basic array search in jsonb, not perfect but sufficient for simple arrays
    const allConflicts = await this.getConflicts();
    return allConflicts.filter(c =>
      c.countries.some(country => country.toLowerCase() === countryName.toLowerCase())
    );
  }

  async getGlobalSummary(): Promise<GlobalSummary> {
    const allConflicts = await this.getConflicts();

    const activeConflictsCount = allConflicts.length;
    const totalEstimatedCasualties = allConflicts.reduce((sum, c) => sum + (c.estimatedDeaths || 0), 0);

    let mostIntenseConflict: ConflictWithSources | null = null;
    if (allConflicts.length > 0) {
      mostIntenseConflict = allConflicts.reduce((prev, current) =>
        (prev.intensityScore > current.intensityScore) ? prev : current
      );
    }

    const lastUpdated = allConflicts.length > 0 ? allConflicts[0].lastUpdated.toISOString() : null;

    return {
      activeConflictsCount,
      totalEstimatedCasualties,
      mostIntenseConflict,
      lastUpdated,
    };
  }

  async createConflict(conflict: InsertConflict): Promise<Conflict> {
    const [newConflict] = await db.insert(conflicts).values(conflict).returning();
    return newConflict;
  }

  async createConflictSource(source: InsertConflictSource): Promise<void> {
    await db.insert(conflictSources).values(source);
  }

  async updateConflict(id: number, data: Partial<InsertConflict>): Promise<Conflict> {
    const [updated] = await db.update(conflicts)
      .set({ ...data, lastUpdated: new Date() })
      .where(eq(conflicts.id, id))
      .returning();
    return updated;
  }

  async deleteConflict(id: number): Promise<void> {
    await db.delete(conflictSources).where(eq(conflictSources.conflictId, id));
    await db.delete(conflicts).where(eq(conflicts.id, id));
  }

  async clearConflicts(): Promise<void> {
    await db.delete(conflictSources);
    await db.delete(conflicts);
  }
}

export const storage = new DatabaseStorage();

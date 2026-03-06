import { pgTable, serial, text, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conflicts = pgTable("conflicts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  countries: jsonb("countries").$type<string[]>().notNull(),
  alliances: jsonb("alliances").$type<string[][]>().default([]),
  intensityScore: integer("intensity_score").notNull(), // 0-100
  startDate: timestamp("start_date"),
  estimatedDeaths: integer("estimated_deaths").default(0),
  militaryDeaths: integer("military_deaths").default(0),
  civilianDeaths: integer("civilian_deaths").default(0),
  prominentFiguresDeaths: jsonb("prominent_figures_deaths").$type<string[]>().default([]),
  dominatingCountry: text("dominating_country"),
  equipmentLoss: text("equipment_loss"),
  troopStrengthComparison: text("troop_strength_comparison"),
  lastUpdated: timestamp("last_updated").notNull(),
  confidenceScore: integer("confidence_score").notNull(), // 0-100
  methodologySummary: text("methodology_summary"),
  isManualOverride: boolean("is_manual_override").default(false),
});

export const conflictSources = pgTable("conflict_sources", {
  id: serial("id").primaryKey(),
  conflictId: integer("conflict_id").references(() => conflicts.id).notNull(),
  name: text("name").notNull(),
  tier: text("tier").notNull(), // A, B, C
  url: text("url").notNull(),
  lastChecked: timestamp("last_checked").notNull(),
});

export const conflictsRelations = relations(conflicts, ({ many }) => ({
  sources: many(conflictSources),
}));

export const conflictSourcesRelations = relations(conflictSources, ({ one }) => ({
  conflict: one(conflicts, {
    fields: [conflictSources.conflictId],
    references: [conflicts.id],
  }),
}));

export const insertConflictSchema = createInsertSchema(conflicts);
export const insertConflictSourceSchema = createInsertSchema(conflictSources);

export type Conflict = typeof conflicts.$inferSelect;
export type InsertConflict = typeof conflicts.$inferInsert;
export type ConflictSource = typeof conflictSources.$inferSelect;
export type InsertConflictSource = typeof conflictSources.$inferInsert;

export type ConflictWithSources = Conflict & {
  sources: ConflictSource[];
};

export type GlobalSummary = {
  activeConflictsCount: number;
  totalEstimatedCasualties: number;
  mostIntenseConflict: ConflictWithSources | null;
  lastUpdated: string | null;
};

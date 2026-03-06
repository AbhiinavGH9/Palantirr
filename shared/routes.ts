import { z } from "zod";

export const errorSchemas = {
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const conflictSourceSchema = z.object({
  id: z.number(),
  conflictId: z.number(),
  name: z.string(),
  tier: z.string(),
  url: z.string(),
  lastChecked: z.string().or(z.date()),
});

export const conflictWithSourcesSchema = z.object({
  id: z.number(),
  name: z.string(),
  countries: z.array(z.string()),
  alliances: z.array(z.array(z.string())).nullable().optional(),
  intensityScore: z.number(),
  startDate: z.string().nullable().or(z.date().nullable()),
  estimatedDeaths: z.number().nullable(),
  militaryDeaths: z.number().nullable(),
  civilianDeaths: z.number().nullable(),
  prominentFiguresDeaths: z.array(z.string()).nullable().optional(),
  dominatingCountry: z.string().nullable().optional(),
  equipmentLoss: z.string().nullable(),
  troopStrengthComparison: z.string().nullable(),
  lastUpdated: z.string().or(z.date()),
  confidenceScore: z.number(),
  methodologySummary: z.string().nullable(),
  isManualOverride: z.boolean(),
  sources: z.array(conflictSourceSchema),
});

export const globalSummarySchema = z.object({
  activeConflictsCount: z.number(),
  totalEstimatedCasualties: z.number(),
  mostIntenseConflict: conflictWithSourcesSchema.nullable(),
  lastUpdated: z.string().nullable().or(z.date().nullable()),
});

export const api = {
  conflicts: {
    list: {
      method: "GET" as const,
      path: "/api/conflicts" as const,
      responses: {
        200: z.array(conflictWithSourcesSchema),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/conflicts/:id" as const,
      responses: {
        200: conflictWithSourcesSchema,
        404: errorSchemas.notFound,
      },
    },
  },
  countries: {
    get: {
      method: "GET" as const,
      path: "/api/countries/:name" as const,
      responses: {
        200: z.array(conflictWithSourcesSchema),
        404: errorSchemas.notFound,
      },
    },
  },
  summary: {
    get: {
      method: "GET" as const,
      path: "/api/global-summary" as const,
      responses: {
        200: globalSummarySchema,
      },
    },
  },
  lastUpdated: {
    get: {
      method: "GET" as const,
      path: "/api/last-updated" as const,
      responses: {
        200: z.object({ lastUpdated: z.string().nullable().or(z.date().nullable()) }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ConflictResponse = z.infer<typeof conflictWithSourcesSchema>;
export type GlobalSummaryResponse = z.infer<typeof globalSummarySchema>;

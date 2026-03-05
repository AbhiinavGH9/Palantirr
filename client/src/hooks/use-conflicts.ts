import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

// Helper to log and parse Zod safely
function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    // In production, we might want to throw or return partial data
    // For this dashboard, throwing will trigger the nearest ErrorBoundary
    throw new Error(`Data validation failed for ${label}`);
  }
  return result.data;
}

export function useConflicts() {
  return useQuery({
    queryKey: [api.conflicts.list.path],
    queryFn: async () => {
      const res = await fetch(api.conflicts.list.path);
      if (!res.ok) throw new Error("Failed to fetch conflicts");
      const data = await res.json();
      return parseWithLogging(api.conflicts.list.responses[200], data, "conflicts.list");
    },
  });
}

export function useConflict(id: number | null) {
  return useQuery({
    queryKey: [api.conflicts.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = api.conflicts.get.path.replace(":id", String(id));
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch conflict");
      const data = await res.json();
      return parseWithLogging(api.conflicts.get.responses[200], data, "conflicts.get");
    },
    enabled: id !== null,
  });
}

export function useGlobalSummary() {
  return useQuery({
    queryKey: [api.summary.get.path],
    queryFn: async () => {
      const res = await fetch(api.summary.get.path);
      if (!res.ok) throw new Error("Failed to fetch global summary");
      const data = await res.json();
      return parseWithLogging(api.summary.get.responses[200], data, "summary.get");
    },
  });
}

export function useLastUpdated() {
  return useQuery({
    queryKey: [api.lastUpdated.get.path],
    queryFn: async () => {
      const res = await fetch(api.lastUpdated.get.path);
      if (!res.ok) throw new Error("Failed to fetch last updated timestamp");
      const data = await res.json();
      return parseWithLogging(api.lastUpdated.get.responses[200], data, "lastUpdated.get");
    },
  });
}

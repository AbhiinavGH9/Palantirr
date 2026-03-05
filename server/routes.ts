import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.conflicts.list.path, async (req, res) => {
    try {
      const data = await storage.getConflicts();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.conflicts.get.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const conflict = await storage.getConflict(id);
      if (!conflict) {
        return res.status(404).json({ message: "Conflict not found" });
      }
      res.status(200).json(conflict);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.countries.get.path, async (req, res) => {
    try {
      const country = req.params.name;
      const data = await storage.getConflictsByCountry(country);
      if (data.length === 0) {
        return res.status(404).json({ message: "No conflicts found for this country" });
      }
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.summary.get.path, async (req, res) => {
    try {
      const summary = await storage.getGlobalSummary();
      res.status(200).json(summary);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.lastUpdated.get.path, async (req, res) => {
    try {
      const summary = await storage.getGlobalSummary();
      res.status(200).json({ lastUpdated: summary.lastUpdated });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed data function to be called at startup for testing purposes
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getConflicts();
  if (existing.length === 0) {
    const mockConflict1 = await storage.createConflict({
      name: "Russo-Ukrainian War",
      countries: ["Ukraine", "Russia"],
      intensityScore: 92,
      startDate: new Date("2014-02-20"),
      estimatedDeaths: 500000,
      militaryDeaths: 450000,
      civilianDeaths: 50000,
      equipmentLoss: "High - Verified by Oryx",
      troopStrengthComparison: "Russia: 1.3M active | Ukraine: 800k active",
      lastUpdated: new Date(),
      confidenceScore: 85,
      methodologySummary: "Aggregated from official and independent OSINT sources.",
      isManualOverride: false,
    });

    await storage.createConflictSource({
      conflictId: mockConflict1.id,
      name: "Wikipedia - Russo-Ukrainian War",
      tier: "B",
      url: "https://en.wikipedia.org/wiki/Russo-Ukrainian_War",
      lastChecked: new Date()
    });

    const mockConflict2 = await storage.createConflict({
      name: "Sudan Conflict",
      countries: ["Sudan"],
      intensityScore: 80,
      startDate: new Date("2023-04-15"),
      estimatedDeaths: 150000,
      militaryDeaths: null,
      civilianDeaths: null,
      equipmentLoss: "Moderate",
      troopStrengthComparison: "SAF vs RSF",
      lastUpdated: new Date(),
      confidenceScore: 70,
      methodologySummary: "ACLED Data and UN reports.",
      isManualOverride: false,
    });

    await storage.createConflictSource({
      conflictId: mockConflict2.id,
      name: "ACLED Data",
      tier: "A",
      url: "https://acleddata.com/sudan/",
      lastChecked: new Date()
    });
    
    const mockConflict3 = await storage.createConflict({
      name: "Myanmar Civil War",
      countries: ["Myanmar"],
      intensityScore: 65,
      startDate: new Date("2021-05-05"),
      estimatedDeaths: 50000,
      militaryDeaths: null,
      civilianDeaths: null,
      equipmentLoss: "Low",
      troopStrengthComparison: "Tatmadaw vs EAOs",
      lastUpdated: new Date(),
      confidenceScore: 60,
      methodologySummary: "Local news and international observer reports.",
      isManualOverride: false,
    });

    await storage.createConflictSource({
      conflictId: mockConflict3.id,
      name: "Wikipedia - Myanmar Civil War",
      tier: "C",
      url: "https://en.wikipedia.org/wiki/Myanmar_civil_war_(2021%E2%80%93present)",
      lastChecked: new Date()
    });
  }
}

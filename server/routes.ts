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

  // -------------- ADMIN PARSING ENDPOINT --------------
  app.post("/api/admin/parse", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ message: "Invalid text input" });
      }

      // 1. Extract Name (Look for War, Conflict, Escalation, or first line)
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      let name = lines[0].length < 100 ? lines[0] : "Classified Operation " + Math.floor(Math.random() * 1000);
      const nameMatch = text.match(/([A-Z][a-z]+.*?(War|Conflict|Operation|Escalation).*)/i);
      if (nameMatch) name = nameMatch[1].split('.')[0].trim();

      // 2. Extract Numbers for Casualties
      const findNumberNear = (keyword: string) => {
        const regex = new RegExp(`(?:${keyword}).*?(\\d{1,3}(?:,\\d{3})*(?:\\.\\d+)?(?:\\s*(?:million|k|thousand))?)`, 'i');
        const match = text.match(regex);
        if (!match) return 0;
        let numStr = match[1].replace(/,/g, '').toLowerCase();
        let multiplier = 1;
        if (numStr.includes('million')) multiplier = 1000000;
        if (numStr.includes('k') || numStr.includes('thousand')) multiplier = 1000;
        return Math.round(parseFloat(numStr) * multiplier) || 0;
      };

      const militaryDeaths = findNumberNear("military casualties|military deaths|soldier|combatant");
      const civilianDeaths = findNumberNear("civilian casualties|civilian deaths|children|innocent");
      const totalCasualties = findNumberNear("total|estimated|casualties|dead") || (militaryDeaths + civilianDeaths) || 5000;

      // Ensure fallbacks
      const r_civ = civilianDeaths > 0 ? civilianDeaths : Math.round(totalCasualties * 0.4);
      const r_mil = militaryDeaths > 0 ? militaryDeaths : (totalCasualties - r_civ);
      const r_tot = totalCasualties > 0 ? totalCasualties : (r_civ + r_mil);

      // 3. Extract Nations
      const knownCountries = ["Iran", "United States", "USA", "Israel", "Russia", "Ukraine", "Lebanon", "Syria", "Yemen", "Palestine", "China", "Taiwan", "NATO", "UK", "France"];
      const countriesFound = knownCountries.filter(c => text.toLowerCase().includes(c.toLowerCase()));
      if (countriesFound.length === 0) countriesFound.push("Unknown Actors");

      // 4. Intensity
      let intensityScore = r_tot > 10000 ? 100 : (r_tot > 1000 ? 80 : 50);

      // 5. Sources
      const potentialSources = ["HRANA", "CSIS", "Human Rights Watch", "UN", "United Nations", "Mediazona", "ReliefWeb", "BBC", "Defense.gov"];
      const sourcesFound = potentialSources.filter(s => text.toLowerCase().includes(s.toLowerCase()));

      const insertData = {
        name: name.substring(0, 100),
        countries: countriesFound,
        intensityScore,
        estimatedDeaths: r_tot,
        militaryDeaths: r_mil,
        civilianDeaths: r_civ,
        lastUpdated: new Date(),
        confidenceScore: 85,
        isManualOverride: true
      };

      const inserted = await storage.createConflict(insertData);

      // Create Sources
      if (sourcesFound.length === 0) sourcesFound.push("Direct OSINT Feed");
      for (const s of sourcesFound) {
        await storage.createConflictSource({
          conflictId: inserted.id,
          name: s,
          tier: "A",
          url: "https://example.com/source",
          lastChecked: new Date()
        });
      }

      res.status(200).json(inserted);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to parse data" });
    }
  });

  // -------------- ADMIN MANAGEMENT ENDPOINTS -----------
  app.delete("/api/admin/conflicts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      await storage.deleteConflict(id);
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete conflict" });
    }
  });

  app.patch("/api/admin/conflicts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const updated = await storage.updateConflict(id, req.body);
      res.status(200).json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update conflict" });
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

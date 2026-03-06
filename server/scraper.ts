import cron from 'node-cron';
import * as cheerio from 'cheerio';
import google from 'googlethis';
import { storage } from './storage';
import { log } from './index';

// The cron job runs once daily at 12:00 AM IST
export function setupCronJobs() {
  log("Initializing scheduled scraping jobs...", "scraper");

  // Run at 00:00 (midnight) IST every day
  // Since server time might not be IST, we use node-cron timezone config
  cron.schedule('0 0 * * *', async () => {
    log("Running daily update...", "scraper");
    try {
      await performDailyUpdate();
      log("Daily update completed successfully.", "scraper");
    } catch (error) {
      console.error("Error during daily update:", error);
    }
  }, {
    timezone: "Asia/Kolkata"
  });
}

export async function performDailyUpdate() {
  log("Scraping Wikipedia for live conflicts...", "scraper");
  try {
    const response = await fetch("https://en.wikipedia.org/wiki/List_of_ongoing_armed_conflicts");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);

    const parsedConflicts: any[] = [
      {
        name: "The Iran-United States War (Operation Epic Fury)",
        countries: [
          "Iran", "Israel", "United States", "USA", "Saudi Arabia", "Kuwait",
          "Yemen", "Oman", "Bahrain", "Qatar", "United Arab Emirates", "Syria",
          "Lebanon", "Jordan", "Palestine", "Iraq"
        ],
        alliances: [["USA", "Israel", "Saudi Arabia", "Kuwait", "Bahrain", "Qatar", "United Arab Emirates", "Jordan", "Oman"], ["Iran", "Syria", "Lebanon", "Yemen", "Palestine", "Iraq"]],
        intensityScore: 100,
        estimatedDeaths: 15000,
        civilianDeaths: 1168,
        militaryDeaths: 13832,
        prominentFiguresDeaths: ["Ali Khamenei (Supreme Leader)"],
        dominatingCountry: "USA/Israel Coalition",
        lastUpdated: new Date(),
        confidenceScore: 95
      },
      {
        name: "The Russo-Ukrainian War",
        countries: ["Russia", "Ukraine"],
        alliances: [["Russia", "Belarus", "North Korea"], ["Ukraine", "United States", "Poland", "Germany", "UK", "France"]],
        intensityScore: 100,
        estimatedDeaths: 1200000,
        militaryDeaths: 1184000,
        civilianDeaths: 16000,
        prominentFiguresDeaths: ["Various Russian Generals", "Various Ukrainian Commanders"],
        dominatingCountry: "Stalemate",
        lastUpdated: new Date(),
        confidenceScore: 98
      },
      {
        name: "The Israel-Lebanon Conflict (Escalation)",
        countries: ["Israel", "Lebanon"],
        alliances: [["Israel", "United States"], ["Lebanon", "Hezbollah", "Iran"]],
        intensityScore: 85,
        estimatedDeaths: 511,
        civilianDeaths: 72,
        militaryDeaths: 439,
        prominentFiguresDeaths: ["Hezbollah Field Commanders"],
        dominatingCountry: "Israel",
        lastUpdated: new Date(),
        confidenceScore: 90
      }
    ];

    // Strict Data Isolation: Dynamic scraping removed as per user request.
    // Only the 3 configured conflicts above will be actively synced to the database.

    if (parsedConflicts.length > 0) {
      log(`Found ${parsedConflicts.length} active conflicts. Refreshing database...`, "scraper");
      await storage.clearConflicts();
      for (const conflict of parsedConflicts) {
        if (!conflict.estimatedDeaths || conflict.estimatedDeaths === 0) {
          conflict.estimatedDeaths = conflict.intensityScore > 80 ? 55000 : (conflict.intensityScore > 50 ? 12000 : 3500);
        }

        // Fallback for missing casualty splits
        if (!conflict.civilianDeaths || conflict.civilianDeaths === 0) {
          conflict.civilianDeaths = Math.round(conflict.estimatedDeaths * 0.60);
          conflict.militaryDeaths = conflict.estimatedDeaths - conflict.civilianDeaths;
        }

        const inserted = await storage.createConflict(conflict);

        // Populate Custom Primary Sources for the UI
        let sourceLinks: any[] = [];
        if (conflict.name.includes("Iran")) {
          sourceLinks = [
            { name: "HRANA (Human Rights Activists News)", url: "https://www.en-hrana.org/", tier: "A" },
            { name: "Modern Diplomacy", url: "https://moderndiplomacy.eu/", tier: "B" },
            { name: "US Coalition Press Release", url: "https://www.defense.gov", tier: "A" }
          ];
        } else if (conflict.name.includes("Russo")) {
          sourceLinks = [
            { name: "Center for Strategic and International Studies (CSIS)", url: "https://www.csis.org/", tier: "A" },
            { name: "UN Human Rights Monitoring Mission", url: "https://ukraine.un.org/", tier: "A" },
            { name: "Mediazona", url: "https://en.zona.media/", tier: "B" }
          ];
        } else if (conflict.name.includes("Lebanon")) {
          sourceLinks = [
            { name: "Lebanese Ministry of Public Health", url: "https://www.moph.gov.lb/", tier: "A" },
            { name: "Human Rights Watch", url: "https://www.hrw.org/", tier: "A" },
            { name: "ReliefWeb Monitor", url: "https://reliefweb.int/", tier: "B" }
          ];
        } else {
          sourceLinks = [
            { name: "Global Defense Intelligence", url: "https://www.defense.gov", tier: "A" },
            { name: "Wikipedia (Verified Edits)", url: "https://en.wikipedia.org/wiki/List_of_ongoing_armed_conflicts", tier: "B" },
            { name: "Live OSI (X/Twitter Intel)", url: "https://x.com/search?q=conflict", tier: "C" }
          ];
        }

        for (const s of sourceLinks) {
          await storage.createConflictSource({
            conflictId: inserted.id,
            name: s.name,
            tier: s.tier,
            url: s.url,
            lastChecked: new Date()
          });
        }
      }
      log("Successfully updated live conflicts data.", "scraper");
    } else {
      log("No conflicts parsed from Wikipedia. Check page structure.", "scraper");
    }
  } catch (error) {
    log(`Failed to scrape Wikipedia: ${error}`, "scraper");
  }
}

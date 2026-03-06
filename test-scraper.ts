import { performDailyUpdate } from "./server/scraper";

(async () => {
    console.log("Testing scraper...");
    await performDailyUpdate();
    console.log("Done.");
    process.exit(0);
})();

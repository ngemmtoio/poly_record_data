import "dotenv/config";
import { initDb } from "./db.ts";
import { createMarketManager } from "./servises/marketManager.ts";
import { recordPg } from "./record/index.ts";

(async () => {
    await initDb();

    const [btcManager, ethManager, solManager, xrpManager] = await Promise.all([
        createMarketManager("btc", [recordPg("btc")]),
        createMarketManager("eth", [recordPg("eth")]),
        createMarketManager("sol", [recordPg("sol")]),
        createMarketManager("xrp", [recordPg("xrp")]),
    ]);

    btcManager.start();
    ethManager.start();
    solManager.start();
    xrpManager.start();
})();
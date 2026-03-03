import {createMarketManager} from "./servises/marketManager.ts";
import {record} from "./record/index.ts";

(async () => {
    const btcRecord = record("btc-15-min", "btc");
    const ethRecord = record("eth-15-min", "eth");
    const solRecord = record("sol-15-min", "sol");
    const xrpRecord = record("xrp-15-min", "xrp");

    const btcManager = await createMarketManager("btc", [btcRecord]);
    const ethManager = await createMarketManager("eth", [ethRecord]);
    const solManager = await createMarketManager("sol", [solRecord]);
    const xrpManager = await createMarketManager("xrp", [xrpRecord]);

    btcManager.start();
    ethManager.start();
    solManager.start();
    xrpManager.start();
})();
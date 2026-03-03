import WebSocket from "ws";

type ChannelType = "market" | "user";

interface Auth {
    apiKey: string;
    secret: string;
    passphrase: string;
}

interface WSOptions {
    channelType: ChannelType;
    url: string;
    data: string[];
    auth?: Auth;
    messageCallback?: (message: any) => void;
    verbose?: boolean;
}

export function createPolymarketWS(options: WSOptions) {
    const { channelType, url, data, auth, messageCallback, verbose = false } = options;

    let ws: WebSocket;
    let pingInterval: NodeJS.Timeout;
    let manuallyClosed = false;

    function connect() {
        manuallyClosed = false;
        const fullUrl = `${url}/ws/${channelType}`;
        ws = new WebSocket(fullUrl);

        ws.on("open", () => {
            if (verbose) console.log(`[${channelType}] WS connected`);

            if (channelType === "market") {
                ws.send(JSON.stringify({
                    type: "market",
                    assets_ids: data,
                    event_type: "book",
                }));
            }

            pingInterval = setInterval(() => ws?.send("PING"), 10_000);
        });

        ws.on("message", (raw) => {
            try {
                const msg = JSON.parse(raw.toString());
                if (msg.event_type === "book") {
                    messageCallback?.(msg);
                }
            } catch {}
        });

        ws.on("close", () => {
            clearInterval(pingInterval);

            if (manuallyClosed) {
                if (verbose) console.log(`[${channelType}] WS closed manually`);
                return;
            }

            console.log(`[${channelType}] WS closed unexpectedly, reconnecting...`);
            reconnect();
        });

        ws.on("error", (err) => {
            console.error(`[${channelType}] WS error`, err);
        });
    }

    function reconnect() {
        setTimeout(connect, 5000);
    }

    function close() {
        manuallyClosed = true;
        clearInterval(pingInterval);
        ws?.close();
    }

    connect();

    return {
        getWS: () => ws,
        close,
    };
}

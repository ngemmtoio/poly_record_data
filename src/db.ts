import pg from "pg";

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function initDb() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS sessions (
            id SERIAL PRIMARY KEY,
            token VARCHAR(16) NOT NULL,
            slug VARCHAR(64) NOT NULL UNIQUE,
            outcome VARCHAR(8),
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS orderbook_snapshots (
            id SERIAL PRIMARY KEY,
            session_id INTEGER NOT NULL REFERENCES sessions(id),
            best_bid_up VARCHAR(16),
            best_bid_up_size VARCHAR(16),
            best_bid_down VARCHAR(16),
            best_bid_down_size VARCHAR(16),
            best_ask_up VARCHAR(16),
            best_ask_up_size VARCHAR(16),
            best_ask_down VARCHAR(16),
            best_ask_down_size VARCHAR(16),
            ws_time BIGINT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_snapshots_session ON orderbook_snapshots(session_id);
    `);
    console.log("✅ DB tables ready");
}

export default pool;
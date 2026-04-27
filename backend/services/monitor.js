const db = require("../config/db");
const { probe } = require("./probe");
const { recordCheck } = require("./checkHistory");

const INTERVAL_MS = 60 * 1000;

let running = false;
let timer = null;

const ensureResponseTimeColumn = async () => {
  const [rows] = await db.query(
    `SELECT 1
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'websites'
        AND COLUMN_NAME = 'responseTime'`
  );
  if (rows.length === 0) {
    await db.query("ALTER TABLE websites ADD COLUMN responseTime INT NULL");
  }
};

const ensureSchema = async () => {
  try {
    await ensureResponseTimeColumn();
  } catch (err) {
    console.error("[monitor] schema step failed:", err.message);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS website_checks (
        id BIGINT NOT NULL AUTO_INCREMENT,
        website_id INT NOT NULL,
        status VARCHAR(8) NOT NULL,
        httpStatusCode INT NOT NULL DEFAULT 0,
        responseTime INT NULL,
        errorType VARCHAR(64) NULL,
        checkedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_website_checkedAt (website_id, checkedAt),
        CONSTRAINT fk_website_checks_website
          FOREIGN KEY (website_id) REFERENCES websites(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } catch (err) {
    console.error("[monitor] schema step failed:", err.message);
  }
};

const fetchWebsites = async () => {
  const [rows] = await db.query("SELECT id, url FROM websites");
  return rows;
};

const updateWebsite = async (id, { status, httpStatusCode, responseTime }) => {
  await db.query(
    "UPDATE websites SET status = ?, httpStatusCode = ?, lastChecked = ?, responseTime = ? WHERE id = ?",
    [status, httpStatusCode, new Date(), responseTime, id]
  );
};

const runTick = async () => {
  if (running) {
    console.log("[monitor] previous tick still running — skipping this one");
    return;
  }
  running = true;
  const startedAt = Date.now();

  try {
    const websites = await fetchWebsites();
    console.log(`[monitor] checking ${websites.length} websites`);

    const results = await Promise.allSettled(
      websites.map(async ({ id, url }) => {
        try {
          const result = await probe(url);
          await updateWebsite(id, result);
          await recordCheck(id, result);
        } catch (err) {
          console.error(
            `[monitor] failed for id=${id} url=${url}: ${err.message}`
          );
          throw err;
        }
      })
    );

    const failed = results.filter((r) => r.status === "rejected").length;
    console.log(
      `[monitor] tick done in ${Date.now() - startedAt}ms (checked=${
        results.length
      }, failed=${failed})`
    );
  } catch (err) {
    console.error("[monitor] tick failed:", err.message);
  } finally {
    running = false;
  }
};

const startMonitor = async () => {
  if (timer) return;
  await ensureSchema();
  runTick();
  timer = setInterval(runTick, INTERVAL_MS);
  console.log(`[monitor] started (every ${INTERVAL_MS / 1000}s)`);
};

const stopMonitor = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

module.exports = { startMonitor, stopMonitor, runTick };

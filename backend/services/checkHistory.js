const db = require("../config/db");

const recordCheck = async (websiteId, result) => {
  const { status, httpStatusCode, responseTime, errorType } = result;
  await db.query(
    `INSERT INTO website_checks
       (website_id, status, httpStatusCode, responseTime, errorType, checkedAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [websiteId, status, httpStatusCode, responseTime, errorType, new Date()]
  );
};

const getHistory = async (websiteId, limit = 100) => {
  const [rows] = await db.query(
    `SELECT id, status, httpStatusCode, responseTime, errorType, checkedAt
       FROM website_checks
      WHERE website_id = ?
      ORDER BY checkedAt DESC
      LIMIT ?`,
    [websiteId, limit]
  );
  return rows;
};

const getUptime = async (websiteId, sinceDate) => {
  const [rows] = await db.query(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'Up' THEN 1 ELSE 0 END) AS up
     FROM website_checks
     WHERE website_id = ?
       AND checkedAt >= ?`,
    [websiteId, sinceDate]
  );
  const { total, up } = rows[0];
  const totalN = Number(total) || 0;
  const upN = Number(up) || 0;
  const percentage = totalN === 0 ? null : (upN / totalN) * 100;
  return { total: totalN, up: upN, percentage };
};

module.exports = { recordCheck, getHistory, getUptime };

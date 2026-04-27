const db = require("../config/db");
const { probe } = require("../services/probe");
const {
  recordCheck,
  getHistory,
  getUptime,
} = require("../services/checkHistory");

const UPTIME_WINDOWS = {
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

exports.addWebsite = async (req, res) => {
  const { url } = req.body;

  try {
    const result = await probe(url);
    const { status, httpStatusCode, responseTime } = result;

    const [insertResult] = await db.query(
      "INSERT INTO websites (url, status, lastChecked, httpStatusCode, responseTime) VALUES (?, ?, ?, ?, ?)",
      [url, status, new Date(), httpStatusCode, responseTime]
    );

    try {
      await recordCheck(insertResult.insertId, result);
    } catch (historyErr) {
      console.error("[addWebsite] recordCheck failed:", historyErr.message);
    }

    res.status(201).json({
      id: insertResult.insertId,
      url,
      status,
      httpStatusCode,
      responseTime,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllWebsites = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM websites");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkWebsiteStatus = async (req, res) => {
  const { id, url } = req.body;

  try {
    const result = await probe(url);
    const { status, httpStatusCode, responseTime } = result;

    await db.query(
      "UPDATE websites SET status = ?, lastChecked = ?, httpStatusCode = ?, responseTime = ? WHERE id = ?",
      [status, new Date(), httpStatusCode, responseTime, id]
    );

    try {
      await recordCheck(id, result);
    } catch (historyErr) {
      console.error(
        "[checkWebsiteStatus] recordCheck failed:",
        historyErr.message
      );
    }

    res.json({ status, httpStatusCode, responseTime });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWebsiteHistory = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid website id" });
  }
  const limit = Math.min(Number(req.query.limit) || 100, 1000);

  try {
    const rows = await getHistory(id, limit);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWebsiteUptime = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid website id" });
  }
  const window = req.query.window || "24h";
  const windowMs = UPTIME_WINDOWS[window];
  if (!windowMs) {
    return res.status(400).json({
      error: `Invalid window. Allowed: ${Object.keys(UPTIME_WINDOWS).join(", ")}`,
    });
  }

  try {
    const sinceDate = new Date(Date.now() - windowMs);
    const uptime = await getUptime(id, sinceDate);
    res.json({ window, since: sinceDate, ...uptime });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

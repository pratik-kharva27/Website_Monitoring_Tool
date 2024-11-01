const db = require("../config/db");
const axios = require("axios");

const checkWebsiteStatus = async (url) => {
  try {
    const response = await axios.get(url);
    return response.status;
  } catch (error) {
    return "Down";
  }
};

exports.addWebsite = async (req, res) => {
  const { url } = req.body;

  if (!/^https?:\/\//i.test(url)) {
    return res
      .status(400)
      .json({ error: "URL should start with 'http://' or 'https://'" });
  }

  const status = await checkWebsiteStatus(url);
  const query =
    "INSERT INTO websites (url, status, lastChecked) VALUES (?, ?, ?)";

  db.query(query, [url, status, new Date()], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({ id: result.insertId, url, status });
  });
};

exports.getAllWebsites = (req, res) => {
  const query = "SELECT * FROM websites";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    console.log("Fetched websites:", results);
    res.json(results);
  });
};

exports.checkWebsiteStatus = async (req, res) => {
  const { id, url } = req.body;

  try {
    const response = await axios.get(url);

    const status = "Up";
    const updateQuery =
      "UPDATE websites SET status = ?, lastChecked = ? WHERE id = ?";
    db.query(updateQuery, [status, new Date(), id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status });
    });
  } catch (error) {
    const status = "Down";
    const updateQuery =
      "UPDATE websites SET status = ?, lastChecked = ? WHERE id = ?";
    db.query(updateQuery, [status, new Date(), id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: "Down" });
    });
  }
};

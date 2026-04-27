const express = require("express");
const {
  addWebsite,
  getAllWebsites,
  checkWebsiteStatus,
  getWebsiteHistory,
  getWebsiteUptime,
} = require("../controllers/websiteController");
const { ssrfGuard } = require("../middleware/ssrfGuard");

const router = express.Router();

router.post("/add", ssrfGuard(), addWebsite);

router.get("/", getAllWebsites);

router.post("/check-status", ssrfGuard(), checkWebsiteStatus);

router.get("/:id/history", getWebsiteHistory);

router.get("/:id/uptime", getWebsiteUptime);

module.exports = router;

const express = require("express");
const {
  addWebsite,
  getAllWebsites,
  checkWebsiteStatus,
} = require("../controllers/websiteController");

const router = express.Router();

router.post("/add", addWebsite);

router.get("/", getAllWebsites);

router.post("/check-status", checkWebsiteStatus);

module.exports = router;

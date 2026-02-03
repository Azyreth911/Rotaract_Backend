const express = require("express");
const router = express.Router();

const {
  generateBestRotaracter,
  getBestRotaracter,
} = require("../controllers/bestRotaracter.controller");

router.get("/", getBestRotaracter);
router.post("/generate", generateBestRotaracter);

module.exports = router;

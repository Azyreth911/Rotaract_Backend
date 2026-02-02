const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Events API ready" });
});

module.exports = router;

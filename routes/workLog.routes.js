const express = require("express");
const router = express.Router();
const {
  addWorkLog,
  getWorkLogsByEvent,
} = require("../controllers/workLog.controller");

router.post("/", addWorkLog);
router.get("/event/:event_id", getWorkLogsByEvent);

module.exports = router;

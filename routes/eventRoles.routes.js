const express = require("express");
const router = express.Router();
const {
  getEventRoles,
  createEventRole,
} = require("../controllers/eventRoles.controller");

router.get("/:event_id", getEventRoles);
router.post("/", createEventRole);

module.exports = router;

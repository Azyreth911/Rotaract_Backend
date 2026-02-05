const express = require("express");
const router = express.Router();

const {
  getEvents,
  getEventById,
  createEvent,
  getEventDashboard
} = require("../controllers/events.controller");

router.get("/", getEvents);
router.get("/:eventId", getEventById);
router.post("/", createEvent);
router.get("/:eventId/dashboard", getEventDashboard);

module.exports = router;

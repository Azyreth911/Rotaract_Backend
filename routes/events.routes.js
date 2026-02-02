const express = require("express");
const router = express.Router();

const {
  getEvents,
  getEventById,
  createEvent,
} = require("../controllers/events.controller");

router.get("/", getEvents);
router.get("/:eventId", getEventById);
router.post("/", createEvent);

module.exports = router;

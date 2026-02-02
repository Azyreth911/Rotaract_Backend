const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getAttendanceByEvent,
} = require("../controllers/attendance.controller");

router.post("/", markAttendance);
router.get("/:event_id", getAttendanceByEvent);

module.exports = router;

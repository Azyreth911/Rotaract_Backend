const express = require("express");
const router = express.Router();
const {
  markAttendance,
  updateAttendance,
  getAttendanceByEvent,
  getAttendanceSummary
} = require("../controllers/attendance.controller");

router.post("/", markAttendance);
router.put("/", updateAttendance);
router.get("/:event_id/summary", getAttendanceSummary);
router.get("/:event_id", getAttendanceByEvent);

module.exports = router;

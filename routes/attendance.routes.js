const express = require("express");
const router = express.Router();
const {
  markAttendance,
  updateAttendance,
  getAttendanceByEvent
} = require("../controllers/attendance.controller");

router.post("/", markAttendance);
router.put("/", updateAttendance);
router.get("/:event_id", getAttendanceByEvent);

module.exports = router;

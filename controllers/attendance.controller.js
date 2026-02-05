const pool = require("../config/db");

// Mark attendance
const markAttendance = async (req, res) => {
  const { event_id, member_id, attendance_status } = req.body;

  if (!event_id || !member_id || !attendance_status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1️⃣ Check if attendance already exists
    const existing = await pool.query(
      `SELECT attendance_id 
       FROM event_attendance
       WHERE event_id = $1 AND member_id = $2`,
      [event_id, member_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: "Attendance already marked for this member",
      });
    }

    // 2️⃣ Insert only if not exists
    const result = await pool.query(
      `INSERT INTO event_attendance (event_id, member_id, attendance_status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [event_id, member_id, attendance_status]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark attendance" });
  }
};

// Get attendance for event
const getAttendanceByEvent = async (req, res) => {
  const { event_id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        ea.attendance_id,
        ea.attendance_status,
        m.name
      FROM event_attendance ea
      JOIN members m ON ea.member_id = m.member_id
      WHERE ea.event_id = $1
      `,
      [event_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
};

// Update attendance
const updateAttendance = async (req, res) => {
  const { event_id, member_id, attendance_status } = req.body;

  if (!event_id || !member_id || !attendance_status) {
    return res.status(400).json({
      error: "event_id, member_id, attendance_status are required",
    });
  }

  try {
    const result = await pool.query(
      `
      UPDATE event_attendance
      SET attendance_status = $3
      WHERE event_id = $1 AND member_id = $2
      RETURNING *
      `,
      [event_id, member_id, attendance_status]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Attendance not found for this member",
      });
    }

    res.status(200).json({
      message: "Attendance updated",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to update attendance",
    });
  }
};

// Attendance summary for an event
const getAttendanceSummary = async (req, res) => {
  const { event_id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE attendance_status = 'present') AS present,
        COUNT(*) FILTER (WHERE attendance_status = 'absent') AS absent
      FROM event_attendance
      WHERE event_id = $1
      `,
      [event_id]
    );

    res.json({
      event_id: Number(event_id),
      total: Number(result.rows[0].total),
      present: Number(result.rows[0].present),
      absent: Number(result.rows[0].absent),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch attendance summary",
    });
  }
};

module.exports = {
  markAttendance,
  updateAttendance,
  getAttendanceByEvent,
  getAttendanceSummary
};

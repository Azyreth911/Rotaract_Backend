const pool = require("../config/db");

// Mark attendance
const markAttendance = async (req, res) => {
  const { event_id, member_id, attendance_status } = req.body;

  if (!event_id || !member_id || !attendance_status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
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
      `SELECT ea.attendance_id, ea.attendance_status, m.name
       FROM event_attendance ea
       JOIN members m ON ea.member_id = m.member_id
       WHERE ea.event_id = $1`,
      [event_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
};

module.exports = {
  markAttendance,
  getAttendanceByEvent,
};

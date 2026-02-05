const pool = require("../config/db");

// ==============================
// ADD WORK LOG (POST)
// ==============================
const addWorkLog = async (req, res) => {
  const { event_id, member_id, work_minutes, work_type } = req.body;

  // 1️⃣ Basic validation
  if (!event_id || !member_id || !work_minutes || !work_type) {
    return res.status(400).json({
      error: "event_id, member_id, work_minutes, work_type are required",
    });
  }

  try {
    // 2️⃣ Check attendance exists
    const attendanceCheck = await pool.query(
      `
      SELECT attendance_status
      FROM event_attendance
      WHERE event_id = $1 AND member_id = $2
      `,
      [event_id, member_id]
    );

    if (attendanceCheck.rows.length === 0) {
      return res.status(400).json({
        error: "Attendance not marked for this member",
      });
    }

    // 3️⃣ Only PRESENT members can log work
    if (attendanceCheck.rows[0].attendance_status !== "present") {
      return res.status(403).json({
        error: "Cannot add work log for absent member",
      });
    }

    // 4️⃣ Insert work log
    const result = await pool.query(
      `
      INSERT INTO event_work_log (event_id, member_id, work_minutes, work_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [event_id, member_id, work_minutes, work_type]
    );

    res.status(201).json({
      message: "Work log added",
      data: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        error: "Work already logged for this member and role",
      });
    }
    console.error(err);
    res.status(500).json({
      error: "Failed to add work log",
    });
  }
};

// ==============================
// GET WORK LOGS BY EVENT
// ==============================
const getWorkLogsByEvent = async (req, res) => {
  const { event_id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        wl.work_log_id,
        wl.work_minutes,
        wl.work_type,
        m.name
      FROM event_work_log wl
      JOIN members m ON wl.member_id = m.member_id
      WHERE wl.event_id = $1
      ORDER BY wl.work_log_id DESC
      `,
      [event_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch work logs",
    });
  }
};

module.exports = {
  addWorkLog,
  getWorkLogsByEvent,
};

const pool = require("../config/db");

// Add work log
const addWorkLog = async (req, res) => {
  const { event_id, member_id, work_minutes, work_type } = req.body;

  if (!event_id || !member_id || !work_minutes || !work_type) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO event_work_log (event_id, member_id, work_minutes, work_type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [event_id, member_id, work_minutes, work_type]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add work log" });
  }
};

// Get work logs for event
const getWorkLogsByEvent = async (req, res) => {
  const { event_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT wl.work_log_id, wl.work_minutes, wl.work_type, m.name
       FROM event_work_log wl
       JOIN members m ON wl.member_id = m.member_id
       WHERE wl.event_id = $1`,
      [event_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch work logs" });
  }
};

module.exports = {
  addWorkLog,
  getWorkLogsByEvent,
};

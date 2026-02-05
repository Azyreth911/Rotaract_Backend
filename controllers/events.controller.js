// controller can talk to the database
const pool = require("../config/db");

// Get all events
const getEvents = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM events ORDER BY start_time DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  const { eventId } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM events WHERE event_id = $1",
      [eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch event" });
  }
};


// Post create a new event
const createEvent = async (req, res) => {
  const {
    title,
    description,
    start_time,
    end_time,
    venue,
    poster_url,
    status,
  } = req.body;

  if (!title || !start_time) {
    return res.status(400).json({
      error: "title and start_time are required",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO events
       (title, description, start_time, end_time, venue, poster_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, start_time, end_time, venue, poster_url, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create event" });
  }
};

const getEventDashboard = async (req, res) => {
  const { eventId } = req.params;

  try {
    // 1️⃣ Event info
    const eventResult = await pool.query(
      `SELECT event_id, title, start_time, end_time, venue, status
       FROM events
       WHERE event_id = $1`,
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    // 2️⃣ Attendance summary
    const attendanceResult = await pool.query(
      `
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE attendance_status = 'present') AS present,
        COUNT(*) FILTER (WHERE attendance_status = 'absent') AS absent
      FROM event_attendance
      WHERE event_id = $1
      `,
      [eventId]
    );

    // 3️⃣ Work log summary
    const workLogResult = await pool.query(
      `
      SELECT
        COALESCE(SUM(work_minutes), 0) AS total_minutes
      FROM event_work_log
      WHERE event_id = $1
      `,
      [eventId]
    );

    const memberWorkLogs = await pool.query(
      `
      SELECT
        m.member_id,
        m.name,
        COALESCE(SUM(wl.work_minutes), 0) AS total_minutes
      FROM members m
      LEFT JOIN event_work_log wl
        ON wl.member_id = m.member_id
        AND wl.event_id = $1
      GROUP BY m.member_id, m.name
      ORDER BY total_minutes DESC
      `,
      [eventId]
    );

    res.json({
      event: eventResult.rows[0],
      attendance: {
        total: Number(attendanceResult.rows[0].total),
        present: Number(attendanceResult.rows[0].present),
        absent: Number(attendanceResult.rows[0].absent),
      },
      work_log: {
        total_minutes: Number(workLogResult.rows[0].total_minutes),
        members: memberWorkLogs.rows
      }
    });

  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load event dashboard" });
  }
};

// Export controller functions
module.exports = {
  getEvents,
  getEventById,
  createEvent,
  getEventDashboard
};

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

// Export controller functions
module.exports = {
  getEvents,
  getEventById,
  createEvent,
};

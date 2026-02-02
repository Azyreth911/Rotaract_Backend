const pool = require("../config/db");

// Get roles for an event
const getEventRoles = async (req, res) => {
  const { event_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT er.event_role_id, er.role, m.name, m.position
       FROM event_roles er
       JOIN members m ON er.member_id = m.member_id
       WHERE er.event_id = $1`,
      [event_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch event roles" });
  }
};

// Assign role to member
const createEventRole = async (req, res) => {
  const { event_id, member_id, role } = req.body;

  if (!event_id || !member_id || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO event_roles (event_id, member_id, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [event_id, member_id, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to assign role" });
  }
};

module.exports = {
  getEventRoles,
  createEventRole,
};

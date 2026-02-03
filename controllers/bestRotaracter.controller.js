const pool = require("../config/db");

const generateBestRotaracter = async (req, res) => {
  const { month, year } = req.body;

  if (!month || !year) {
    return res.status(400).json({ error: "month and year are required" });
  }

  try {
    const result = await pool.query(`
      SELECT
        m.member_id,
        (
          COALESCE(a.attendance_count, 0) * 10
          +
          COALESCE(FLOOR(w.total_minutes / 30), 0) * 5
        )::INT AS score
      FROM members m
      LEFT JOIN (
        SELECT member_id, COUNT(*) AS attendance_count
        FROM event_attendance
        GROUP BY member_id
      ) a ON a.member_id = m.member_id
      LEFT JOIN (
        SELECT member_id, SUM(work_minutes) AS total_minutes
        FROM event_work_log
        GROUP BY member_id
      ) w ON w.member_id = m.member_id
      ORDER BY score DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No members found" });
    }

    const winner = result.rows[0];

    await pool.query(
      `
      INSERT INTO best_rotaracter (member_id, month, year, score)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (member_id, month, year)
      DO UPDATE SET score = EXCLUDED.score
      `,
      [winner.member_id, month, year, winner.score]
    );

    res.status(201).json({
      message: "Best Rotaracter generated",
      data: winner,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate best rotaracter" });
  }
};

const getBestRotaracter = async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ error: "month and year are required" });
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        br.member_id,
        m.name,
        br.score
      FROM best_rotaracter br
      JOIN members m ON m.member_id = br.member_id
      WHERE br.month = $1 AND br.year = $2
      `,
      [month, year]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No best rotaracter found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch best rotaracter" });
  }
};


module.exports = { generateBestRotaracter, getBestRotaracter };
 
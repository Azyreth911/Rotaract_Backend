require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());

// routes
app.use("/api/events", require("./routes/events.routes"));
app.use("/api/members", require("./routes/members.routes"));
app.use("/api/event-roles", require("./routes/eventRoles.routes"));
app.use("/api/participants", require("./routes/participants.routes"));
app.use("/api/volunteers", require("./routes/volunteers.routes"));
app.use("/api/attendance", require("./routes/attendance.routes"));
app.use("/api/gallery", require("./routes/gallery.routes"));
app.use("/api/announcements", require("./routes/announcements.routes"));
app.use("/api/feedback", require("./routes/feedback.routes"));
app.use("/api/best-rotaracter", require("./routes/bestRotaracter.routes"));

// root route
app.get("/", (req, res) => {
  res.send("Rotaract backend is alive");
});

// listen always at the end
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static("public")); // Serve frontend files (index.html, css, js)

/* ---------- DATABASE ---------- */
const dbPath = path.join(__dirname, "database.db");
console.log("✅ Using DB:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("❌ DB connection failed", err);
  else console.log("✅ Database connected");
});

/* ---------- TABLES ---------- */
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS trainer (
      empId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      availability TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS subject (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);
});

/* ---------- TRAINER APIs ---------- */
// GET all trainers
app.get("/trainer", (req, res) => {
  db.all("SELECT * FROM trainer", (err, rows) => {
    if (err) return res.status(500).json([]);
    res.json(rows);
  });
});

// GET trainer by ID
app.get("/trainer/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM trainer WHERE empId=?", [id], (err, row) => {
    if (err) return res.status(500).json(null);
    res.json(row);
  });
});

// GET trainers by subject
app.get("/trainer/:subject/topic", (req, res) => {
  const subject = req.params.subject.toLowerCase();
  db.all("SELECT * FROM trainer WHERE LOWER(subject)=?", [subject], (err, rows) => {
    if (err) return res.status(500).json([]);
    res.json(rows);
  });
});

// ADD trainer
app.post("/trainer", (req, res) => {
  const { name, subject, availability } = req.body;
  if (!name || !subject) return res.status(400).json({ error: "Missing fields" });

  db.run(
    "INSERT INTO trainer (name, subject, availability) VALUES (?,?,?)",
    [name, subject, availability || "Available"],
    function (err) {
      if (err) return res.status(500).json({ error: "DB insert failed" });
      res.status(201).json({ empId: this.lastID });
    }
  );
});

// DELETE trainer
app.delete("/trainer/:id", (req, res) => {
  db.run("DELETE FROM trainer WHERE empId=?", [req.params.id], function () {
    res.json({ deleted: this.changes });
  });
});

/* ---------- SUBJECT APIs ---------- */
// ADD subject
app.post("/subject", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "No subject name" });

  db.run("INSERT INTO subject (name) VALUES (?)", [name], (err) => {
    if (err) return res.status(500).json({ error: "Duplicate subject" });
    res.json({ message: "Subject added" });
  });
});

// GET all subjects
app.get("/subject", (req, res) => {
  db.all("SELECT * FROM subject", (err, rows) => {
    if (err) return res.status(500).json([]);
    res.json(rows);
  });
});

// DELETE a subject
app.delete("/subject/:id", (req, res) => {
  db.run("DELETE FROM subject WHERE id=?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: "Could not delete" });
    res.json({ deleted: this.changes });
  });
});

/* ---------- DASHBOARD ---------- */
// Dashboard: Subject → Trainer Count
app.get("/dashboard/subject-count", (req, res) => {
  db.all(
    "SELECT subject, COUNT(*) AS count FROM trainer GROUP BY subject",
    (err, rows) => {
      if (err) return res.status(500).json([]);
      res.json(rows);
    }
  );
});

/* ---------- SERVER ---------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

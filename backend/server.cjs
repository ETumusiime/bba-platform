require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { addDays, differenceInCalendarDays, isAfter, isBefore } = require('date-fns');

const app = express();
app.use(cors({ origin: ['http://localhost:3000'], credentials: true }));
app.use(express.json());

// -------------------------
// PostgreSQL connection
// -------------------------
const useUrl = !!process.env.DATABASE_URL;
const pool = new Pool(
  useUrl
    ? { connectionString: process.env.DATABASE_URL, ssl: false }
    : {
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT || 5432),
        database: process.env.PGDATABASE || 'bba',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '',
      }
);

const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_secret_change_me';

// -------------------------
// Helper functions
// -------------------------
function createTrialWindow() {
  const start = new Date();
  const end = addDays(start, 7);
  return {
    startISO: start.toISOString().slice(0, 10),
    endISO: end.toISOString().slice(0, 10),
  };
}

function computeTrialStatus(row) {
  const today = new Date();
  const start = new Date(row.trial_start_date);
  const end = new Date(row.trial_end_date);
  const active = isBefore(today, end) || !isAfter(today, end);
  const daysLeft = Math.max(0, differenceInCalendarDays(end, today));
  return {
    trial_active: active,
    trial_days_left: daysLeft,
    trial_status: active ? 'trial_active' : 'trial_expired',
  };
}

// -------------------------
// Middleware
// -------------------------
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { parent_id: payload.parent_id, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

async function requireActiveTrial(req, res, next) {
  try {
    const { parent_id } = req.user;
    const { rows } = await pool.query(
      'SELECT id, trial_start_date, trial_end_date FROM parents WHERE id=$1',
      [parent_id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Parent not found' });

    const status = computeTrialStatus(rows[0]);
    if (!status.trial_active) {
      return res.status(402).json({
        error: 'Trial expired',
        message:
          'Your 7-day free trial has ended. Please subscribe to continue.',
        trial_status: status,
      });
    }
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error (trial check)' });
  }
}

// -------------------------
// Routes
// -------------------------

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// -------------------------
// Register
// -------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body || {};
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ error: 'name, email, and password are required' });

    const exists = await pool.query('SELECT id FROM parents WHERE email=$1', [
      email.toLowerCase(),
    ]);
    if (exists.rowCount > 0)
      return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const { startISO, endISO } = createTrialWindow();

    const insert = await pool.query(
      `INSERT INTO parents
         (name, email, phone, password_hash, trial_start_date, trial_end_date, is_trial_used)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, name, email, phone, trial_start_date, trial_end_date, is_trial_used, created_at`,
      [name, email.toLowerCase(), phone || null, hash, startISO, endISO, true]
    );

    const parent = insert.rows[0];
    const token = jwt.sign(
      { parent_id: parent.id, email: parent.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const status = computeTrialStatus(parent);
    res.status(201).json({ parent: { ...parent, ...status }, token });
  } catch (e) {
    console.error('REGISTER ERROR:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// -------------------------
// Login
// -------------------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res
        .status(400)
        .json({ error: 'email and password are required' });

    const { rows } = await pool.query('SELECT * FROM parents WHERE email=$1', [
      email.toLowerCase(),
    ]);
    if (rows.length === 0)
      return res.status(401).json({ error: 'Invalid credentials' });

    const parent = rows[0];
    const ok = await bcrypt.compare(password, parent.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { parent_id: parent.id, email: parent.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const status = computeTrialStatus(parent);
    delete parent.password_hash;
    res.json({ parent: { ...parent, ...status }, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error (login)' });
  }
});

// -------------------------
// Get parent profile
// -------------------------
app.get('/api/parents/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (Number(id) !== Number(req.user.parent_id))
      return res.status(403).json({ error: 'Forbidden' });

    const { rows } = await pool.query(
      'SELECT id, name, email, phone, trial_start_date, trial_end_date, is_trial_used, created_at FROM parents WHERE id=$1',
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Parent not found' });

    const parent = rows[0];
    const status = computeTrialStatus(parent);
    res.json({ parent: { ...parent, ...status } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error (get parent)' });
  }
});

// -------------------------
// Example protected route
// -------------------------
app.get(
  '/api/protected/example',
  requireAuth,
  requireActiveTrial,
  (_req, res) => {
    res.json({
      message: 'You have access because your trial is active (or subscribed).',
    });
  }
);

// -------------------------
const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () =>
  console.log(`✅ BBA backend listening on http://localhost:${PORT}`)
);

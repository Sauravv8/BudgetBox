import express = require('express');
import cors = require('cors');
import dotenv = require('dotenv');
import { Pool } from 'pg';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create tables if not exist
const initDb = async () => {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id text NOT NULL,
        month text NOT NULL,
        data jsonb NOT NULL,
        last_modified timestamptz NOT NULL,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS budgets_user_month_idx ON budgets (user_id, month);
    `);
        console.log('Database initialized');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

initDb();

// Sync Endpoint
app.post('/budget/sync', async (req, res) => {
    const { userId, month, lastModified, ...data } = req.body;

    try {
        const existing = await pool.query(
            'SELECT * FROM budgets WHERE user_id=$1 AND month=$2',
            [userId, month]
        );

        if (existing.rowCount === 0) {
            // Insert new
            const timestamp = new Date().toISOString();
            await pool.query(
                'INSERT INTO budgets (user_id, month, data, last_modified) VALUES ($1, $2, $3, $4)',
                [userId, month, { userId, month, lastModified: timestamp, ...data }, timestamp]
            );
            return res.json({ success: true, timestamp, status: 'synced' });
        }

        const serverRow = existing.rows[0];
        const serverLast = new Date(serverRow.last_modified).getTime();
        const clientLast = new Date(lastModified).getTime();

        if (clientLast >= serverLast) {
            // Client is newer (or same), update server
            const timestamp = new Date().toISOString(); // Canonical server time
            await pool.query(
                'UPDATE budgets SET data=$1, last_modified=$2 WHERE user_id=$3 AND month=$4',
                [{ userId, month, lastModified: timestamp, ...data }, timestamp, userId, month]
            );
            return res.json({ success: true, timestamp, status: 'synced' });
        } else {
            // Server is newer, return server copy
            return res.json({
                success: false,
                reason: 'server-newer',
                serverCopy: serverRow.data,
                timestamp: serverRow.last_modified
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Latest Endpoint
app.get('/budget/latest', async (req, res) => {
    const { userId, month } = req.query;

    if (!userId || !month) {
        return res.status(400).json({ error: 'Missing userId or month' });
    }

    try {
        const row = await pool.query(
            'SELECT data FROM budgets WHERE user_id=$1 AND month=$2',
            [userId, month]
        );

        if (row.rowCount === 0) {
            return res.status(404).json({ error: 'not-found' });
        }

        res.json({ budget: row.rows[0].data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app;

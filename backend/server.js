const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'database',
    port: 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'notesdb'
});

// Создание таблицы при запуске
pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`).catch(err => console.error('Ошибка создания таблицы:', err));

// GET /notes - получить все заметки
app.get('/notes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notes ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /notes/:id - получить одну заметку
app.get('/notes/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notes WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Заметка не найдена' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /notes - создать заметку
app.post('/notes', async (req, res) => {
    const { title, content } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Заголовок обязателен' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *',
            [title, content || '']
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /notes/:id - обновить заметку
app.put('/notes/:id', async (req, res) => {
    const { title, content } = req.body;
    try {
        const result = await pool.query(
            'UPDATE notes SET title = $1, content = $2 WHERE id = $3 RETURNING *',
            [title, content, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Заметка не найдена' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /notes/:id - удалить заметку
app.delete('/notes/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM notes WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Заметка не найдена' });
        }
        res.json({ message: 'Заметка удалена' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Backend запущен на порту ${port}`);
});
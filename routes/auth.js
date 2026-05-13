const express = require('express');
const pool = require('../db');
const bcrypt = require('bcryptjs');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { nome, email, password } = req.body;
    if (!nome || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e password obrigatorios' });
    }
    try {
        const hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO utilizadores (nome, email, passwordhash) VALUES ($1, $2, $3) RETURNING utilizadorid',
            [nome, email, hash]
        );
        res.json({ success: true, utilizadorid: result.rows[0].utilizadorid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email e password obrigatorios' });
    }
    try {
        const result = await pool.query(
            'SELECT * FROM utilizadores WHERE email = $1',
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciais invalidas' });
        }
        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.passwordhash);
        if (!match) {
            return res.status(401).json({ error: 'Credenciais invalidas' });
        }
        res.json({ success: true, utilizadorid: user.utilizadorid, nome: user.nome });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

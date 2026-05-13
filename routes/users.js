const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /api/users - Lista todos os utilizadores com saldo
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT utilizadorid, nome, email, saldo FROM utilizadores ORDER BY utilizadorid'
        );
        res.json({ success: true, users: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/users/:id - Saldos de um utilizador especifico
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT utilizadorid, nome, email, saldo FROM utilizadores WHERE utilizadorid = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Utilizador nao encontrado' });
        }
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /api/admin/anomalies
// Lista contadores com problemas (temperatura > 80 ou erro_codigo nao nulo)
// Usa query JSONB otimizada com indice GIN
router.get('/anomalies', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT c.contadorid, c.numeroserie, c.estado
            FROM contadores c
            JOIN leituras l ON c.contadorid = l.contadorid
            WHERE (l.dadosaudit->>'temperatura')::numeric > 80
               OR (l.dadosaudit->>'erro_codigo') IS NOT NULL
        `);
        res.json({ success: true, anomalies: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

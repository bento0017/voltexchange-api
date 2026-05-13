const express = require('express');
const pool = require('../db');

const router = express.Router();

// POST /api/meters/readings
// Recebe payload JSON e grava em DadosAudit (JSONB)
router.post('/readings', async (req, res) => {
    const { contadorid, datahora, kwh_leitura, dadosaudit } = req.body;
    if (!contadorid || !datahora || kwh_leitura == null) {
        return res.status(400).json({ error: 'contadorid, datahora e kwh_leitura obrigatorios' });
    }
    try {
        const auditJson = dadosaudit ? JSON.stringify(dadosaudit) : '{}';
        const result = await pool.query(
            'INSERT INTO leituras (contadorid, datahora, kwh_leitura, dadosaudit) VALUES ($1, $2, $3, $4) RETURNING leituraid',
            [contadorid, datahora, kwh_leitura, auditJson]
        );
        res.json({ success: true, leituraid: result.rows[0].leituraid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

const express = require('express');
const pool = require('../db');

const router = express.Router();

// POST /api/market/buy
// Compra imediata (chama sp_ExecutarCompraDireta)
router.post('/buy', async (req, res) => {
    const { ofertaid, compradorid } = req.body;
    if (!ofertaid || !compradorid) {
        return res.status(400).json({ error: 'ofertaid e compradorid obrigatorios' });
    }
    try {
        await pool.query('CALL sp_ExecutarCompraDireta($1, $2)', [ofertaid, compradorid]);
        res.json({ success: true, message: 'Compra realizada com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/market/order
// Cria intencao de compra futura (insere em OrdensCompra)
router.post('/order', async (req, res) => {
    const { compradorid, quantidadekwh, precomaximo } = req.body;
    if (!compradorid || !quantidadekwh || !precomaximo) {
        return res.status(400).json({ error: 'compradorid, quantidadekwh e precomaximo obrigatorios' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO ordenscompra (compradorid, quantidadekwh, precomaximo) VALUES ($1, $2, $3) RETURNING ordemid',
            [compradorid, quantidadekwh, precomaximo]
        );
        res.json({ success: true, ordemid: result.rows[0].ordemid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/market/match
// Dispara manualmente o sp_MatchingEngine
router.post('/match', async (req, res) => {
    try {
        await pool.query('CALL sp_MatchingEngine()');
        res.json({ success: true, message: 'Matching engine executado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

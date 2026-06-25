const express = require('express');
const router = express.Router();
const { collectPoints } = require('../database');
const { authMiddleware } = require('../../middleware/auth');

// Listar Pontos de Coleta (Requer autenticação)
router.get('/pontos-coleta', authMiddleware, (req, res) => {
    // Retornar a lista de pontos de coleta
    res.json(collectPoints);
});

module.exports = router;

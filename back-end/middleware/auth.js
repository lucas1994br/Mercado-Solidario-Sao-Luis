const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'infinitydevs_super_secret_key_2026';

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: 'Token inválido' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Salva os dados do usuário na requisição
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Falha na autenticação do token' });
    }
}

module.exports = {
    authMiddleware,
    SECRET_KEY
};

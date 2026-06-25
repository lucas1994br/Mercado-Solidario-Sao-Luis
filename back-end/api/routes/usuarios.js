const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { users } = require('../database');
const { SECRET_KEY } = require('../../middleware/auth');

// Cadastro
router.post('/cadastro', (req, res) => {
    const { name, email, phone, address, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    // Verifica se email já existe
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(409).json({ error: 'E-mail já cadastrado.' });
    }

    // Criar novo usuário (em memória)
    const newUser = {
        id: users.length + 1,
        name,
        email,
        phone,
        address,
        password // Em produção, usar bcrypt para hash!
    };

    users.push(newUser);

    // Gerar Token
    const token = jwt.sign(
        { id: newUser.id, name: newUser.name, email: newUser.email },
        SECRET_KEY,
        { expiresIn: '2h' }
    );

    res.status(201).json({
        message: 'Usuário cadastrado com sucesso!',
        token,
        user: { name: newUser.name, email: newUser.email }
    });
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        SECRET_KEY,
        { expiresIn: '2h' }
    );

    res.json({
        message: 'Login realizado com sucesso!',
        token,
        user: { name: user.name, email: user.email }
    });
});

module.exports = router;

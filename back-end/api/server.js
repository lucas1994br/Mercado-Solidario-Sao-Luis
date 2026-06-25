const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Importação das rotas
const usuariosRoutes = require('./routes/usuarios');
const produtosRoutes = require('./routes/produtos');

// Configuração das rotas da API
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/produtos', produtosRoutes);

// Rota raiz da API para Healthcheck
app.get('/api', (req, res) => {
    res.json({ message: 'API Mercado Solidário São-Luís executando com sucesso!' });
});

// Exportar app para o Vercel Serverless Functions
module.exports = app;

// Iniciar servidor apenas se não estiver em ambiente Vercel (localmente)
if (require.main === module) {
    // Servir arquivos estáticos do front-end
    app.use(express.static(path.join(__dirname, '../../front-end')));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../../front-end/pages/index.html'));
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`Acesse o site localmente em: http://localhost:${PORT}`);
    });
}

// Banco de dados em memória (Mock) para o Vercel Serverless
const users = [];

const collectPoints = [
    {
        id: 1,
        name: "Igreja Matriz São-Luís",
        address: "Praça Central, S/N - Centro",
        hours: "Seg a Sex: 08h às 18h",
        tags: ["Alimentação", "Roupas"]
    },
    {
        id: 2,
        name: "Escola Municipal Esperança",
        address: "Rua das Flores, 123 - Bairro Novo",
        hours: "Seg a Sab: 07h às 17h",
        tags: ["Higiene", "Alimentação"]
    },
    {
        id: 3,
        name: "Centro Comunitário",
        address: "Av. Principal, 500 - Zona Sul",
        hours: "Ter a Dom: 09h às 20h",
        tags: ["Higiene", "Alimentação", "Roupas"]
    }
];

module.exports = {
    users,
    collectPoints
};

// Configuração base da API
let API_URL = '/api'; // Para Vercel (onde /api roteia para server.js)

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
    API_URL = 'http://localhost:3000/api'; // Para desenvolvimento local
}

// Função auxiliar para lidar com o fetch
async function fetchAPI(endpoint, options = {}) {
    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Erro na requisição');
    }

    return data;
}

// Serviços da API
const api = {
    // Cadastro de Usuário
    register: async (userData) => {
        return fetchAPI('/usuarios/cadastro', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    // Login de Usuário
    login: async (credentials) => {
        return fetchAPI('/usuarios/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    // Buscar pontos de coleta
    getPoints: async () => {
        return fetchAPI('/produtos/pontos-coleta');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Referências aos Elementos DOM
    const screenRegister = document.getElementById('screen-register');
    const screenLogin = document.getElementById('screen-login');
    const screenPanel = document.getElementById('screen-panel');
    
    const formRegister = document.getElementById('register-form');
    const formLogin = document.getElementById('login-form');
    
    const btnLogout = document.getElementById('btn-logout');
    const btnShowLogin = document.getElementById('btn-show-login');
    const btnShowRegister = document.getElementById('btn-show-register');
    
    const userNameDisplay = document.getElementById('user-name-display');
    const customAlert = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('alert-message');
    const alertIcon = document.getElementById('alert-icon');
    const pointsGridContainer = document.getElementById('points-grid-container');

    // Inicialização: Verifica se usuário já está logado
    const token = localStorage.getItem('token');
    const savedName = localStorage.getItem('userName');
    
    if (token && savedName) {
        showPanel(savedName);
    }

    // Função para alternar telas com transição suave
    function switchScreen(fromScreen, toScreen) {
        // Encontrar tela ativa atual
        const currentActive = document.querySelector('.screen.active');
        if (currentActive) {
            currentActive.classList.remove('active');
        } else if (fromScreen) {
            fromScreen.classList.remove('active');
        }
        
        setTimeout(() => {
            toScreen.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
    }

    // Função para exibir alerta customizado
    function showAlert(message, type = 'success') {
        alertMessage.textContent = message;
        
        if (type === 'success') {
            customAlert.classList.remove('info');
            customAlert.style.borderLeftColor = 'var(--color-success)';
            alertIcon.textContent = '✅';
        } else if (type === 'info') {
            customAlert.classList.add('info');
            customAlert.style.borderLeftColor = 'var(--color-blue-1)';
            alertIcon.textContent = '🧭';
        } else if (type === 'error') {
            customAlert.classList.remove('info');
            customAlert.style.borderLeftColor = 'var(--color-error)';
            alertIcon.textContent = '❌';
        }

        customAlert.classList.add('show');
        setTimeout(() => { customAlert.classList.remove('show'); }, 3500);
    }

    // Expor showAlert para global (para onClick do html)
    window.showMapAlert = function(locationName) {
        showAlert(`Abrindo rota para: ${locationName}`, 'info');
        // Abrir Google Maps em uma nova aba com o nome do local
        setTimeout(() => {
            const query = encodeURIComponent(`${locationName} São Luís`);
            window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
        }, 1500); // pequeno delay para o usuário ver o alerta
    };

    // Remover estado de erro ao digitar nos formulários
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
            input.parentElement.classList.remove('error');
        });
    });

    // Validação simples de E-mail
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Alternar entre Cadastro e Login
    btnShowLogin.addEventListener('click', () => switchScreen(screenRegister, screenLogin));
    btnShowRegister.addEventListener('click', () => switchScreen(screenLogin, screenRegister));

    // Manipular submissão do Cadastro
    formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');
        const address = document.getElementById('address');
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirm-password');

        let isValid = true;
        document.querySelectorAll('#register-form .input-group').forEach(g => g.classList.remove('error'));

        if (name.value.trim().length < 3) { name.parentElement.classList.add('error'); isValid = false; }
        if (!isValidEmail(email.value.trim())) { email.parentElement.classList.add('error'); isValid = false; }
        if (phone.value.trim().length < 8) { phone.parentElement.classList.add('error'); isValid = false; }
        if (address.value.trim().length < 5) { address.parentElement.classList.add('error'); isValid = false; }
        if (password.value.length < 6) { password.parentElement.classList.add('error'); isValid = false; }
        if (password.value !== confirmPassword.value || confirmPassword.value === '') { confirmPassword.parentElement.classList.add('error'); isValid = false; }

        if (!isValid) return;

        try {
            const userData = {
                name: name.value.trim(),
                email: email.value.trim(),
                phone: phone.value.trim(),
                address: address.value.trim(),
                password: password.value
            };

            const response = await api.register(userData);
            
            // Salvar no localStorage
            localStorage.setItem('token', response.token);
            localStorage.setItem('userName', response.user.name);

            showAlert('Cadastro realizado com sucesso!');
            
            setTimeout(() => {
                showPanel(response.user.name);
            }, 1000);

        } catch (error) {
            showAlert(error.message, 'error');
        }
    });

    // Manipular submissão do Login
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email');
        const password = document.getElementById('login-password');
        let isValid = true;

        document.querySelectorAll('#login-form .input-group').forEach(g => g.classList.remove('error'));

        if (!isValidEmail(email.value.trim())) { email.parentElement.classList.add('error'); isValid = false; }
        if (password.value.length < 1) { password.parentElement.classList.add('error'); isValid = false; }

        if (!isValid) return;

        try {
            const credentials = {
                email: email.value.trim(),
                password: password.value
            };

            const response = await api.login(credentials);
            
            localStorage.setItem('token', response.token);
            localStorage.setItem('userName', response.user.name);

            showAlert('Login realizado com sucesso!');
            
            setTimeout(() => {
                showPanel(response.user.name);
            }, 1000);

        } catch (error) {
            showAlert(error.message, 'error');
        }
    });

    // Função para mostrar o painel e carregar dados via API
    async function showPanel(fullName) {
        const firstName = fullName.split(' ')[0];
        userNameDisplay.textContent = firstName;
        
        switchScreen(null, screenPanel);

        // Buscar pontos de coleta na API
        try {
            const points = await api.getPoints();
            renderPoints(points);
        } catch (error) {
            showAlert('Erro ao carregar pontos de coleta. ' + error.message, 'error');
            // Se erro de autenticação (401), deslogar
            if(error.message.includes('Token')) {
                performLogout();
            }
        }
    }

    // Renderizar pontos na tela
    function renderPoints(points) {
        if (!points || points.length === 0) {
            pointsGridContainer.innerHTML = '<p>Nenhum ponto de coleta encontrado.</p>';
            return;
        }

        pointsGridContainer.innerHTML = points.map(point => `
            <div class="point-card">
                <h4 class="point-name">${point.name}</h4>
                <div class="point-info">
                    <div class="info-item">
                        <span>🗺️</span>
                        <span>${point.address}</span>
                    </div>
                    <div class="info-item">
                        <span>🕒</span>
                        <span>${point.hours}</span>
                    </div>
                    <div class="tag-group">
                        ${point.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <button class="btn-location" onclick="showMapAlert('${point.name}')">
                    🧭 Ver no mapa
                </button>
            </div>
        `).join('');
    }

    // Logout
    function performLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        formRegister.reset();
        formLogin.reset();
        switchScreen(screenPanel, screenLogin);
    }

    btnLogout.addEventListener('click', performLogout);

    // ==========================================
    // LOGICA DO MODO ESCURO (DARK MODE)
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const iconLight = document.getElementById('theme-icon-light');
    const iconDark = document.getElementById('theme-icon-dark');
    
    // Verificar preferência salva ou usar claro por padrão
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        iconLight.style.display = 'inline';
        iconDark.style.display = 'none';
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        if (isDark) {
            iconLight.style.display = 'inline';
            iconDark.style.display = 'none';
        } else {
            iconLight.style.display = 'none';
            iconDark.style.display = 'inline';
        }
    });
});

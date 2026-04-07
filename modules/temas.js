// modulos/temas.js - Sistema de Temas e Personalização
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_TEMAS === 'undefined') {
    const MODULO_TEMAS = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO DE TEMAS ====================
        const TEMAS = {
            claro: {
                nome: 'Claro',
                icone: 'fa-sun',
                cores: {
                    primary: '#3498db',
                    secondary: '#2c3e50',
                    success: '#27ae60',
                    warning: '#f39c12',
                    danger: '#e74c3c',
                    info: '#17a2b8',
                    
                    background: '#f5f7fa',
                    surface: '#ffffff',
                    text: '#2c3e50',
                    textSecondary: '#7f8c8d',
                    border: '#dee2e6',
                    
                    sidebar: '#2c3e50',
                    sidebarText: '#ecf0f1',
                    header: '#ffffff',
                    
                    card: '#ffffff',
                    cardHover: '#f8f9fa',
                    
                    input: '#ffffff',
                    inputBorder: '#dee2e6',
                    inputFocus: '#3498db'
                }
            },
            
            escuro: {
                nome: 'Escuro',
                icone: 'fa-moon',
                cores: {
                    primary: '#3498db',
                    secondary: '#34495e',
                    success: '#27ae60',
                    warning: '#f39c12',
                    danger: '#e74c3c',
                    info: '#17a2b8',
                    
                    background: '#1a1a1a',
                    surface: '#2d2d2d',
                    text: '#ecf0f1',
                    textSecondary: '#95a5a6',
                    border: '#404040',
                    
                    sidebar: '#1e1e1e',
                    sidebarText: '#ecf0f1',
                    header: '#2d2d2d',
                    
                    card: '#2d2d2d',
                    cardHover: '#3d3d3d',
                    
                    input: '#3d3d3d',
                    inputBorder: '#505050',
                    inputFocus: '#3498db'
                }
            },
            
            contraste: {
                nome: 'Alto Contraste',
                icone: 'fa-adjust',
                cores: {
                    primary: '#ffff00',
                    secondary: '#00ffff',
                    success: '#00ff00',
                    warning: '#ffaa00',
                    danger: '#ff0000',
                    info: '#00ffff',
                    
                    background: '#000000',
                    surface: '#000000',
                    text: '#ffffff',
                    textSecondary: '#ffff00',
                    border: '#ffffff',
                    
                    sidebar: '#000000',
                    sidebarText: '#ffffff',
                    header: '#000000',
                    
                    card: '#000000',
                    cardHover: '#222222',
                    
                    input: '#000000',
                    inputBorder: '#ffffff',
                    inputFocus: '#ffff00'
                }
            },
            
            noturno: {
                nome: 'Noturno',
                icone: 'fa-star',
                cores: {
                    primary: '#9b59b6',
                    secondary: '#34495e',
                    success: '#1abc9c',
                    warning: '#f1c40f',
                    danger: '#e67e22',
                    info: '#3498db',
                    
                    background: '#0b0b1f',
                    surface: '#1a1a3a',
                    text: '#e0e0ff',
                    textSecondary: '#a0a0d0',
                    border: '#303050',
                    
                    sidebar: '#12122b',
                    sidebarText: '#d0d0ff',
                    header: '#1a1a3a',
                    
                    card: '#1a1a3a',
                    cardHover: '#252550',
                    
                    input: '#252550',
                    inputBorder: '#404070',
                    inputFocus: '#9b59b6'
                }
            },
            
            floresta: {
                nome: 'Floresta',
                icone: 'fa-leaf',
                cores: {
                    primary: '#2ecc71',
                    secondary: '#27ae60',
                    success: '#2ecc71',
                    warning: '#f39c12',
                    danger: '#e74c3c',
                    info: '#3498db',
                    
                    background: '#1a3a1a',
                    surface: '#2a4a2a',
                    text: '#e0ffe0',
                    textSecondary: '#a0c0a0',
                    border: '#3a5a3a',
                    
                    sidebar: '#1e3a1e',
                    sidebarText: '#e0ffe0',
                    header: '#2a4a2a',
                    
                    card: '#2a4a2a',
                    cardHover: '#3a5a3a',
                    
                    input: '#3a5a3a',
                    inputBorder: '#4a6a4a',
                    inputFocus: '#2ecc71'
                }
            },
            
            oceano: {
                nome: 'Oceano',
                icone: 'fa-water',
                cores: {
                    primary: '#00bcd4',
                    secondary: '#0288d1',
                    success: '#4caf50',
                    warning: '#ff9800',
                    danger: '#f44336',
                    info: '#03a9f4',
                    
                    background: '#001a2b',
                    surface: '#002b3a',
                    text: '#e0f0ff',
                    textSecondary: '#80b0d0',
                    border: '#00405a',
                    
                    sidebar: '#001f2f',
                    sidebarText: '#d0f0ff',
                    header: '#002b3a',
                    
                    card: '#002b3a',
                    cardHover: '#003b4a',
                    
                    input: '#003b4a',
                    inputBorder: '#00506a',
                    inputFocus: '#00bcd4'
                }
            }
        };

        // ==================== ESTADO ====================
        let temaAtual = 'claro';
        let temaPersonalizado = null;
        let observadores = [];

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('🎨 Sistema de Temas inicializado');
            
            // Carregar tema salvo
            carregarTema();
            
            // Aplicar tema
            aplicarTema(temaAtual);
            
            // Adicionar seletor de temas
            adicionarSeletorTemas();
            
            // Observar mudanças no DOM para novos elementos
            observarElementos();
        }

        // ==================== GERENCIAMENTO DE TEMAS ====================
        function aplicarTema(temaId) {
            const tema = TEMAS[temaId] || TEMAS.claro;
            temaAtual = temaId;
            
            // Aplicar cores como variáveis CSS
            const root = document.documentElement;
            Object.entries(tema.cores).forEach(([key, value]) => {
                root.style.setProperty(`--tema-${key}`, value);
            });
            
            // Aplicar classes no body
            document.body.className = document.body.className
                .replace(/tema-\S+/g, '')
                .trim();
            document.body.classList.add(`tema-${temaId}`);
            
            // Notificar observadores
            notificarObservadores(temaId);
            
            // Salvar preferência
            salvarTema(temaId);
            
            // Atualizar ícone do seletor
            atualizarSeletorTemas();
        }

        function getTemaAtual() {
            return {
                id: temaAtual,
                ...TEMAS[temaAtual]
            };
        }

        function getTemasDisponiveis() {
            return Object.entries(TEMAS).map(([id, tema]) => ({
                id,
                nome: tema.nome,
                icone: tema.icone
            }));
        }

        function personalizarTema(cores) {
            temaPersonalizado = {
                nome: 'Personalizado',
                icone: 'fa-paint-brush',
                cores: {
                    ...TEMAS.claro.cores,
                    ...cores
                }
            };
            
            // Aplicar tema personalizado
            const root = document.documentElement;
            Object.entries(temaPersonalizado.cores).forEach(([key, value]) => {
                root.style.setProperty(`--tema-${key}`, value);
            });
            
            temaAtual = 'personalizado';
            salvarTema('personalizado', temaPersonalizado);
        }

        // ==================== INTERFACE DO USUÁRIO ====================
        function adicionarSeletorTemas() {
            const headerRight = document.querySelector('.header-right');
            if (!headerRight) return;

            const seletorHTML = `
                <div class="tema-dropdown">
                    <button class="btn-icon" id="tema-toggle" title="Temas">
                        <i class="fas ${TEMAS[temaAtual].icone}"></i>
                    </button>
                    <div class="tema-painel" id="tema-painel">
                        <div class="tema-header">
                            <h3><i class="fas fa-palette"></i> Temas</h3>
                            <button class="btn-link" onclick="MODULO_TEMAS.fecharPainel()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div class="temas-grid">
                            ${Object.entries(TEMAS).map(([id, tema]) => `
                                <div class="tema-card ${temaAtual === id ? 'ativo' : ''}" 
                                     onclick="MODULO_TEMAS.aplicarTema('${id}')">
                                    <div class="tema-preview tema-${id}">
                                        <div class="preview-header" style="background: ${tema.cores.primary}"></div>
                                        <div class="preview-sidebar" style="background: ${tema.cores.sidebar}"></div>
                                        <div class="preview-content" style="background: ${tema.cores.background}"></div>
                                    </div>
                                    <div class="tema-nome">
                                        <i class="fas ${tema.icone}"></i>
                                        ${tema.nome}
                                    </div>
                                    ${temaAtual === id ? '<span class="tema-ativo"><i class="fas fa-check"></i></span>' : ''}
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="tema-personalizado">
                            <h4>Personalizar</h4>
                            <div class="personalizacao-cores">
                                <div class="cor-item">
                                    <label>Primária</label>
                                    <input type="color" id="cor-primary" value="${TEMAS[temaAtual].cores.primary}">
                                </div>
                                <div class="cor-item">
                                    <label>Fundo</label>
                                    <input type="color" id="cor-background" value="${TEMAS[temaAtual].cores.background}">
                                </div>
                                <div class="cor-item">
                                    <label>Superfície</label>
                                    <input type="color" id="cor-surface" value="${TEMAS[temaAtual].cores.surface}">
                                </div>
                                <div class="cor-item">
                                    <label>Texto</label>
                                    <input type="color" id="cor-text" value="${TEMAS[temaAtual].cores.text}">
                                </div>
                            </div>
                            <button class="btn btn-primary btn-block" onclick="MODULO_TEMAS.aplicarPersonalizacao()">
                                Aplicar
                            </button>
                        </div>
                        
                        <div class="tema-footer">
                            <label class="toggle-label">
                                <input type="checkbox" id="tema-auto" onchange="MODULO_TEMAS.toggleAutoTema()">
                                <span class="toggle-text">Automático (seguir sistema)</span>
                            </label>
                        </div>
                    </div>
                </div>
            `;

            headerRight.insertAdjacentHTML('afterbegin', seletorHTML);

            // Adicionar estilos
            adicionarEstilosTemas();

            // Configurar eventos
            document.getElementById('tema-toggle')?.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('tema-painel')?.classList.toggle('ativo');
            });

            // Fechar ao clicar fora
            document.addEventListener('click', (e) => {
                const painel = document.getElementById('tema-painel');
                const toggle = document.getElementById('tema-toggle');
                
                if (painel && toggle && !toggle.contains(e.target) && !painel.contains(e.target)) {
                    painel.classList.remove('ativo');
                }
            });
        }

        function adicionarEstilosTemas() {
            if (document.getElementById('style-temas')) return;

            const style = document.createElement('style');
            style.id = 'style-temas';
            style.textContent = `
                /* ========== SELETOR DE TEMAS ========== */
                .tema-dropdown {
                    position: relative;
                }
                
                #tema-toggle {
                    position: relative;
                }
                
                .tema-painel {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    width: 320px;
                    background: var(--tema-surface);
                    border-radius: 8px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                    margin-top: 10px;
                    padding: 15px;
                    display: none;
                    z-index: 1000;
                    color: var(--tema-text);
                    border: 1px solid var(--tema-border);
                }
                
                .tema-painel.ativo {
                    display: block;
                }
                
                .tema-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                
                .tema-header h3 {
                    margin: 0;
                    font-size: 1rem;
                }
                
                .temas-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-bottom: 15px;
                }
                
                .tema-card {
                    padding: 10px;
                    border: 2px solid transparent;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.3s;
                    position: relative;
                }
                
                .tema-card:hover {
                    background: var(--tema-cardHover);
                }
                
                .tema-card.ativo {
                    border-color: var(--tema-primary);
                }
                
                .tema-preview {
                    height: 60px;
                    border-radius: 4px;
                    overflow: hidden;
                    display: flex;
                    margin-bottom: 8px;
                }
                
                .preview-header {
                    width: 30%;
                    height: 100%;
                }
                
                .preview-sidebar {
                    width: 20%;
                    height: 100%;
                }
                
                .preview-content {
                    width: 50%;
                    height: 100%;
                }
                
                .tema-nome {
                    font-size: 0.85rem;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                }
                
                .tema-ativo {
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: var(--tema-primary);
                    color: white;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.7rem;
                }
                
                .tema-personalizado {
                    border-top: 1px solid var(--tema-border);
                    padding-top: 15px;
                    margin-top: 15px;
                }
                
                .tema-personalizado h4 {
                    margin: 0 0 10px 0;
                    font-size: 0.9rem;
                }
                
                .personalizacao-cores {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-bottom: 15px;
                }
                
                .cor-item {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                
                .cor-item label {
                    font-size: 0.8rem;
                    color: var(--tema-textSecondary);
                }
                
                .cor-item input[type="color"] {
                    width: 100%;
                    height: 35px;
                    border: 1px solid var(--tema-border);
                    border-radius: 4px;
                    background: var(--tema-input);
                    cursor: pointer;
                }
                
                .tema-footer {
                    border-top: 1px solid var(--tema-border);
                    padding-top: 15px;
                    margin-top: 15px;
                }
                
                .toggle-label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                }
                
                /* ========== VARIÁVEIS DE TEMA ========== */
                :root {
                    ${Object.entries(TEMAS.claro.cores).map(([key, value]) => 
                        `--tema-${key}: ${value};`
                    ).join('\n')}
                }
                
                /* Aplicar variáveis nos elementos */
                body {
                    background: var(--tema-background);
                    color: var(--tema-text);
                }
                
                .header {
                    background: var(--tema-header);
                    border-bottom: 1px solid var(--tema-border);
                }
                
                .sidebar {
                    background: var(--tema-sidebar);
                    color: var(--tema-sidebarText);
                }
                
                .menu-link {
                    color: var(--tema-sidebarText);
                }
                
                .menu-link:hover {
                    background: rgba(255,255,255,0.1);
                }
                
                .main-content {
                    background: var(--tema-background);
                }
                
                .stat-card, .card, .profile-card, .info-card {
                    background: var(--tema-card);
                    border: 1px solid var(--tema-border);
                }
                
                .quick-actions, .recent-activity {
                    background: var(--tema-card);
                }
                
                .action-btn {
                    background: var(--tema-surface);
                    border: 1px solid var(--tema-border);
                    color: var(--tema-text);
                }
                
                .action-btn:hover {
                    background: var(--tema-cardHover);
                }
                
                input, select, textarea {
                    background: var(--tema-input);
                    border-color: var(--tema-inputBorder);
                    color: var(--tema-text);
                }
                
                input:focus, select:focus, textarea:focus {
                    border-color: var(--tema-inputFocus);
                }
                
                .modal-content {
                    background: var(--tema-surface);
                }
                
                .footer {
                    background: var(--tema-sidebar);
                    color: var(--tema-sidebarText);
                }
                
                .table, .data-table, .notas-table, .frequencia-table {
                    background: var(--tema-card);
                }
                
                .table th, .data-table th, .notas-table th {
                    background: var(--tema-secondary);
                    color: var(--tema-sidebarText);
                }
                
                .table td, .data-table td {
                    border-color: var(--tema-border);
                }
                
                .table tr:hover {
                    background: var(--tema-cardHover);
                }
                
                /* Ajustes para gráficos */
                .grafico-card {
                    background: var(--tema-card);
                    border: 1px solid var(--tema-border);
                }
                
                /* Ajustes para o seletor de temas */
                .tema-painel input[type="color"] {
                    background: var(--tema-input);
                    border-color: var(--tema-inputBorder);
                }
            `;

            document.head.appendChild(style);
        }

        function atualizarSeletorTemas() {
            const toggle = document.getElementById('tema-toggle');
            if (toggle) {
                toggle.innerHTML = `<i class="fas ${TEMAS[temaAtual].icone}"></i>`;
            }

            // Atualizar cards ativos
            document.querySelectorAll('.tema-card').forEach(card => {
                card.classList.remove('ativo');
                const iconeAtivo = card.querySelector('.tema-ativo');
                if (iconeAtivo) iconeAtivo.remove();
            });

            const cardAtivo = document.querySelector(`.tema-card[onclick*="${temaAtual}"]`);
            if (cardAtivo) {
                cardAtivo.classList.add('ativo');
                cardAtivo.insertAdjacentHTML('beforeend', '<span class="tema-ativo"><i class="fas fa-check"></i></span>');
            }
        }

        // ==================== PERSONALIZAÇÃO ====================
        function aplicarPersonalizacao() {
            const cores = {
                primary: document.getElementById('cor-primary')?.value,
                background: document.getElementById('cor-background')?.value,
                surface: document.getElementById('cor-surface')?.value,
                text: document.getElementById('cor-text')?.value
            };

            personalizarTema(cores);
            atualizarSeletorTemas();
            fecharPainel();
        }

        // ==================== TEMA AUTOMÁTICO ====================
        function toggleAutoTema() {
            const auto = document.getElementById('tema-auto').checked;
            
            if (auto) {
                // Detectar preferência do sistema
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                aplicarTema(prefersDark ? 'escuro' : 'claro');
                
                // Ouvir mudanças
                window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
                    aplicarTema(e.matches ? 'escuro' : 'claro');
                });
            }
            
            localStorage.setItem('tema_auto', auto);
        }

        // ==================== OBSERVADORES ====================
        function observarElementos() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        // Reaplicar tema em novos elementos se necessário
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        function inscrever(callback) {
            observadores.push(callback);
        }

        function notificarObservadores(temaId) {
            observadores.forEach(cb => {
                try {
                    cb(temaId, TEMAS[temaId]);
                } catch (e) {
                    console.error('Erro ao notificar observador:', e);
                }
            });
        }

        // ==================== PERSISTÊNCIA ====================
        function salvarTema(temaId, personalizado = null) {
            try {
                const dados = {
                    tema: temaId,
                    personalizado: personalizado
                };
                localStorage.setItem('sme_tema', JSON.stringify(dados));
            } catch (e) {
                console.error('Erro ao salvar tema:', e);
            }
        }

        function carregarTema() {
            try {
                const saved = localStorage.getItem('sme_tema');
                if (saved) {
                    const dados = JSON.parse(saved);
                    temaAtual = dados.tema;
                    temaPersonalizado = dados.personalizado;
                    
                    // Verificar tema automático
                    const auto = localStorage.getItem('tema_auto') === 'true';
                    if (auto) {
                        document.getElementById('tema-auto').checked = true;
                        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                        temaAtual = prefersDark ? 'escuro' : 'claro';
                    }
                }
            } catch (e) {
                console.error('Erro ao carregar tema:', e);
            }
        }

        function fecharPainel() {
            document.getElementById('tema-painel')?.classList.remove('ativo');
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            aplicarTema,
            getTemaAtual,
            getTemasDisponiveis,
            personalizarTema,
            aplicarPersonalizacao,
            toggleAutoTema,
            inscrever,
            fecharPainel
        };
    })();

    // Inicializar quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            MODULO_TEMAS.init();
        }, 1500);
    });

    window.MODULO_TEMAS = MODULO_TEMAS;
    console.log('✅ Módulo de Temas carregado');
}
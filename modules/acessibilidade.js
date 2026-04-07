// modulos/acessibilidade.js - Recursos de Acessibilidade (WCAG)
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_ACESSIBILIDADE === 'undefined') {
    const MODULO_ACESSIBILIDADE = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            tamanhosFonte: {
                pequeno: 14,
                normal: 16,
                grande: 18,
                muitoGrande: 20
            },
            espacamentos: {
                normal: 1,
                grande: 1.5,
                muitoGrande: 2
            },
            contrastes: {
                normal: 'normal',
                alto: 'alto',
                claro: 'claro'
            }
        };

        // ==================== ESTADO ====================
        let preferencias = {
            tamanhoFonte: 'normal',
            espacamento: 'normal',
            contraste: 'normal',
            leitorTela: false,
            animacoes: true,
            altoContraste: false,
            monochrome: false
        };

        let observers = [];

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('♿ Sistema de Acessibilidade inicializado');
            
            // Carregar preferências salvas
            carregarPreferencias();
            
            // Aplicar preferências
            aplicarPreferencias();
            
            // Adicionar botão de acessibilidade
            adicionarBotaoAcessibilidade();
            
            // Adicionar atalhos de teclado
            adicionarAtalhosTeclado();
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    'Sistema de acessibilidade inicializado',
                    MODULO_AUDITORIA.categorias.SISTEMA,
                    MODULO_AUDITORIA.niveis.INFO
                );
            }
        }

        // ==================== FUNÇÕES DE ACESSIBILIDADE ====================
        function aumentarFonte() {
            const tamanhos = Object.keys(CONFIG.tamanhosFonte);
            const indexAtual = tamanhos.indexOf(preferencias.tamanhoFonte);
            
            if (indexAtual < tamanhos.length - 1) {
                preferencias.tamanhoFonte = tamanhos[indexAtual + 1];
                aplicarTamanhoFonte();
                salvarPreferencias();
                notificarObservers('tamanhoFonte', preferencias.tamanhoFonte);
            }
        }

        function diminuirFonte() {
            const tamanhos = Object.keys(CONFIG.tamanhosFonte);
            const indexAtual = tamanhos.indexOf(preferencias.tamanhoFonte);
            
            if (indexAtual > 0) {
                preferencias.tamanhoFonte = tamanhos[indexAtual - 1];
                aplicarTamanhoFonte();
                salvarPreferencias();
                notificarObservers('tamanhoFonte', preferencias.tamanhoFonte);
            }
        }

        function aumentarEspacamento() {
            const espacos = Object.keys(CONFIG.espacamentos);
            const indexAtual = espacos.indexOf(preferencias.espacamento);
            
            if (indexAtual < espacos.length - 1) {
                preferencias.espacamento = espacos[indexAtual + 1];
                aplicarEspacamento();
                salvarPreferencias();
                notificarObservers('espacamento', preferencias.espacamento);
            }
        }

        function diminuirEspacamento() {
            const espacos = Object.keys(CONFIG.espacamentos);
            const indexAtual = espacos.indexOf(preferencias.espacamento);
            
            if (indexAtual > 0) {
                preferencias.espacamento = espacos[indexAtual - 1];
                aplicarEspacamento();
                salvarPreferencias();
                notificarObservers('espacamento', preferencias.espacamento);
            }
        }

        function toggleAltoContraste() {
            preferencias.altoContraste = !preferencias.altoContraste;
            aplicarContraste();
            salvarPreferencias();
            notificarObservers('altoContraste', preferencias.altoContraste);
        }

        function toggleMonochrome() {
            preferencias.monochrome = !preferencias.monochrome;
            aplicarMonochrome();
            salvarPreferencias();
            notificarObservers('monochrome', preferencias.monochrome);
        }

        function toggleAnimacoes() {
            preferencias.animacoes = !preferencias.animacoes;
            aplicarAnimacoes();
            salvarPreferencias();
            notificarObservers('animacoes', preferencias.animacoes);
        }

        function aplicarTamanhoFonte() {
            const tamanho = CONFIG.tamanhosFonte[preferencias.tamanhoFonte];
            document.documentElement.style.setProperty('--fonte-base', `${tamanho}px`);
            
            // Ajustar elementos específicos
            document.querySelectorAll('h1').forEach(el => {
                el.style.fontSize = `${tamanho * 2}px`;
            });
            
            document.querySelectorAll('h2').forEach(el => {
                el.style.fontSize = `${tamanho * 1.5}px`;
            });
        }

        function aplicarEspacamento() {
            const espacamento = CONFIG.espacamentos[preferencias.espacamento];
            document.documentElement.style.setProperty('--espacamento-linha', espacamento);
            
            document.querySelectorAll('p, li, .texto').forEach(el => {
                el.style.lineHeight = espacamento;
            });
        }

        function aplicarContraste() {
            if (preferencias.altoContraste) {
                document.body.classList.add('alto-contraste');
                
                // Ajustar cores para alto contraste
                const style = document.getElementById('style-alto-contraste') || criarEstiloAltoContraste();
                style.textContent = `
                    .alto-contraste {
                        --tema-text: #ffffff !important;
                        --tema-background: #000000 !important;
                        --tema-primary: #ffff00 !important;
                        --tema-secondary: #00ffff !important;
                        --tema-border: #ffffff !important;
                    }
                    
                    .alto-contraste a {
                        color: #ffff00 !important;
                        text-decoration: underline !important;
                    }
                    
                    .alto-contraste button {
                        border: 2px solid #ffffff !important;
                    }
                    
                    .alto-contraste input,
                    .alto-contraste select,
                    .alto-contraste textarea {
                        border: 2px solid #ffffff !important;
                        background: #000000 !important;
                        color: #ffffff !important;
                    }
                `;
            } else {
                document.body.classList.remove('alto-contraste');
                const style = document.getElementById('style-alto-contraste');
                if (style) style.remove();
            }
        }

        function aplicarMonochrome() {
            if (preferencias.monochrome) {
                document.body.classList.add('monochrome');
                
                const style = document.getElementById('style-monochrome') || document.createElement('style');
                style.id = 'style-monochrome';
                style.textContent = `
                    .monochrome * {
                        filter: grayscale(100%) !important;
                    }
                `;
                document.head.appendChild(style);
            } else {
                document.body.classList.remove('monochrome');
                const style = document.getElementById('style-monochrome');
                if (style) style.remove();
            }
        }

        function aplicarAnimacoes() {
            if (!preferencias.animacoes) {
                const style = document.getElementById('style-sem-animacoes') || document.createElement('style');
                style.id = 'style-sem-animacoes';
                style.textContent = `
                    * {
                        animation: none !important;
                        transition: none !important;
                    }
                `;
                document.head.appendChild(style);
            } else {
                const style = document.getElementById('style-sem-animacoes');
                if (style) style.remove();
            }
        }

        function aplicarPreferencias() {
            aplicarTamanhoFonte();
            aplicarEspacamento();
            aplicarContraste();
            aplicarMonochrome();
            aplicarAnimacoes();
        }

        function criarEstiloAltoContraste() {
            const style = document.createElement('style');
            style.id = 'style-alto-contraste';
            document.head.appendChild(style);
            return style;
        }

        // ==================== INTERFACE DO USUÁRIO ====================
        function adicionarBotaoAcessibilidade() {
            const body = document.body;

            const botaoHTML = `
                <div class="acessibilidade-flutuante" id="acessibilidade-menu">
                    <button class="btn-acessibilidade" id="btn-abrir-acessibilidade" title="Opções de Acessibilidade">
                        <i class="fas fa-universal-access"></i>
                    </button>
                    
                    <div class="acessibilidade-painel" id="acessibilidade-painel">
                        <div class="acessibilidade-header">
                            <h3>Acessibilidade</h3>
                            <button class="btn-icon" onclick="MODULO_ACESSIBILIDADE.fecharPainel()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div class="acessibilidade-opcoes">
                            <div class="opcao-grupo">
                                <h4>Tamanho da Fonte</h4>
                                <div class="botoes-grupo">
                                    <button class="btn-acao" onclick="MODULO_ACESSIBILIDADE.diminuirFonte()" title="Diminuir fonte">
                                        <i class="fas fa-minus-circle"></i>
                                    </button>
                                    <span class="valor-atual">${preferencias.tamanhoFonte}</span>
                                    <button class="btn-acao" onclick="MODULO_ACESSIBILIDADE.aumentarFonte()" title="Aumentar fonte">
                                        <i class="fas fa-plus-circle"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="opcao-grupo">
                                <h4>Espaçamento</h4>
                                <div class="botoes-grupo">
                                    <button class="btn-acao" onclick="MODULO_ACESSIBILIDADE.diminuirEspacamento()" title="Diminuir espaçamento">
                                        <i class="fas fa-compress-arrows-alt"></i>
                                    </button>
                                    <span class="valor-atual">${preferencias.espacamento}</span>
                                    <button class="btn-acao" onclick="MODULO_ACESSIBILIDADE.aumentarEspacamento()" title="Aumentar espaçamento">
                                        <i class="fas fa-expand-arrows-alt"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="opcao-toggle">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="toggle-contraste" ${preferencias.altoContraste ? 'checked' : ''} 
                                           onchange="MODULO_ACESSIBILIDADE.toggleAltoContraste()">
                                    <span class="toggle-slider"></span>
                                </label>
                                <span>Alto Contraste</span>
                            </div>
                            
                            <div class="opcao-toggle">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="toggle-monochrome" ${preferencias.monochrome ? 'checked' : ''} 
                                           onchange="MODULO_ACESSIBILIDADE.toggleMonochrome()">
                                    <span class="toggle-slider"></span>
                                </label>
                                <span>Modo Monocromático</span>
                            </div>
                            
                            <div class="opcao-toggle">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="toggle-animacoes" ${preferencias.animacoes ? 'checked' : ''} 
                                           onchange="MODULO_ACESSIBILIDADE.toggleAnimacoes()">
                                    <span class="toggle-slider"></span>
                                </label>
                                <span>Animações</span>
                            </div>
                            
                            <div class="opcao-grupo">
                                <h4>Leitor de Tela</h4>
                                <button class="btn-leitor" onclick="MODULO_ACESSIBILIDADE.lerPagina()">
                                    <i class="fas fa-volume-up"></i> Ler página
                                </button>
                                <button class="btn-leitor" onclick="MODULO_ACESSIBILIDADE.pararLeitor()">
                                    <i class="fas fa-stop"></i> Parar
                                </button>
                            </div>
                        </div>
                        
                        <div class="acessibilidade-footer">
                            <button class="btn btn-secondary" onclick="MODULO_ACESSIBILIDADE.resetarPreferencias()">
                                Resetar
                            </button>
                        </div>
                    </div>
                </div>
            `;

            body.insertAdjacentHTML('beforeend', botaoHTML);

            // Adicionar estilos
            adicionarEstilosAcessibilidade();

            // Configurar eventos
            document.getElementById('btn-abrir-acessibilidade')?.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('acessibilidade-painel')?.classList.toggle('aberto');
            });

            document.addEventListener('click', (e) => {
                const menu = document.getElementById('acessibilidade-menu');
                const painel = document.getElementById('acessibilidade-painel');
                
                if (menu && painel && !menu.contains(e.target)) {
                    painel.classList.remove('aberto');
                }
            });
        }

        function adicionarEstilosAcessibilidade() {
            if (document.getElementById('style-acessibilidade')) return;

            const style = document.createElement('style');
            style.id = 'style-acessibilidade';
            style.textContent = `
                .acessibilidade-flutuante {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 9998;
                }
                
                .btn-acessibilidade {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: var(--tema-primary);
                    color: white;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                    transition: all 0.3s;
                }
                
                .btn-acessibilidade:hover {
                    transform: scale(1.1);
                }
                
                .acessibilidade-painel {
                    position: absolute;
                    bottom: 60px;
                    right: 0;
                    width: 300px;
                    background: var(--tema-surface);
                    border: 1px solid var(--tema-border);
                    border-radius: 10px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                    display: none;
                }
                
                .acessibilidade-painel.aberto {
                    display: block;
                }
                
                .acessibilidade-header {
                    padding: 15px;
                    border-bottom: 1px solid var(--tema-border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .acessibilidade-header h3 {
                    margin: 0;
                }
                
                .acessibilidade-opcoes {
                    padding: 15px;
                }
                
                .opcao-grupo {
                    margin-bottom: 20px;
                }
                
                .opcao-grupo h4 {
                    margin: 0 0 10px 0;
                    font-size: 0.9rem;
                    color: var(--tema-textSecondary);
                }
                
                .botoes-grupo {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                }
                
                .btn-acao {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 1px solid var(--tema-border);
                    background: var(--tema-surface);
                    color: var(--tema-text);
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .btn-acao:hover {
                    background: var(--tema-primary);
                    color: white;
                }
                
                .valor-atual {
                    font-weight: 600;
                    text-transform: capitalize;
                }
                
                .opcao-toggle {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 15px;
                }
                
                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 24px;
                }
                
                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                
                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                    border-radius: 24px;
                }
                
                .toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 16px;
                    width: 16px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                
                input:checked + .toggle-slider {
                    background-color: var(--tema-primary);
                }
                
                input:checked + .toggle-slider:before {
                    transform: translateX(26px);
                }
                
                .btn-leitor {
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 10px;
                    border: 1px solid var(--tema-border);
                    background: var(--tema-surface);
                    color: var(--tema-text);
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .btn-leitor:hover {
                    background: var(--tema-primary);
                    color: white;
                }
                
                .acessibilidade-footer {
                    padding: 15px;
                    border-top: 1px solid var(--tema-border);
                    text-align: center;
                }
                
                /* Foco visível para navegação por teclado */
                *:focus-visible {
                    outline: 3px solid var(--tema-primary) !important;
                    outline-offset: 2px !important;
                }
                
                /* Skip to content link */
                .skip-link {
                    position: absolute;
                    top: -40px;
                    left: 0;
                    background: var(--tema-primary);
                    color: white;
                    padding: 8px;
                    z-index: 10000;
                    text-decoration: none;
                }
                
                .skip-link:focus {
                    top: 0;
                }
            `;

            document.head.appendChild(style);

            // Adicionar skip link
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.className = 'skip-link';
            skipLink.textContent = 'Pular para o conteúdo principal';
            document.body.insertAdjacentElement('afterbegin', skipLink);
        }

        function fecharPainel() {
            document.getElementById('acessibilidade-painel')?.classList.remove('aberto');
        }

        function resetarPreferencias() {
            preferencias = {
                tamanhoFonte: 'normal',
                espacamento: 'normal',
                contraste: 'normal',
                leitorTela: false,
                animacoes: true,
                altoContraste: false,
                monochrome: false
            };
            
            aplicarPreferencias();
            salvarPreferencias();
            atualizarInterface();
            
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoInfo(
                    'Acessibilidade',
                    'Preferências resetadas'
                );
            }
        }

        function atualizarInterface() {
            document.querySelector('.valor-atual').textContent = preferencias.tamanhoFonte;
            document.getElementById('toggle-contraste').checked = preferencias.altoContraste;
            document.getElementById('toggle-monochrome').checked = preferencias.monochrome;
            document.getElementById('toggle-animacoes').checked = preferencias.animacoes;
        }

        // ==================== LEITOR DE TELA ====================
        let synth = window.speechSynthesis;
        let utterance = null;

        function lerPagina() {
            if (!synth) {
                alert('Leitor de tela não suportado neste navegador');
                return;
            }

            // Parar qualquer leitura em andamento
            pararLeitor();

            // Coletar texto da página
            const textos = [];
            
            // Título
            const titulo = document.querySelector('h1')?.textContent;
            if (titulo) textos.push(titulo);
            
            // Conteúdo principal
            const main = document.getElementById('content-area');
            if (main) {
                textos.push(main.textContent);
            }

            const textoCompleto = textos.join('. ');

            utterance = new SpeechSynthesisUtterance(textoCompleto);
            utterance.lang = 'pt-BR';
            utterance.rate = 0.9;
            
            synth.speak(utterance);

            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    'Leitor de tela ativado',
                    MODULO_AUDITORIA.categorias.ACESSIBILIDADE,
                    MODULO_AUDITORIA.niveis.INFO
                );
            }
        }

        function pararLeitor() {
            if (synth && utterance) {
                synth.cancel();
            }
        }

        // ==================== ATALHOS DE TECLADO ====================
        function adicionarAtalhosTeclado() {
            document.addEventListener('keydown', (e) => {
                // Alt + A: Abrir menu de acessibilidade
                if (e.altKey && e.key === 'a') {
                    e.preventDefault();
                    document.getElementById('acessibilidade-painel')?.classList.toggle('aberto');
                }
                
                // Alt + +: Aumentar fonte
                if (e.altKey && e.key === '+') {
                    e.preventDefault();
                    aumentarFonte();
                }
                
                // Alt + -: Diminuir fonte
                if (e.altKey && e.key === '-') {
                    e.preventDefault();
                    diminuirFonte();
                }
                
                // Alt + C: Alto contraste
                if (e.altKey && e.key === 'c') {
                    e.preventDefault();
                    toggleAltoContraste();
                }
                
                // Alt + L: Ler página
                if (e.altKey && e.key === 'l') {
                    e.preventDefault();
                    lerPagina();
                }
                
                // Esc: Parar leitor
                if (e.key === 'Escape') {
                    pararLeitor();
                }
            });
        }

        // ==================== OBSERVERS ====================
        function observar(callback) {
            observers.push(callback);
            return () => {
                observers = observers.filter(cb => cb !== callback);
            };
        }

        function notificarObservers(chave, valor) {
            observers.forEach(cb => {
                try {
                    cb(chave, valor);
                } catch (e) {
                    console.error('Erro ao notificar observer:', e);
                }
            });
        }

        // ==================== PERSISTÊNCIA ====================
        function salvarPreferencias() {
            try {
                localStorage.setItem('sme_acessibilidade', JSON.stringify(preferencias));
            } catch (e) {
                console.error('Erro ao salvar preferências:', e);
            }
        }

        function carregarPreferencias() {
            try {
                const saved = localStorage.getItem('sme_acessibilidade');
                if (saved) {
                    preferencias = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar preferências:', e);
            }
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            aumentarFonte,
            diminuirFonte,
            aumentarEspacamento,
            diminuirEspacamento,
            toggleAltoContraste,
            toggleMonochrome,
            toggleAnimacoes,
            lerPagina,
            pararLeitor,
            resetarPreferencias,
            fecharPainel,
            observar,
            getPreferencias: () => ({ ...preferencias })
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_ACESSIBILIDADE.init();
        }, 5000);
    });

    window.MODULO_ACESSIBILIDADE = MODULO_ACESSIBILIDADE;
    console.log('✅ Módulo de Acessibilidade carregado');
}
// modulos/tutorial.js - Tutorial Interativo
// Sistema de Gestão Educacional Municipal - FASE 7

if (typeof MODULO_TUTORIAL === 'undefined') {
    const MODULO_TUTORIAL = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            versao: '1.0.0',
            tutorialKey: 'sme_tutorial_completado',
            passoKey: 'sme_tutorial_passo',
            autoIniciar: true,
            mostrarSempre: false,
            duracaoPopover: 5000,
            posicoes: {
                TOP: 'top',
                BOTTOM: 'bottom',
                LEFT: 'left',
                RIGHT: 'right',
                CENTER: 'center'
            },
            temas: {
                CLARO: 'claro',
                ESCURO: 'escuro',
                COLORIDO: 'colorido'
            }
        };

        // ==================== ESTADO ====================
        let tutoriais = {};
        let tutorialAtual = null;
        let passoAtual = 0;
        let tutorialAtivo = false;
        let overlayAtivo = false;

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('🎓 Módulo de Tutorial Interativo inicializado');
            
            carregarTutoriais();
            verificarTutorialInicial();
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                MODULO_AUDITORIA_AVANCADA.registrarLog(
                    'Módulo de tutorial interativo inicializado',
                    MODULO_AUDITORIA_AVANCADA.categorias?.SISTEMA || 'sistema',
                    MODULO_AUDITORIA_AVANCADA.niveis?.INFO || 'info'
                );
            }
        }

        // ==================== TUTORIAIS PRÉ-DEFINIDOS ====================
        function carregarTutoriais() {
            tutoriais = {
                'boas-vindas': {
                    id: 'boas-vindas',
                    titulo: 'Bem-vindo ao Sistema',
                    descricao: 'Conheça as principais funcionalidades do sistema',
                    passos: [
                        {
                            elemento: '.welcome-header',
                            titulo: 'Dashboard',
                            conteudo: 'Esta é sua página inicial. Aqui você verá um resumo das informações mais importantes.',
                            posicao: CONFIG.posicoes.BOTTOM,
                            highlight: true
                        },
                        {
                            elemento: '.dashboard-stats',
                            titulo: 'Estatísticas',
                            conteudo: 'Aqui você acompanha números importantes do sistema.',
                            posicao: CONFIG.posicoes.TOP,
                            highlight: true
                        },
                        {
                            elemento: '.quick-actions',
                            titulo: 'Ações Rápidas',
                            conteudo: 'Atalhos para as funcionalidades mais usadas.',
                            posicao: CONFIG.posicoes.TOP,
                            highlight: true
                        },
                        {
                            elemento: '.sidebar',
                            titulo: 'Menu Principal',
                            conteudo: 'Navegue por todas as funcionalidades do sistema.',
                            posicao: CONFIG.posicoes.RIGHT,
                            highlight: true
                        }
                    ]
                },
                'alunos': {
                    id: 'alunos',
                    titulo: 'Gestão de Alunos',
                    descricao: 'Aprenda a gerenciar alunos no sistema',
                    passos: [
                        {
                            elemento: '[data-modulo="alunos"]',
                            titulo: 'Módulo Alunos',
                            conteudo: 'Clique aqui para acessar a gestão de alunos.',
                            posicao: CONFIG.posicoes.RIGHT,
                            highlight: true
                        },
                        {
                            elemento: '.content-header .btn-success',
                            titulo: 'Novo Aluno',
                            conteudo: 'Use este botão para cadastrar um novo aluno.',
                            posicao: CONFIG.posicoes.BOTTOM,
                            highlight: true
                        },
                        {
                            elemento: '.aluno-card:first-child',
                            titulo: 'Visualizar Aluno',
                            conteudo: 'Clique em um aluno para ver detalhes.',
                            posicao: CONFIG.posicoes.TOP,
                            highlight: true
                        }
                    ]
                },
                'professores': {
                    id: 'professores',
                    titulo: 'Gestão de Professores',
                    descricao: 'Aprenda a gerenciar professores',
                    passos: [
                        {
                            elemento: '[data-modulo="professores"]',
                            titulo: 'Módulo Professores',
                            conteudo: 'Acesse a gestão de professores.',
                            posicao: CONFIG.posicoes.RIGHT,
                            highlight: true
                        },
                        {
                            elemento: '.content-header .btn-success',
                            titulo: 'Novo Professor',
                            conteudo: 'Cadastre um novo professor.',
                            posicao: CONFIG.posicoes.BOTTOM,
                            highlight: true
                        }
                    ]
                },
                'relatorios': {
                    id: 'relatorios',
                    titulo: 'Relatórios',
                    descricao: 'Como gerar e exportar relatórios',
                    passos: [
                        {
                            elemento: '[data-modulo="relatorios"]',
                            titulo: 'Módulo Relatórios',
                            conteudo: 'Acesse a área de relatórios.',
                            posicao: CONFIG.posicoes.RIGHT,
                            highlight: true
                        },
                        {
                            elemento: '.relatorios-grid',
                            titulo: 'Tipos de Relatório',
                            conteudo: 'Escolha o tipo de relatório que deseja gerar.',
                            posicao: CONFIG.posicoes.TOP,
                            highlight: true
                        },
                        {
                            elemento: '.export-actions',
                            titulo: 'Exportar',
                            conteudo: 'Exporte seus relatórios em vários formatos.',
                            posicao: CONFIG.posicoes.TOP,
                            highlight: true
                        }
                    ]
                }
            };
        }

        // ==================== CONTROLE DE TUTORIAIS ====================
        function iniciarTutorial(tutorialId) {
            const tutorial = tutoriais[tutorialId];
            if (!tutorial) {
                console.error('Tutorial não encontrado:', tutorialId);
                return;
            }

            tutorialAtual = tutorial;
            passoAtual = 0;
            tutorialAtivo = true;

            criarOverlay();
            mostrarPasso();
            
            salvarProgresso(tutorialId, passoAtual);
            
            if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                MODULO_AUDITORIA_AVANCADA.registrarLog(
                    `Tutorial iniciado: ${tutorial.titulo}`,
                    MODULO_AUDITORIA_AVANCADA.categorias?.USUARIO || 'usuario',
                    MODULO_AUDITORIA_AVANCADA.niveis?.INFO || 'info'
                );
            }
        }

        function mostrarPasso() {
            if (!tutorialAtual || passoAtual >= tutorialAtual.passos.length) {
                finalizarTutorial();
                return;
            }

            const passo = tutorialAtual.passos[passoAtual];
            const elemento = document.querySelector(passo.elemento);

            if (!elemento) {
                console.warn('Elemento não encontrado:', passo.elemento);
                proximoPasso();
                return;
            }

            destacarElemento(elemento, passo.highlight);
            mostrarPopover(elemento, passo);
        }

        function proximoPasso() {
            passoAtual++;
            salvarProgresso(tutorialAtual.id, passoAtual);
            mostrarPasso();
        }

        function passoAnterior() {
            if (passoAtual > 0) {
                passoAtual--;
                salvarProgresso(tutorialAtual.id, passoAtual);
                mostrarPasso();
            }
        }

        function finalizarTutorial() {
            tutorialAtivo = false;
            removerOverlay();
            removerDestaques();
            
            marcarTutorialConcluido(tutorialAtual.id);
            
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                    'Tutorial Concluído',
                    'Parabéns! Você completou o tutorial.'
                );
            }
            
            tutorialAtual = null;
            passoAtual = 0;
        }

        function cancelarTutorial() {
            tutorialAtivo = false;
            removerOverlay();
            removerDestaques();
            
            tutorialAtual = null;
            passoAtual = 0;
        }

        // ==================== INTERFACE DO TUTORIAL ====================
        function criarOverlay() {
            if (document.getElementById('tutorial-overlay')) return;

            const overlay = document.createElement('div');
            overlay.id = 'tutorial-overlay';
            overlay.className = 'tutorial-overlay';
            document.body.appendChild(overlay);
            overlayAtivo = true;

            // Adicionar estilos
            adicionarEstilosTutorial();
        }

        function removerOverlay() {
            const overlay = document.getElementById('tutorial-overlay');
            if (overlay) {
                overlay.remove();
                overlayAtivo = false;
            }
        }

        function destacarElemento(elemento, highlight) {
            removerDestaques();

            if (highlight) {
                elemento.classList.add('tutorial-destaque');
                
                // Scroll suave até o elemento
                elemento.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }

        function removerDestaques() {
            document.querySelectorAll('.tutorial-destaque').forEach(el => {
                el.classList.remove('tutorial-destaque');
            });
        }

        function mostrarPopover(elemento, passo) {
            // Remover popover anterior
            const popoverAnterior = document.querySelector('.tutorial-popover');
            if (popoverAnterior) {
                popoverAnterior.remove();
            }

            const rect = elemento.getBoundingClientRect();
            const popover = document.createElement('div');
            popover.className = `tutorial-popover posicao-${passo.posicao}`;
            popover.innerHTML = `
                <div class="popover-header">
                    <h4>${passo.titulo}</h4>
                    <span class="popover-passo">${passoAtual + 1}/${tutorialAtual.passos.length}</span>
                </div>
                <div class="popover-content">
                    <p>${passo.conteudo}</p>
                </div>
                <div class="popover-footer">
                    <button class="btn-link" onclick="MODULO_TUTORIAL.cancelarTutorial()">
                        <i class="fas fa-times"></i> Pular
                    </button>
                    <div>
                        ${passoAtual > 0 ? `
                            <button class="btn-secondary" onclick="MODULO_TUTORIAL.passoAnterior()">
                                <i class="fas fa-chevron-left"></i> Anterior
                            </button>
                        ` : ''}
                        <button class="btn-primary" onclick="MODULO_TUTORIAL.proximoPasso()">
                            ${passoAtual === tutorialAtual.passos.length - 1 ? 'Concluir' : 'Próximo'} 
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            `;

            // Posicionar popover
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

            switch(passo.posicao) {
                case CONFIG.posicoes.TOP:
                    popover.style.left = rect.left + scrollLeft + 'px';
                    popover.style.top = rect.top + scrollTop - popover.offsetHeight - 10 + 'px';
                    break;
                case CONFIG.posicoes.BOTTOM:
                    popover.style.left = rect.left + scrollLeft + 'px';
                    popover.style.top = rect.bottom + scrollTop + 10 + 'px';
                    break;
                case CONFIG.posicoes.LEFT:
                    popover.style.left = rect.left + scrollLeft - popover.offsetWidth - 10 + 'px';
                    popover.style.top = rect.top + scrollTop + 'px';
                    break;
                case CONFIG.posicoes.RIGHT:
                    popover.style.left = rect.right + scrollLeft + 10 + 'px';
                    popover.style.top = rect.top + scrollTop + 'px';
                    break;
                case CONFIG.posicoes.CENTER:
                    popover.style.left = '50%';
                    popover.style.top = '50%';
                    popover.style.transform = 'translate(-50%, -50%)';
                    break;
            }

            document.body.appendChild(popover);
        }

        function adicionarEstilosTutorial() {
            if (document.getElementById('style-tutorial')) return;

            const style = document.createElement('style');
            style.id = 'style-tutorial';
            style.textContent = `
                .tutorial-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 9998;
                    pointer-events: none;
                }
                
                .tutorial-destaque {
                    position: relative;
                    z-index: 9999;
                    box-shadow: 0 0 0 4px #3498db, 0 0 20px rgba(52, 152, 219, 0.5);
                    border-radius: 4px;
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 4px #3498db, 0 0 20px rgba(52, 152, 219, 0.5); }
                    50% { box-shadow: 0 0 0 8px #3498db, 0 0 30px rgba(52, 152, 219, 0.7); }
                    100% { box-shadow: 0 0 0 4px #3498db, 0 0 20px rgba(52, 152, 219, 0.5); }
                }
                
                .tutorial-popover {
                    position: absolute;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    width: 300px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                }
                
                .tutorial-popover::before {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 0;
                    border: 10px solid transparent;
                }
                
                .tutorial-popover.posicao-top::before {
                    bottom: -20px;
                    left: 20px;
                    border-top-color: white;
                }
                
                .tutorial-popover.posicao-bottom::before {
                    top: -20px;
                    left: 20px;
                    border-bottom-color: white;
                }
                
                .tutorial-popover.posicao-left::before {
                    right: -20px;
                    top: 20px;
                    border-left-color: white;
                }
                
                .tutorial-popover.posicao-right::before {
                    left: -20px;
                    top: 20px;
                    border-right-color: white;
                }
                
                .popover-header {
                    padding: 15px;
                    border-bottom: 1px solid #dee2e6;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .popover-header h4 {
                    margin: 0;
                    color: #2c3e50;
                }
                
                .popover-passo {
                    background: #3498db;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                }
                
                .popover-content {
                    padding: 15px;
                }
                
                .popover-content p {
                    margin: 0;
                    color: #7f8c8d;
                }
                
                .popover-footer {
                    padding: 15px;
                    border-top: 1px solid #dee2e6;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .popover-footer button {
                    padding: 5px 10px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.3s;
                }
                
                .popover-footer .btn-primary {
                    background: #3498db;
                    color: white;
                }
                
                .popover-footer .btn-primary:hover {
                    background: #2980b9;
                }
                
                .popover-footer .btn-secondary {
                    background: #ecf0f1;
                    color: #7f8c8d;
                }
                
                .popover-footer .btn-secondary:hover {
                    background: #bdc3c7;
                }
                
                .popover-footer .btn-link {
                    background: none;
                    color: #e74c3c;
                }
                
                .popover-footer .btn-link:hover {
                    text-decoration: underline;
                }
                
                .tutorial-botao-flutuante {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    background: #3498db;
                    color: white;
                    border: none;
                    border-radius: 50px;
                    padding: 12px 24px;
                    cursor: pointer;
                    box-shadow: 0 5px 20px rgba(52, 152, 219, 0.3);
                    z-index: 9997;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 1rem;
                    transition: all 0.3s;
                }
                
                .tutorial-botao-flutuante:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;

            document.head.appendChild(style);
        }

        // ==================== BOTÃO FLUTUANTE DE AJUDA ====================
        function adicionarBotaoAjuda() {
            if (document.getElementById('tutorial-botao')) return;

            const botao = document.createElement('button');
            botao.id = 'tutorial-botao';
            botao.className = 'tutorial-botao-flutuante';
            botao.innerHTML = `
                <i class="fas fa-question-circle"></i>
                <span>Ajuda</span>
            `;

            botao.addEventListener('click', () => {
                mostrarMenuTutoriais();
            });

            document.body.appendChild(botao);
        }

        function mostrarMenuTutoriais() {
            const tutoriaisDisponiveis = Object.values(tutoriais).filter(t => 
                !tutorialConcluido(t.id) || CONFIG.mostrarSempre
            );

            const modalHTML = `
                <div class="tutorial-menu">
                    <h3><i class="fas fa-graduation-cap"></i> Tutoriais Disponíveis</h3>
                    
                    <div class="tutorial-lista">
                        ${tutoriaisDisponiveis.map(t => `
                            <div class="tutorial-item" onclick="MODULO_TUTORIAL.iniciarTutorial('${t.id}')">
                                <div class="tutorial-info">
                                    <h4>${t.titulo}</h4>
                                    <p>${t.descricao}</p>
                                </div>
                                <div class="tutorial-meta">
                                    <span class="badge">${t.passos.length} passos</span>
                                    ${tutorialConcluido(t.id) ? '<span class="badge-success">Concluído</span>' : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="tutorial-config">
                        <label class="checkbox-label">
                            <input type="checkbox" id="tutorial-auto" 
                                   ${CONFIG.autoIniciar ? 'checked' : ''}
                                   onchange="MODULO_TUTORIAL.setAutoIniciar(this.checked)">
                            Mostrar tutorial ao iniciar
                        </label>
                        
                        <label class="checkbox-label">
                            <input type="checkbox" id="tutorial-sempre" 
                                   ${CONFIG.mostrarSempre ? 'checked' : ''}
                                   onchange="MODULO_TUTORIAL.setMostrarSempre(this.checked)">
                            Mostrar tutoriais já concluídos
                        </label>
                    </div>
                </div>
            `;

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Tutoriais', modalHTML);
            }
        }

        // ==================== CONTROLE DE PROGRESSO ====================
        function verificarTutorialInicial() {
            if (CONFIG.autoIniciar && !tutorialCompletado()) {
                setTimeout(() => {
                    iniciarTutorial('boas-vindas');
                }, 1000);
            }

            // Adicionar botão de ajuda
            adicionarBotaoAjuda();
        }

        function tutorialCompletado() {
            const completados = JSON.parse(localStorage.getItem(CONFIG.tutorialKey) || '[]');
            return completados.length > 0;
        }

        function tutorialConcluido(tutorialId) {
            const completados = JSON.parse(localStorage.getItem(CONFIG.tutorialKey) || '[]');
            return completados.includes(tutorialId);
        }

        function marcarTutorialConcluido(tutorialId) {
            const completados = JSON.parse(localStorage.getItem(CONFIG.tutorialKey) || '[]');
            if (!completados.includes(tutorialId)) {
                completados.push(tutorialId);
                localStorage.setItem(CONFIG.tutorialKey, JSON.stringify(completados));
            }
        }

        function salvarProgresso(tutorialId, passo) {
            localStorage.setItem(CONFIG.passoKey, JSON.stringify({
                tutorial: tutorialId,
                passo: passo
            }));
        }

        function carregarProgresso() {
            try {
                const saved = localStorage.getItem(CONFIG.passoKey);
                if (saved) {
                    const { tutorial, passo } = JSON.parse(saved);
                    if (tutorial && tutoriais[tutorial] && !tutorialConcluido(tutorial)) {
                        iniciarTutorial(tutorial);
                    }
                }
            } catch (e) {
                console.error('Erro ao carregar progresso:', e);
            }
        }

        function setAutoIniciar(valor) {
            CONFIG.autoIniciar = valor;
        }

        function setMostrarSempre(valor) {
            CONFIG.mostrarSempre = valor;
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            iniciarTutorial,
            proximoPasso,
            passoAnterior,
            cancelarTutorial,
            finalizarTutorial,
            mostrarMenuTutoriais,
            setAutoIniciar,
            setMostrarSempre
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_TUTORIAL.init();
        }, 6000);
    });

    window.MODULO_TUTORIAL = MODULO_TUTORIAL;
    console.log('✅ Módulo de Tutorial Interativo carregado');
}
// modulos/notificacoes.js - Sistema de Notificações
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_NOTIFICACOES === 'undefined') {
    const MODULO_NOTIFICACOES = (function() {
        'use strict';

        // ==================== DADOS DAS NOTIFICAÇÕES ====================
        let notificacoes = [];
        let inscritos = [];
        let intervalos = [];

        // ==================== TIPOS DE NOTIFICAÇÃO ====================
        const TIPOS = {
            SUCESSO: 'success',
            ERRO: 'error',
            AVISO: 'warning',
            INFO: 'info',
            EVENTO: 'evento',
            MENSAGEM: 'mensagem',
            LEMBRETE: 'lembrete'
        };

        const ICONES = {
            [TIPOS.SUCESSO]: 'fa-check-circle',
            [TIPOS.ERRO]: 'fa-exclamation-circle',
            [TIPOS.AVISO]: 'fa-exclamation-triangle',
            [TIPOS.INFO]: 'fa-info-circle',
            [TIPOS.EVENTO]: 'fa-calendar',
            [TIPOS.MENSAGEM]: 'fa-envelope',
            [TIPOS.LEMBRETE]: 'fa-bell'
        };

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('📢 Sistema de Notificações inicializado');
            
            // Carregar notificações salvas
            carregarNotificacoes();
            
            // Iniciar verificações periódicas
            iniciarVerificacoes();
            
            // Adicionar badge de notificações no menu
            adicionarBadgeNotificacoes();
        }

        // ==================== GERENCIAMENTO DE NOTIFICAÇÕES ====================
        function adicionarNotificacao(titulo, mensagem, tipo = TIPOS.INFO, opcoes = {}) {
            const notificacao = {
                id: Date.now(),
                titulo: titulo,
                mensagem: mensagem,
                tipo: tipo,
                icone: ICONES[tipo] || 'fa-info-circle',
                lida: false,
                data: new Date().toISOString(),
                link: opcoes.link || null,
                acao: opcoes.acao || null,
                prioridade: opcoes.prioridade || 0,
                expira: opcoes.expira || null
            };

            notificacoes.unshift(notificacao);
            
            // Limitar número de notificações
            if (notificacoes.length > 100) {
                notificacoes = notificacoes.slice(0, 100);
            }

            salvarNotificacoes();
            
            // Mostrar toast se for prioridade alta
            if (opcoes.prioridade >= 2 || tipo === TIPOS.ERRO || tipo === TIPOS.AVISO) {
                mostrarToastNotificacao(notificacao);
            }

            // Atualizar badges
            atualizarBadges();

            return notificacao.id;
        }

        function adicionarNotificacaoSucesso(titulo, mensagem, opcoes = {}) {
            return adicionarNotificacao(titulo, mensagem, TIPOS.SUCESSO, opcoes);
        }

        function adicionarNotificacaoErro(titulo, mensagem, opcoes = {}) {
            return adicionarNotificacao(titulo, mensagem, TIPOS.ERRO, { prioridade: 3, ...opcoes });
        }

        function adicionarNotificacaoAviso(titulo, mensagem, opcoes = {}) {
            return adicionarNotificacao(titulo, mensagem, TIPOS.AVISO, { prioridade: 2, ...opcoes });
        }

        function adicionarNotificacaoInfo(titulo, mensagem, opcoes = {}) {
            return adicionarNotificacao(titulo, mensagem, TIPOS.INFO, opcoes);
        }

        function adicionarNotificacaoEvento(titulo, mensagem, opcoes = {}) {
            return adicionarNotificacao(titulo, mensagem, TIPOS.EVENTO, { prioridade: 1, ...opcoes });
        }

        function adicionarNotificacaoLembrete(titulo, mensagem, opcoes = {}) {
            return adicionarNotificacao(titulo, mensagem, TIPOS.LEMBRETE, { prioridade: 1, ...opcoes });
        }

        function marcarComoLida(id) {
            const notificacao = notificacoes.find(n => n.id === id);
            if (notificacao) {
                notificacao.lida = true;
                salvarNotificacoes();
                atualizarBadges();
                
                // Notificar inscritos
                notificarInscritos('notificacao_lida', { id: id });
            }
        }

        function marcarTodasComoLidas() {
            notificacoes.forEach(n => n.lida = true);
            salvarNotificacoes();
            atualizarBadges();
            
            notificarInscritos('todas_lidas', {});
        }

        function removerNotificacao(id) {
            notificacoes = notificacoes.filter(n => n.id !== id);
            salvarNotificacoes();
            atualizarBadges();
        }

        function limparNotificacoes() {
            notificacoes = [];
            salvarNotificacoes();
            atualizarBadges();
        }

        function getNotificacoesNaoLidas() {
            return notificacoes.filter(n => !n.lida);
        }

        function getNotificacoesPorTipo(tipo) {
            return notificacoes.filter(n => n.tipo === tipo);
        }

        function getNotificacoesRecentes(limite = 10) {
            return notificacoes.slice(0, limite);
        }

        // ==================== NOTIFICAÇÕES AUTOMÁTICAS ====================
        function iniciarVerificacoes() {
            // Verificar a cada 30 minutos
            intervalos.push(setInterval(verificarEventosProximos, 30 * 60 * 1000));
            intervalos.push(setInterval(verificarPrazosProximos, 60 * 60 * 1000));
            intervalos.push(setInterval(verificarNovidades, 6 * 60 * 60 * 1000));
            
            // Verificações rápidas a cada 5 minutos
            intervalos.push(setInterval(verificarLembretes, 5 * 60 * 1000));
        }

        function verificarEventosProximos() {
            const usuario = SISTEMA.getEstado().usuario;
            if (!usuario) return;

            // Verificar eventos da biblioteca
            const emprestimos = MOCK_DATA.biblioteca?.emprestimos?.filter(e => 
                e.alunoId === usuario.id && e.status === 'emprestado'
            ) || [];

            emprestimos.forEach(emp => {
                const dataPrevista = new Date(emp.dataPrevista);
                const hoje = new Date();
                const diasRestantes = Math.ceil((dataPrevista - hoje) / (1000 * 60 * 60 * 24));

                if (diasRestantes === 2) {
                    adicionarNotificacaoLembrete(
                        'Devolução de Livro',
                        `Seu livro deverá ser devolvido em 2 dias.`,
                        { link: '/biblioteca/meus-emprestimos' }
                    );
                } else if (diasRestantes < 0) {
                    adicionarNotificacaoAviso(
                        'Livro em Atraso',
                        `Você está com ${Math.abs(diasRestantes)} dias de atraso na devolução.`,
                        { link: '/biblioteca/meus-emprestimos', prioridade: 3 }
                    );
                }
            });
        }

        function verificarPrazosProximos() {
            const usuario = SISTEMA.getEstado().usuario;
            if (!usuario) return;

            // Verificar prazos de atividades
            if (usuario.perfil === 'aluno') {
                const aluno = MOCK_DATA.alunos.find(a => a.email === usuario.email);
                if (!aluno) return;

                const atividades = MOCK_DATA.atividades?.filter(a => 
                    a.turmaId === aluno.turmaId
                ) || [];

                atividades.forEach(atv => {
                    const dataEntrega = new Date(atv.dataEntrega);
                    const hoje = new Date();
                    const diasRestantes = Math.ceil((dataEntrega - hoje) / (1000 * 60 * 60 * 24));

                    if (diasRestantes === 2) {
                        adicionarNotificacaoLembrete(
                            'Prazo de Atividade',
                            `A atividade "${atv.titulo}" vence em 2 dias.`,
                            { link: '/atividades/pendentes' }
                        );
                    }
                });
            }

            // Verificar reuniões
            const reunioes = MOCK_DATA.reunioes?.filter(r => {
                if (usuario.perfil === 'professor') {
                    return r.participantes?.includes(usuario.id);
                }
                return r.tipo === 'pais';
            }) || [];

            reunioes.forEach(rev => {
                const dataReuniao = new Date(rev.data);
                const hoje = new Date();
                const diasRestantes = Math.ceil((dataReuniao - hoje) / (1000 * 60 * 60 * 24));

                if (diasRestantes === 1) {
                    adicionarNotificacaoEvento(
                        'Reunião Amanhã',
                        `${rev.titulo} - ${rev.horario} no ${rev.local}`,
                        { link: '/reunioes' }
                    );
                }
            });
        }

        function verificarNovidades() {
            // Verificar novos avisos
            const usuario = SISTEMA.getEstado().usuario;
            if (!usuario) return;

            const avisosRecentes = MOCK_DATA.comunicacao?.avisos?.filter(a => {
                const dataAviso = new Date(a.data);
                const hoje = new Date();
                const diferenca = Math.ceil((hoje - dataAviso) / (1000 * 60 * 60 * 24));
                return diferenca <= 1 && (a.publico === 'todos' || a.publico === usuario.perfil);
            }) || [];

            avisosRecentes.forEach(aviso => {
                adicionarNotificacaoInfo(
                    aviso.titulo,
                    aviso.conteudo.substring(0, 100) + '...',
                    { link: '/comunicacao/avisos' }
                );
            });
        }

        function verificarLembretes() {
            // Lembretes personalizados seriam carregados do banco
            // Por enquanto, apenas exemplo
        }

        // ==================== INTERFACE ====================
        function adicionarBadgeNotificacoes() {
            const headerRight = document.querySelector('.header-right');
            if (!headerRight) return;

            const badgeHTML = `
                <div class="notificacoes-dropdown">
                    <button class="btn-icon" id="notificacoes-toggle">
                        <i class="fas fa-bell"></i>
                        <span class="badge-notificacoes" id="notificacoes-badge">0</span>
                    </button>
                    <div class="notificacoes-painel" id="notificacoes-painel">
                        <div class="notificacoes-header">
                            <h3>Notificações</h3>
                            <button class="btn-link" onclick="MODULO_NOTIFICACOES.marcarTodasComoLidas()">
                                Marcar todas como lidas
                            </button>
                        </div>
                        <div class="notificacoes-lista" id="notificacoes-lista">
                            <!-- Notificações serão inseridas aqui -->
                        </div>
                        <div class="notificacoes-footer">
                            <button class="btn-link" onclick="MODULO_NOTIFICACOES.abrirCentralNotificacoes()">
                                Ver todas
                            </button>
                        </div>
                    </div>
                </div>
            `;

            headerRight.insertAdjacentHTML('afterbegin', badgeHTML);

            // Adicionar eventos
            document.getElementById('notificacoes-toggle')?.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePainelNotificacoes();
            });

            // Fechar ao clicar fora
            document.addEventListener('click', (e) => {
                const painel = document.getElementById('notificacoes-painel');
                const toggle = document.getElementById('notificacoes-toggle');
                
                if (painel && toggle && !toggle.contains(e.target) && !painel.contains(e.target)) {
                    painel.classList.remove('aberto');
                }
            });

            // Adicionar estilos
            adicionarEstilosNotificacoes();
            
            // Atualizar badge
            atualizarBadges();
            
            // Renderizar lista
            renderizarListaNotificacoes();
        }

        function adicionarEstilosNotificacoes() {
            if (document.getElementById('style-notificacoes')) return;

            const style = document.createElement('style');
            style.id = 'style-notificacoes';
            style.textContent = `
                .notificacoes-dropdown {
                    position: relative;
                }
                
                #notificacoes-toggle {
                    position: relative;
                }
                
                .badge-notificacoes {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #e74c3c;
                    color: white;
                    font-size: 0.7rem;
                    padding: 2px 5px;
                    border-radius: 10px;
                    min-width: 18px;
                    text-align: center;
                }
                
                .notificacoes-painel {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    width: 350px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                    margin-top: 10px;
                    display: none;
                    z-index: 1000;
                }
                
                .notificacoes-painel.aberto {
                    display: block;
                }
                
                .notificacoes-header {
                    padding: 15px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .notificacoes-header h3 {
                    margin: 0;
                    font-size: 1rem;
                }
                
                .notificacoes-lista {
                    max-height: 400px;
                    overflow-y: auto;
                }
                
                .notificacao-item {
                    padding: 15px;
                    border-bottom: 1px solid #f0f0f0;
                    cursor: pointer;
                    transition: background 0.3s;
                    display: flex;
                    gap: 10px;
                }
                
                .notificacao-item:hover {
                    background: #f8f9fa;
                }
                
                .notificacao-item.nao-lida {
                    background: #f0f7ff;
                }
                
                .notificacao-item.nao-lida:hover {
                    background: #e3f0ff;
                }
                
                .notificacao-icone {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }
                
                .icone-success { background: #27ae60; }
                .icone-error { background: #e74c3c; }
                .icone-warning { background: #f39c12; }
                .icone-info { background: #3498db; }
                .icone-evento { background: #9b59b6; }
                .icone-mensagem { background: #1abc9c; }
                .icone-lembrete { background: #e67e22; }
                
                .notificacao-conteudo {
                    flex: 1;
                }
                
                .notificacao-titulo {
                    font-weight: 600;
                    margin-bottom: 3px;
                }
                
                .notificacao-mensagem {
                    font-size: 0.85rem;
                    color: #666;
                    margin-bottom: 3px;
                }
                
                .notificacao-data {
                    font-size: 0.7rem;
                    color: #999;
                }
                
                .notificacao-footer {
                    padding: 10px 15px;
                    border-top: 1px solid #eee;
                    text-align: center;
                }
                
                .btn-link {
                    background: none;
                    border: none;
                    color: #3498db;
                    cursor: pointer;
                    font-size: 0.9rem;
                }
                
                .btn-link:hover {
                    text-decoration: underline;
                }
                
                .central-notificacoes {
                    padding: 20px;
                }
                
                .central-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .central-filtros {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                
                .filtro-btn {
                    padding: 5px 15px;
                    border: 1px solid #ddd;
                    background: none;
                    border-radius: 20px;
                    cursor: pointer;
                }
                
                .filtro-btn.active {
                    background: #3498db;
                    color: white;
                    border-color: #3498db;
                }
                
                .toast-notificacao {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    min-width: 300px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                    padding: 15px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                }
                
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;

            document.head.appendChild(style);
        }

        function atualizarBadges() {
            const badge = document.getElementById('notificacoes-badge');
            if (badge) {
                const naoLidas = getNotificacoesNaoLidas().length;
                badge.textContent = naoLidas;
                badge.style.display = naoLidas > 0 ? 'block' : 'none';
            }
        }

        function togglePainelNotificacoes() {
            const painel = document.getElementById('notificacoes-painel');
            if (painel) {
                painel.classList.toggle('aberto');
                if (painel.classList.contains('aberto')) {
                    renderizarListaNotificacoes();
                }
            }
        }

        function renderizarListaNotificacoes() {
            const lista = document.getElementById('notificacoes-lista');
            if (!lista) return;

            const recentes = getNotificacoesRecentes(5);
            
            lista.innerHTML = recentes.map(n => `
                <div class="notificacao-item ${n.lida ? '' : 'nao-lida'}" onclick="MODULO_NOTIFICACOES.abrirNotificacao(${n.id})">
                    <div class="notificacao-icone icone-${n.tipo}">
                        <i class="fas ${n.icone}"></i>
                    </div>
                    <div class="notificacao-conteudo">
                        <div class="notificacao-titulo">${n.titulo}</div>
                        <div class="notificacao-mensagem">${n.mensagem.substring(0, 60)}${n.mensagem.length > 60 ? '...' : ''}</div>
                        <div class="notificacao-data">${formatarTempo(n.data)}</div>
                    </div>
                </div>
            `).join('');

            if (recentes.length === 0) {
                lista.innerHTML = `
                    <div class="no-data" style="padding: 30px; text-align: center;">
                        <i class="fas fa-bell-slash" style="font-size: 2rem; color: #ccc; margin-bottom: 10px;"></i>
                        <p>Nenhuma notificação</p>
                    </div>
                `;
            }
        }

        function mostrarToastNotificacao(notificacao) {
            const toast = document.createElement('div');
            toast.className = `toast-notificacao toast-${notificacao.tipo}`;
            toast.innerHTML = `
                <div style="display: flex; align-items: start; gap: 10px;">
                    <div class="notificacao-icone icone-${notificacao.tipo}">
                        <i class="fas ${notificacao.icone}"></i>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 3px;">${notificacao.titulo}</div>
                        <div style="font-size: 0.9rem; color: #666;">${notificacao.mensagem}</div>
                    </div>
                    <button class="btn-icon" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;

            document.body.appendChild(toast);

            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 5000);
        }

        function abrirCentralNotificacoes() {
            const centralHTML = `
                <div class="central-notificacoes">
                    <div class="central-header">
                        <h2>Central de Notificações</h2>
                        <button class="btn btn-secondary" onclick="MODULO_NOTIFICACOES.limparNotificacoes()">
                            Limpar todas
                        </button>
                    </div>
                    
                    <div class="central-filtros">
                        <button class="filtro-btn active" onclick="filtrarNotificacoes('todas')">Todas</button>
                        <button class="filtro-btn" onclick="filtrarNotificacoes('nao-lidas')">Não lidas</button>
                        <button class="filtro-btn" onclick="filtrarNotificacoes('avisos')">Avisos</button>
                        <button class="filtro-btn" onclick="filtrarNotificacoes('eventos')">Eventos</button>
                    </div>
                    
                    <div class="notificacoes-lista" style="max-height: 500px;">
                        ${notificacoes.map(n => `
                            <div class="notificacao-item ${n.lida ? '' : 'nao-lida'}" onclick="MODULO_NOTIFICACOES.abrirNotificacao(${n.id})">
                                <div class="notificacao-icone icone-${n.tipo}">
                                    <i class="fas ${n.icone}"></i>
                                </div>
                                <div class="notificacao-conteudo">
                                    <div class="notificacao-titulo">${n.titulo}</div>
                                    <div class="notificacao-mensagem">${n.mensagem}</div>
                                    <div class="notificacao-data">${new Date(n.data).toLocaleString('pt-BR')}</div>
                                </div>
                                <div class="notificacao-acoes">
                                    <button class="btn-icon" onclick="event.stopPropagation(); MODULO_NOTIFICACOES.removerNotificacao(${n.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            abrirModal('Central de Notificações', centralHTML);
        }

        function abrirNotificacao(id) {
            const notificacao = notificacoes.find(n => n.id === id);
            if (!notificacao) return;

            marcarComoLida(id);

            if (notificacao.link) {
                // Navegar para o link
                console.log('Navegar para:', notificacao.link);
            }

            if (notificacao.acao) {
                // Executar ação
                notificacao.acao();
            }

            fecharModal();
        }

        function filtrarNotificacoes(filtro) {
            // Implementar filtro
        }

        function formatarTempo(dataISO) {
            const data = new Date(dataISO);
            const agora = new Date();
            const diff = Math.floor((agora - data) / 1000); // segundos

            if (diff < 60) return 'agora mesmo';
            if (diff < 3600) return `${Math.floor(diff / 60)} minutos atrás`;
            if (diff < 86400) return `${Math.floor(diff / 3600)} horas atrás`;
            if (diff < 2592000) return `${Math.floor(diff / 86400)} dias atrás`;
            
            return data.toLocaleDateString('pt-BR');
        }

        // ==================== PERSISTÊNCIA ====================
        function salvarNotificacoes() {
            try {
                localStorage.setItem('sme_notificacoes', JSON.stringify(notificacoes));
            } catch (e) {
                console.error('Erro ao salvar notificações:', e);
            }
        }

        function carregarNotificacoes() {
            try {
                const saved = localStorage.getItem('sme_notificacoes');
                if (saved) {
                    notificacoes = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar notificações:', e);
            }
        }

        // ==================== SISTEMA DE INSCRIÇÃO ====================
        function inscrever(callback, eventos = ['todas']) {
            inscritos.push({
                id: Date.now(),
                callback: callback,
                eventos: eventos
            });
        }

        function notificarInscritos(evento, dados) {
            inscritos.forEach(i => {
                if (i.eventos.includes('todas') || i.eventos.includes(evento)) {
                    try {
                        i.callback(evento, dados);
                    } catch (e) {
                        console.error('Erro ao notificar inscrito:', e);
                    }
                }
            });
        }

        // ==================== LIMPEZA ====================
        function limparIntervalos() {
            intervalos.forEach(i => clearInterval(i));
            intervalos = [];
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            adicionarNotificacao,
            adicionarNotificacaoSucesso,
            adicionarNotificacaoErro,
            adicionarNotificacaoAviso,
            adicionarNotificacaoInfo,
            adicionarNotificacaoEvento,
            adicionarNotificacaoLembrete,
            marcarComoLida,
            marcarTodasComoLidas,
            removerNotificacao,
            limparNotificacoes,
            getNotificacoesNaoLidas,
            getNotificacoesRecentes,
            abrirCentralNotificacoes,
            abrirNotificacao,
            inscrever,
            TIPOS
        };
    })();

    // Inicializar quando o sistema estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        // Aguardar um pouco para outros módulos carregarem
        setTimeout(() => {
            if (typeof SISTEMA !== 'undefined' && SISTEMA.getEstado().autenticado) {
                MODULO_NOTIFICACOES.init();
            }
        }, 2000);
    });

    window.MODULO_NOTIFICACOES = MODULO_NOTIFICACOES;
    console.log('✅ Módulo de Notificações carregado');
}
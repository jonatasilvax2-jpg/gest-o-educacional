// modulos/dashboard-custom.js - Dashboard Customizável com Widgets
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_DASHBOARD_CUSTOM === 'undefined') {
    const MODULO_DASHBOARD_CUSTOM = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            localStorageKey: 'sme_dashboard_layout',
            maxWidgets: 12,
            colunas: 12,
            widgetsDisponiveis: [
                {
                    id: 'estatisticas',
                    titulo: 'Estatísticas Rápidas',
                    icone: 'fa-chart-pie',
                    tamanhoPadrao: { w: 6, h: 2 },
                    permissoes: ['secretaria', 'diretor']
                },
                {
                    id: 'grafico-desempenho',
                    titulo: 'Gráfico de Desempenho',
                    icone: 'fa-chart-line',
                    tamanhoPadrao: { w: 6, h: 3 },
                    permissoes: ['secretaria', 'diretor', 'professor']
                },
                {
                    id: 'ultimas-notificacoes',
                    titulo: 'Últimas Notificações',
                    icone: 'fa-bell',
                    tamanhoPadrao: { w: 4, h: 2 },
                    permissoes: ['secretaria', 'diretor', 'professor', 'aluno']
                },
                {
                    id: 'atividades-recentes',
                    titulo: 'Atividades Recentes',
                    icone: 'fa-history',
                    tamanhoPadrao: { w: 4, h: 2 },
                    permissoes: ['secretaria', 'diretor', 'professor', 'aluno']
                },
                {
                    id: 'proximos-eventos',
                    titulo: 'Próximos Eventos',
                    icone: 'fa-calendar',
                    tamanhoPadrao: { w: 4, h: 2 },
                    permissoes: ['secretaria', 'diretor', 'professor', 'aluno']
                },
                {
                    id: 'frequencia-hoje',
                    titulo: 'Frequência Hoje',
                    icone: 'fa-clipboard-check',
                    tamanhoPadrao: { w: 4, h: 2 },
                    permissoes: ['secretaria', 'diretor', 'professor']
                },
                {
                    id: 'biblioteca-resumo',
                    titulo: 'Resumo da Biblioteca',
                    icone: 'fa-book',
                    tamanhoPadrao: { w: 4, h: 2 },
                    permissoes: ['secretaria', 'diretor', 'professor', 'aluno']
                },
                {
                    id: 'merenda-hoje',
                    titulo: 'Cardápio do Dia',
                    icone: 'fa-utensils',
                    tamanhoPadrao: { w: 4, h: 2 },
                    permissoes: ['secretaria', 'diretor', 'professor', 'aluno']
                },
                {
                    id: 'alunos-destaque',
                    titulo: 'Alunos em Destaque',
                    icone: 'fa-star',
                    tamanhoPadrao: { w: 6, h: 3 },
                    permissoes: ['secretaria', 'diretor', 'professor']
                },
                {
                    id: 'aniversariantes',
                    titulo: 'Aniversariantes do Mês',
                    icone: 'fa-birthday-cake',
                    tamanhoPadrao: { w: 4, h: 2 },
                    permissoes: ['secretaria', 'diretor', 'professor', 'aluno']
                },
                {
                    id: 'tarefas-pendentes',
                    titulo: 'Tarefas Pendentes',
                    icone: 'fa-tasks',
                    tamanhoPadrao: { w: 4, h: 2 },
                    permissoes: ['professor', 'aluno']
                },
                {
                    id: 'calendario',
                    titulo: 'Calendário',
                    icone: 'fa-calendar-alt',
                    tamanhoPadrao: { w: 6, h: 3 },
                    permissoes: ['secretaria', 'diretor', 'professor', 'aluno']
                }
            ]
        };

        // ==================== ESTADO ====================
        let layout = [];
        let widgetsAtivos = [];
        let modoEdicao = false;
        let observers = [];

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('📊 Dashboard Customizável inicializado');
            
            // Carregar layout salvo
            carregarLayout();
            
            // Se não houver layout, criar padrão
            if (layout.length === 0) {
                criarLayoutPadrao();
            }
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    'Dashboard customizável inicializado',
                    MODULO_AUDITORIA.categorias.SISTEMA,
                    MODULO_AUDITORIA.niveis.INFO
                );
            }
        }

        // ==================== GERENCIAMENTO DE LAYOUT ====================
        function criarLayoutPadrao() {
            const perfil = SISTEMA.getEstado().usuario.perfil;
            
            // Layout padrão por perfil
            const layoutsPadrao = {
                secretaria: [
                    { id: 'estatisticas', x: 0, y: 0, w: 6, h: 2 },
                    { id: 'grafico-desempenho', x: 6, y: 0, w: 6, h: 3 },
                    { id: 'ultimas-notificacoes', x: 0, y: 2, w: 4, h: 2 },
                    { id: 'proximos-eventos', x: 4, y: 2, w: 4, h: 2 },
                    { id: 'biblioteca-resumo', x: 8, y: 2, w: 4, h: 2 },
                    { id: 'alunos-destaque', x: 0, y: 4, w: 6, h: 3 },
                    { id: 'calendario', x: 6, y: 4, w: 6, h: 3 }
                ],
                diretor: [
                    { id: 'estatisticas', x: 0, y: 0, w: 6, h: 2 },
                    { id: 'frequencia-hoje', x: 6, y: 0, w: 6, h: 2 },
                    { id: 'proximos-eventos', x: 0, y: 2, w: 4, h: 2 },
                    { id: 'atividades-recentes', x: 4, y: 2, w: 4, h: 2 },
                    { id: 'aniversariantes', x: 8, y: 2, w: 4, h: 2 },
                    { id: 'grafico-desempenho', x: 0, y: 4, w: 8, h: 3 },
                    { id: 'alunos-destaque', x: 8, y: 4, w: 4, h: 3 }
                ],
                professor: [
                    { id: 'estatisticas', x: 0, y: 0, w: 4, h: 2 },
                    { id: 'frequencia-hoje', x: 4, y: 0, w: 4, h: 2 },
                    { id: 'tarefas-pendentes', x: 8, y: 0, w: 4, h: 2 },
                    { id: 'grafico-desempenho', x: 0, y: 2, w: 6, h: 3 },
                    { id: 'proximos-eventos', x: 6, y: 2, w: 6, h: 2 },
                    { id: 'alunos-destaque', x: 0, y: 5, w: 6, h: 3 },
                    { id: 'calendario', x: 6, y: 4, w: 6, h: 4 }
                ],
                aluno: [
                    { id: 'ultimas-notificacoes', x: 0, y: 0, w: 4, h: 2 },
                    { id: 'tarefas-pendentes', x: 4, y: 0, w: 4, h: 2 },
                    { id: 'aniversariantes', x: 8, y: 0, w: 4, h: 2 },
                    { id: 'proximos-eventos', x: 0, y: 2, w: 4, h: 2 },
                    { id: 'biblioteca-resumo', x: 4, y: 2, w: 4, h: 2 },
                    { id: 'merenda-hoje', x: 8, y: 2, w: 4, h: 2 },
                    { id: 'calendario', x: 0, y: 4, w: 12, h: 3 }
                ]
            };

            layout = layoutsPadrao[perfil] || layoutsPadrao.aluno;
            salvarLayout();
        }

        function adicionarWidget(widgetId) {
            if (layout.length >= CONFIG.maxWidgets) {
                if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                    MODULO_NOTIFICACOES.adicionarNotificacaoAviso(
                        'Limite de Widgets',
                        `Máximo de ${CONFIG.maxWidgets} widgets atingido`
                    );
                }
                return false;
            }

            const widget = CONFIG.widgetsDisponiveis.find(w => w.id === widgetId);
            if (!widget) return false;

            // Encontrar posição disponível
            const posicao = encontrarPosicaoDisponivel(widget.tamanhoPadrao);
            
            if (!posicao) {
                if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                    MODULO_NOTIFICACOES.adicionarNotificacaoAviso(
                        'Sem Espaço',
                        'Não há espaço disponível para este widget'
                    );
                }
                return false;
            }

            const novoWidget = {
                id: widgetId,
                x: posicao.x,
                y: posicao.y,
                w: widget.tamanhoPadrao.w,
                h: widget.tamanhoPadrao.h
            };

            layout.push(novoWidget);
            salvarLayout();
            notificarObservers('adicionar', novoWidget);
            
            return true;
        }

        function removerWidget(index) {
            const widget = layout[index];
            layout.splice(index, 1);
            salvarLayout();
            notificarObservers('remover', widget);
        }

        function moverWidget(index, x, y) {
            if (index < 0 || index >= layout.length) return false;
            
            layout[index].x = x;
            layout[index].y = y;
            
            salvarLayout();
            notificarObservers('mover', layout[index]);
            
            return true;
        }

        function redimensionarWidget(index, w, h) {
            if (index < 0 || index >= layout.length) return false;
            
            layout[index].w = w;
            layout[index].h = h;
            
            salvarLayout();
            notificarObservers('redimensionar', layout[index]);
            
            return true;
        }

        function encontrarPosicaoDisponivel(tamanho) {
            // Grid de ocupação
            const grid = Array(CONFIG.maxWidgets).fill().map(() => Array(CONFIG.colunas).fill(false));
            
            // Marcar widgets existentes
            layout.forEach(w => {
                for (let i = w.y; i < w.y + w.h; i++) {
                    for (let j = w.x; j < w.x + w.w; j++) {
                        if (i < CONFIG.maxWidgets && j < CONFIG.colunas) {
                            grid[i][j] = true;
                        }
                    }
                }
            });

            // Procurar posição disponível
            for (let y = 0; y < CONFIG.maxWidgets; y++) {
                for (let x = 0; x < CONFIG.colunas; x++) {
                    let disponivel = true;
                    
                    // Verificar se o espaço necessário está livre
                    for (let i = y; i < y + tamanho.h; i++) {
                        for (let j = x; j < x + tamanho.w; j++) {
                            if (i >= CONFIG.maxWidgets || j >= CONFIG.colunas || grid[i][j]) {
                                disponivel = false;
                                break;
                            }
                        }
                        if (!disponivel) break;
                    }
                    
                    if (disponivel) {
                        return { x, y };
                    }
                }
            }
            
            return null;
        }

        // ==================== RENDERIZAÇÃO DO DASHBOARD ====================
        function renderizarDashboardCustom() {
            const container = document.createElement('div');
            container.className = 'dashboard-custom-container';
            
            if (modoEdicao) {
                container.classList.add('modo-edicao');
            }

            // Ordenar widgets por posição Y
            const widgetsOrdenados = [...layout].sort((a, b) => a.y - b.y);

            widgetsOrdenados.forEach((widget, index) => {
                const widgetConfig = CONFIG.widgetsDisponiveis.find(w => w.id === widget.id);
                if (!widgetConfig) return;

                const widgetElement = criarWidgetElement(widgetConfig, widget, index);
                container.appendChild(widgetElement);
            });

            // Botões de controle
            if (modoEdicao) {
                const controles = criarControlesEdicao();
                container.appendChild(controles);
            }

            return container;
        }

        function criarWidgetElement(config, posicao, index) {
            const widget = document.createElement('div');
            widget.className = `dashboard-widget widget-${config.id}`;
            widget.style.gridColumn = `span ${posicao.w}`;
            widget.style.gridRow = `span ${posicao.h}`;
            widget.dataset.index = index;

            // Cabeçalho do widget
            const header = document.createElement('div');
            header.className = 'widget-header';
            header.innerHTML = `
                <div class="widget-titulo">
                    <i class="fas ${config.icone}"></i>
                    <span>${config.titulo}</span>
                </div>
                ${modoEdicao ? `
                    <div class="widget-controles">
                        <button class="btn-icon" onclick="MODULO_DASHBOARD_CUSTOM.removerWidget(${index})" title="Remover widget">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                ` : ''}
            `;

            // Corpo do widget
            const body = document.createElement('div');
            body.className = 'widget-body';
            body.appendChild(renderizarConteudoWidget(config.id));

            widget.appendChild(header);
            widget.appendChild(body);

            // Tornar arrastável em modo edição
            if (modoEdicao) {
                widget.draggable = true;
                widget.addEventListener('dragstart', handleDragStart);
                widget.addEventListener('dragend', handleDragEnd);
                widget.addEventListener('dragover', handleDragOver);
                widget.addEventListener('drop', handleDrop);
            }

            return widget;
        }

        function renderizarConteudoWidget(widgetId) {
            const container = document.createElement('div');
            container.className = 'widget-conteudo';

            switch (widgetId) {
                case 'estatisticas':
                    container.innerHTML = renderizarEstatisticas();
                    break;
                case 'grafico-desempenho':
                    container.innerHTML = '<canvas class="widget-grafico" id="widget-grafico"></canvas>';
                    setTimeout(() => {
                        if (typeof MODULO_GRAFICOS !== 'undefined') {
                            MODULO_GRAFICOS.criarGraficoDesempenhoGeral('widget-grafico', {});
                        }
                    }, 100);
                    break;
                case 'ultimas-notificacoes':
                    container.innerHTML = renderizarUltimasNotificacoes();
                    break;
                case 'atividades-recentes':
                    container.innerHTML = renderizarAtividadesRecentes();
                    break;
                case 'proximos-eventos':
                    container.innerHTML = renderizarProximosEventos();
                    break;
                case 'frequencia-hoje':
                    container.innerHTML = renderizarFrequenciaHoje();
                    break;
                case 'biblioteca-resumo':
                    container.innerHTML = renderizarBibliotecaResumo();
                    break;
                case 'merenda-hoje':
                    container.innerHTML = renderizarMerendaHoje();
                    break;
                case 'alunos-destaque':
                    container.innerHTML = renderizarAlunosDestaque();
                    break;
                case 'aniversariantes':
                    container.innerHTML = renderizarAniversariantes();
                    break;
                case 'tarefas-pendentes':
                    container.innerHTML = renderizarTarefasPendentes();
                    break;
                case 'calendario':
                    container.innerHTML = renderizarCalendario();
                    break;
                default:
                    container.innerHTML = '<p>Widget em desenvolvimento</p>';
            }

            return container;
        }

        // ==================== CONTEÚDO DOS WIDGETS ====================
        function renderizarEstatisticas() {
            const totalAlunos = MOCK_DATA.alunos?.length || 0;
            const totalProfessores = MOCK_DATA.professores?.length || 0;
            const totalEscolas = MOCK_DATA.escolas?.length || 0;

            return `
                <div class="estatisticas-mini">
                    <div class="estatistica-mini-item">
                        <div class="estatistica-mini-valor">${totalAlunos}</div>
                        <div class="estatistica-mini-rotulo">Alunos</div>
                    </div>
                    <div class="estatistica-mini-item">
                        <div class="estatistica-mini-valor">${totalProfessores}</div>
                        <div class="estatistica-mini-rotulo">Professores</div>
                    </div>
                    <div class="estatistica-mini-item">
                        <div class="estatistica-mini-valor">${totalEscolas}</div>
                        <div class="estatistica-mini-rotulo">Escolas</div>
                    </div>
                </div>
            `;
        }

        function renderizarUltimasNotificacoes() {
            if (typeof MODULO_NOTIFICACOES === 'undefined') {
                return '<p>Módulo de notificações não disponível</p>';
            }

            const notificacoes = MODULO_NOTIFICACOES.getNotificacoesRecentes(3);
            
            if (notificacoes.length === 0) {
                return '<p class="sem-dados">Nenhuma notificação</p>';
            }

            return `
                <div class="notificacoes-mini">
                    ${notificacoes.map(n => `
                        <div class="notificacao-mini-item ${n.lida ? '' : 'nao-lida'}">
                            <i class="fas ${n.icone}"></i>
                            <div class="notificacao-mini-conteudo">
                                <div class="notificacao-mini-titulo">${n.titulo}</div>
                                <div class="notificacao-mini-mensagem">${n.mensagem.substring(0, 30)}...</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function renderizarAtividadesRecentes() {
            return `
                <div class="atividades-mini">
                    <div class="atividade-mini-item">
                        <i class="fas fa-user-plus"></i>
                        <div class="atividade-mini-info">
                            <div>Novo aluno cadastrado</div>
                            <small>Há 10 minutos</small>
                        </div>
                    </div>
                    <div class="atividade-mini-item">
                        <i class="fas fa-edit"></i>
                        <div class="atividade-mini-info">
                            <div>Notas lançadas - 5ºA</div>
                            <small>Há 30 minutos</small>
                        </div>
                    </div>
                    <div class="atividade-mini-item">
                        <i class="fas fa-book"></i>
                        <div class="atividade-mini-info">
                            <div>Livro devolvido</div>
                            <small>Há 1 hora</small>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderizarProximosEventos() {
            const eventos = MOCK_DATA.eventos?.slice(0, 3) || [];

            return `
                <div class="eventos-mini">
                    ${eventos.map(e => `
                        <div class="evento-mini-item">
                            <div class="evento-mini-data">
                                <span class="dia">${new Date(e.data).getDate()}</span>
                                <span class="mes">${new Date(e.data).toLocaleString('pt-BR', { month: 'short' })}</span>
                            </div>
                            <div class="evento-mini-info">
                                <div class="evento-mini-titulo">${e.titulo}</div>
                                <div class="evento-mini-hora">${e.hora}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function renderizarFrequenciaHoje() {
            const percentual = 92;
            
            return `
                <div class="frequencia-hoje">
                    <div class="frequencia-circular">
                        <svg viewBox="0 0 36 36" class="circular-chart">
                            <path class="circle-bg"
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#eee"
                                stroke-width="3"/>
                            <path class="circle"
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#4CAF50"
                                stroke-width="3"
                                stroke-dasharray="${percentual}, 100"/>
                        </svg>
                        <div class="frequencia-percentual">${percentual}%</div>
                    </div>
                    <div class="frequencia-info">
                        <div>Presentes: 234</div>
                        <div>Faltas: 18</div>
                    </div>
                </div>
            `;
        }

        function renderizarBibliotecaResumo() {
            const livros = MOCK_DATA.biblioteca?.livros || [];
            const emprestimos = MOCK_DATA.biblioteca?.emprestimos?.filter(e => e.status === 'emprestado') || [];

            return `
                <div class="biblioteca-resumo">
                    <div class="biblioteca-stat">
                        <i class="fas fa-book"></i>
                        <div>
                            <span class="stat-valor">${livros.length}</span>
                            <span class="stat-rotulo">Livros</span>
                        </div>
                    </div>
                    <div class="biblioteca-stat">
                        <i class="fas fa-hand-holding"></i>
                        <div>
                            <span class="stat-valor">${emprestimos.length}</span>
                            <span class="stat-rotulo">Empréstimos</span>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderizarMerendaHoje() {
            const cardapio = MOCK_DATA.merenda?.cardapios?.find(c => c.data === new Date().toISOString().split('T')[0]);

            return `
                <div class="merenda-hoje">
                    <div class="merenda-item">
                        <i class="fas fa-coffee"></i>
                        <span>Café: ${cardapio?.cafe || 'Pão com manteiga, leite'}</span>
                    </div>
                    <div class="merenda-item">
                        <i class="fas fa-utensils"></i>
                        <span>Almoço: ${cardapio?.almoco || 'Arroz, feijão, frango'}</span>
                    </div>
                    <div class="merenda-item">
                        <i class="fas fa-apple-alt"></i>
                        <span>Lanche: ${cardapio?.lanche || 'Fruta'}</span>
                    </div>
                </div>
            `;
        }

        function renderizarAlunosDestaque() {
            const alunos = MOCK_DATA.alunos?.filter(a => a.mediaGeral >= 9).slice(0, 3) || [];

            return `
                <div class="alunos-destaque-lista">
                    ${alunos.map(a => `
                        <div class="aluno-destaque-item">
                            <div class="aluno-destaque-avatar">
                                <i class="fas fa-user-graduate"></i>
                            </div>
                            <div class="aluno-destaque-info">
                                <div class="aluno-destaque-nome">${a.nome}</div>
                                <div class="aluno-destaque-media">Média: ${a.mediaGeral}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function renderizarAniversariantes() {
            return `
                <div class="aniversariantes-lista">
                    <div class="aniversariante-item">
                        <i class="fas fa-birthday-cake"></i>
                        <span>João Silva - 15/03</span>
                    </div>
                    <div class="aniversariante-item">
                        <i class="fas fa-birthday-cake"></i>
                        <span>Maria Santos - 18/03</span>
                    </div>
                    <div class="aniversariante-item">
                        <i class="fas fa-birthday-cake"></i>
                        <span>Pedro Oliveira - 22/03</span>
                    </div>
                </div>
            `;
        }

        function renderizarTarefasPendentes() {
            return `
                <div class="tarefas-lista">
                    <div class="tarefa-item">
                        <input type="checkbox">
                        <span>Corrigir atividades - 5ºA</span>
                    </div>
                    <div class="tarefa-item">
                        <input type="checkbox">
                        <span>Preparar aula de Matemática</span>
                    </div>
                    <div class="tarefa-item">
                        <input type="checkbox">
                        <span>Reunião de pais</span>
                    </div>
                </div>
            `;
        }

        function renderizarCalendario() {
            const hoje = new Date();
            const diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
            
            let dias = [];
            for (let i = 1; i <= diasNoMes; i++) {
                dias.push(i);
            }

            return `
                <div class="calendario-mini">
                    <div class="calendario-cabecalho">
                        <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
                    </div>
                    <div class="calendario-dias">
                        ${Array(hoje.getDay()).fill('<span></span>').join('')}
                        ${dias.map(d => `
                            <span class="${d === hoje.getDate() ? 'hoje' : ''}">${d}</span>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // ==================== CONTROLES DE EDIÇÃO ====================
        function criarControlesEdicao() {
            const container = document.createElement('div');
            container.className = 'dashboard-controles';

            const btnAdicionar = document.createElement('button');
            btnAdicionar.className = 'btn btn-primary';
            btnAdicionar.innerHTML = '<i class="fas fa-plus"></i> Adicionar Widget';
            btnAdicionar.onclick = mostrarSeletorWidgets;

            const btnSalvar = document.createElement('button');
            btnSalvar.className = 'btn btn-success';
            btnSalvar.innerHTML = '<i class="fas fa-check"></i> Salvar Layout';
            btnSalvar.onclick = salvarModoEdicao;

            const btnCancelar = document.createElement('button');
            btnCancelar.className = 'btn btn-secondary';
            btnCancelar.innerHTML = '<i class="fas fa-times"></i> Cancelar';
            btnCancelar.onclick = cancelarModoEdicao;

            container.appendChild(btnAdicionar);
            container.appendChild(btnSalvar);
            container.appendChild(btnCancelar);

            return container;
        }

        function mostrarSeletorWidgets() {
            const perfil = SISTEMA.getEstado().usuario.perfil;
            
            const widgetsDisponiveis = CONFIG.widgetsDisponiveis
                .filter(w => w.permissoes.includes(perfil) && !layout.some(l => l.id === w.id));

            const modalHTML = `
                <div class="seletor-widgets">
                    <h3>Adicionar Widget</h3>
                    <div class="widgets-grid">
                        ${widgetsDisponiveis.map(w => `
                            <div class="widget-opcao" onclick="MODULO_DASHBOARD_CUSTOM.adicionarWidget('${w.id}')">
                                <i class="fas ${w.icone}"></i>
                                <span>${w.titulo}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Adicionar Widget', modalHTML);
            }
        }

        // ==================== DRAG AND DROP ====================
        let dragInfo = null;

        function handleDragStart(e) {
            const widget = e.target.closest('.dashboard-widget');
            if (!widget) return;

            dragInfo = {
                index: parseInt(widget.dataset.index),
                startX: e.clientX,
                startY: e.clientY,
                widget: widget.cloneNode(true)
            };

            widget.classList.add('arrastando');
            e.dataTransfer.setData('text/plain', widget.dataset.index);
        }

        function handleDragEnd(e) {
            const widget = e.target.closest('.dashboard-widget');
            if (widget) {
                widget.classList.remove('arrastando');
            }
            dragInfo = null;
        }

        function handleDragOver(e) {
            e.preventDefault();
        }

        function handleDrop(e) {
            e.preventDefault();
            
            const targetWidget = e.target.closest('.dashboard-widget');
            if (!targetWidget) return;

            const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const targetIndex = parseInt(targetWidget.dataset.index);

            if (sourceIndex === targetIndex) return;

            // Trocar posições
            const temp = { ...layout[sourceIndex] };
            layout[sourceIndex] = { ...layout[targetIndex] };
            layout[targetIndex] = temp;

            salvarLayout();
            atualizarDashboard();
        }

        // ==================== MODO DE EDIÇÃO ====================
        function entrarModoEdicao() {
            modoEdicao = true;
            atualizarDashboard();
            
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    'Modo de edição do dashboard ativado',
                    MODULO_AUDITORIA.categorias.EDICAO,
                    MODULO_AUDITORIA.niveis.INFO
                );
            }
        }

        function salvarModoEdicao() {
            modoEdicao = false;
            salvarLayout();
            atualizarDashboard();
            
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                    'Layout Salvo',
                    'Seu dashboard foi atualizado'
                );
            }
        }

        function cancelarModoEdicao() {
            carregarLayout();
            modoEdicao = false;
            atualizarDashboard();
        }

        function atualizarDashboard() {
            const contentArea = document.getElementById('content-area');
            if (!contentArea) return;

            const novoDashboard = renderizarDashboardCustom();
            contentArea.innerHTML = '';
            contentArea.appendChild(novoDashboard);

            // Adicionar botão de edição
            if (!modoEdicao) {
                const btnEditar = document.createElement('button');
                btnEditar.className = 'btn-editar-dashboard';
                btnEditar.innerHTML = '<i class="fas fa-edit"></i> Editar Dashboard';
                btnEditar.onclick = entrarModoEdicao;
                contentArea.appendChild(btnEditar);
            }
        }

        // ==================== PERSISTÊNCIA ====================
        function salvarLayout() {
            try {
                localStorage.setItem(CONFIG.localStorageKey, JSON.stringify(layout));
            } catch (e) {
                console.error('Erro ao salvar layout:', e);
            }
        }

        function carregarLayout() {
            try {
                const saved = localStorage.getItem(CONFIG.localStorageKey);
                if (saved) {
                    layout = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar layout:', e);
            }
        }

        // ==================== OBSERVERS ====================
        function observar(callback) {
            observers.push(callback);
            return () => {
                observers = observers.filter(cb => cb !== callback);
            };
        }

        function notificarObservers(evento, dados) {
            observers.forEach(cb => {
                try {
                    cb(evento, dados);
                } catch (e) {
                    console.error('Erro ao notificar observer:', e);
                }
            });
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            renderizarDashboardCustom,
            adicionarWidget,
            removerWidget,
            entrarModoEdicao,
            salvarModoEdicao,
            cancelarModoEdicao,
            observar,
            getLayout: () => [...layout]
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_DASHBOARD_CUSTOM.init();
        }, 6000);
    });

    window.MODULO_DASHBOARD_CUSTOM = MODULO_DASHBOARD_CUSTOM;
    console.log('✅ Módulo de Dashboard Customizável carregado');
}
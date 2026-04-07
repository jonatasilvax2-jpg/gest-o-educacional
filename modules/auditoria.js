// modulos/auditoria.js - Sistema de Auditoria e Logs
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_AUDITORIA === 'undefined') {
    const MODULO_AUDITORIA = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            maxLogs: 10000,
            niveis: {
                INFO: 'info',
                AVISO: 'aviso',
                ERRO: 'erro',
                CRITICO: 'critico',
                SEGURANCA: 'seguranca'
            },
            categorias: {
                LOGIN: 'login',
                LOGOUT: 'logout',
                CADASTRO: 'cadastro',
                EDICAO: 'edicao',
                EXCLUSAO: 'exclusao',
                VISUALIZACAO: 'visualizacao',
                EXPORTACAO: 'exportacao',
                BACKUP: 'backup',
                PERMISSAO: 'permissao',
                SEGURANCA: 'seguranca'
            }
        };

        // ==================== ESTADO ====================
        let logs = [];
        let listeners = [];

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('📋 Sistema de Auditoria inicializado');
            carregarLogs();
            
            // Interceptar console.log para logging automático
            interceptarConsole();
            
            // Registrar eventos do sistema
            registrarEventosSistema();
        }

        // ==================== REGISTRO DE LOGS ====================
        function registrarLog(mensagem, categoria, nivel = CONFIG.niveis.INFO, dados = {}) {
            try {
                const usuario = SISTEMA.getEstado().usuario;
                
                const log = {
                    id: gerarId(),
                    timestamp: new Date().toISOString(),
                    usuario: usuario ? {
                        id: usuario.id,
                        nome: usuario.nome,
                        perfil: usuario.perfil
                    } : null,
                    nivel: nivel,
                    categoria: categoria,
                    mensagem: mensagem,
                    dados: dados,
                    ip: obterIpCliente(),
                    userAgent: navigator.userAgent,
                    url: window.location.href
                };

                logs.unshift(log);

                // Limitar número de logs
                if (logs.length > CONFIG.maxLogs) {
                    logs = logs.slice(0, CONFIG.maxLogs);
                }

                salvarLogs();
                notificarListeners(log);

                // Logs críticos enviam notificação
                if (nivel === CONFIG.niveis.CRITICO || nivel === CONFIG.niveis.SEGURANCA) {
                    notificarLogCritico(log);
                }

                console.log(`[AUDITORIA] ${mensagem}`, dados);

                return log.id;

            } catch (erro) {
                console.error('Erro ao registrar log:', erro);
            }
        }

        function registrarAcaoUsuario(acao, categoria, detalhes = {}) {
            const usuario = SISTEMA.getEstado().usuario;
            if (!usuario) return;

            return registrarLog(
                `Usuário ${usuario.nome} ${acao}`,
                categoria,
                CONFIG.niveis.INFO,
                {
                    usuarioId: usuario.id,
                    ...detalhes
                }
            );
        }

        function registrarEventoSeguranca(mensagem, dados = {}) {
            return registrarLog(
                mensagem,
                CONFIG.categorias.SEGURANCA,
                CONFIG.niveis.SEGURANCA,
                dados
            );
        }

        function registrarErro(mensagem, erro, dados = {}) {
            return registrarLog(
                mensagem,
                CONFIG.categorias.ERRO,
                CONFIG.niveis.ERRO,
                {
                    erro: erro.message,
                    stack: erro.stack,
                    ...dados
                }
            );
        }

        // ==================== CONSULTA DE LOGS ====================
        function buscarLogs(filtros = {}) {
            let resultado = [...logs];

            // Filtrar por data
            if (filtros.dataInicio) {
                resultado = resultado.filter(l => l.timestamp >= filtros.dataInicio);
            }
            if (filtros.dataFim) {
                resultado = resultado.filter(l => l.timestamp <= filtros.dataFim);
            }

            // Filtrar por usuário
            if (filtros.usuarioId) {
                resultado = resultado.filter(l => l.usuario?.id === filtros.usuarioId);
            }

            // Filtrar por nível
            if (filtros.nivel) {
                resultado = resultado.filter(l => l.nivel === filtros.nivel);
            }

            // Filtrar por categoria
            if (filtros.categoria) {
                resultado = resultado.filter(l => l.categoria === filtros.categoria);
            }

            // Busca por texto
            if (filtros.busca) {
                const termo = filtros.busca.toLowerCase();
                resultado = resultado.filter(l => 
                    l.mensagem.toLowerCase().includes(termo) ||
                    l.usuario?.nome?.toLowerCase().includes(termo)
                );
            }

            // Ordenar
            resultado.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Paginar
            if (filtros.limite) {
                resultado = resultado.slice(0, filtros.limite);
            }

            return resultado;
        }

        function getEstatisticas() {
            const agora = new Date();
            const hoje = agora.toISOString().split('T')[0];
            
            return {
                total: logs.length,
                hoje: logs.filter(l => l.timestamp.startsWith(hoje)).length,
                porNivel: {
                    info: logs.filter(l => l.nivel === CONFIG.niveis.INFO).length,
                    aviso: logs.filter(l => l.nivel === CONFIG.niveis.AVISO).length,
                    erro: logs.filter(l => l.nivel === CONFIG.niveis.ERRO).length,
                    critico: logs.filter(l => l.nivel === CONFIG.niveis.CRITICO).length,
                    seguranca: logs.filter(l => l.nivel === CONFIG.niveis.SEGURANCA).length
                },
                porCategoria: Object.values(CONFIG.categorias).reduce((acc, cat) => {
                    acc[cat] = logs.filter(l => l.categoria === cat).length;
                    return acc;
                }, {}),
                usuariosAtivos: new Set(logs.map(l => l.usuario?.id).filter(Boolean)).size
            };
        }

        // ==================== INTERFACE DO USUÁRIO ====================
        function abrirPainelAuditoria() {
            const estatisticas = getEstatisticas();
            const logsRecentes = buscarLogs({ limite: 50 });

            const modalHTML = `
                <div class="auditoria-painel">
                    <div class="auditoria-header">
                        <h3><i class="fas fa-clipboard-list"></i> Auditoria do Sistema</h3>
                        <div class="auditoria-acoes">
                            <button class="btn btn-secondary" onclick="MODULO_AUDITORIA.exportarLogs()">
                                <i class="fas fa-download"></i> Exportar
                            </button>
                            <button class="btn btn-danger" onclick="MODULO_AUDITORIA.limparLogs()">
                                <i class="fas fa-trash"></i> Limpar
                            </button>
                        </div>
                    </div>
                    
                    <div class="auditoria-stats">
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>Total de Logs</h3>
                                <p class="stat-number">${estatisticas.total}</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>Hoje</h3>
                                <p class="stat-number">${estatisticas.hoje}</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>Erros</h3>
                                <p class="stat-number text-danger">${estatisticas.porNivel.erro}</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>Segurança</h3>
                                <p class="stat-number text-warning">${estatisticas.porNivel.seguranca}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="auditoria-filtros">
                        <input type="text" class="form-control" id="filtro-busca" placeholder="Buscar logs...">
                        <select class="form-control" id="filtro-nivel">
                            <option value="">Todos os níveis</option>
                            <option value="info">Info</option>
                            <option value="aviso">Aviso</option>
                            <option value="erro">Erro</option>
                            <option value="critico">Crítico</option>
                            <option value="seguranca">Segurança</option>
                        </select>
                        <select class="form-control" id="filtro-categoria">
                            <option value="">Todas categorias</option>
                            ${Object.entries(CONFIG.categorias).map(([key, value]) => `
                                <option value="${value}">${value}</option>
                            `).join('')}
                        </select>
                        <button class="btn btn-primary" onclick="MODULO_AUDITORIA.aplicarFiltros()">
                            <i class="fas fa-filter"></i> Filtrar
                        </button>
                    </div>
                    
                    <div class="auditoria-logs">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Data/Hora</th>
                                    <th>Usuário</th>
                                    <th>Nível</th>
                                    <th>Categoria</th>
                                    <th>Mensagem</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${logsRecentes.map(log => `
                                    <tr class="log-nivel-${log.nivel}">
                                        <td>${new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                                        <td>${log.usuario?.nome || 'Sistema'}</td>
                                        <td>
                                            <span class="badge badge-${log.nivel}">${log.nivel}</span>
                                        </td>
                                        <td>${log.categoria}</td>
                                        <td>${log.mensagem}</td>
                                        <td>
                                            <button class="btn-icon" onclick="MODULO_AUDITORIA.verDetalhesLog('${log.id}')">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            // Adicionar estilos
            adicionarEstilosAuditoria();

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Painel de Auditoria', modalHTML);
            }
        }

        function adicionarEstilosAuditoria() {
            if (document.getElementById('style-auditoria')) return;

            const style = document.createElement('style');
            style.id = 'style-auditoria';
            style.textContent = `
                .auditoria-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin-bottom: 20px;
                }
                
                .auditoria-filtros {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                
                .auditoria-filtros .form-control {
                    flex: 1;
                    min-width: 150px;
                }
                
                .auditoria-logs {
                    max-height: 400px;
                    overflow-y: auto;
                }
                
                .log-nivel-info td:first-child {
                    border-left: 4px solid #3498db;
                }
                
                .log-nivel-aviso td:first-child {
                    border-left: 4px solid #f39c12;
                }
                
                .log-nivel-erro td:first-child {
                    border-left: 4px solid #e74c3c;
                }
                
                .log-nivel-critico td:first-child {
                    border-left: 4px solid #c0392b;
                    background: #fdeded;
                }
                
                .log-nivel-seguranca td:first-child {
                    border-left: 4px solid #9b59b6;
                }
                
                .badge-info {
                    background: #3498db;
                    color: white;
                }
                
                .badge-aviso {
                    background: #f39c12;
                    color: white;
                }
                
                .badge-erro {
                    background: #e74c3c;
                    color: white;
                }
                
                .badge-critico {
                    background: #c0392b;
                    color: white;
                }
                
                .badge-seguranca {
                    background: #9b59b6;
                    color: white;
                }
            `;

            document.head.appendChild(style);
        }

        function verDetalhesLog(id) {
            const log = logs.find(l => l.id === id);
            if (!log) return;

            const detalhesHTML = `
                <div class="log-detalhes">
                    <h4>Detalhes do Log</h4>
                    
                    <div class="detalhe-item">
                        <strong>ID:</strong> ${log.id}
                    </div>
                    <div class="detalhe-item">
                        <strong>Data/Hora:</strong> ${new Date(log.timestamp).toLocaleString('pt-BR')}
                    </div>
                    <div class="detalhe-item">
                        <strong>Usuário:</strong> ${log.usuario?.nome || 'Sistema'} (${log.usuario?.perfil || 'Sistema'})
                    </div>
                    <div class="detalhe-item">
                        <strong>Nível:</strong> <span class="badge badge-${log.nivel}">${log.nivel}</span>
                    </div>
                    <div class="detalhe-item">
                        <strong>Categoria:</strong> ${log.categoria}
                    </div>
                    <div class="detalhe-item">
                        <strong>Mensagem:</strong> ${log.mensagem}
                    </div>
                    <div class="detalhe-item">
                        <strong>IP:</strong> ${log.ip}
                    </div>
                    <div class="detalhe-item">
                        <strong>User Agent:</strong> ${log.userAgent}
                    </div>
                    <div class="detalhe-item">
                        <strong>URL:</strong> ${log.url}
                    </div>
                    
                    ${Object.keys(log.dados || {}).length > 0 ? `
                        <h4 style="margin-top: 20px;">Dados Adicionais</h4>
                        <pre class="log-dados">${JSON.stringify(log.dados, null, 2)}</pre>
                    ` : ''}
                </div>
            `;

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Detalhes do Log', detalhesHTML);
            }
        }

        // ==================== EXPORTAÇÃO ====================
        function exportarLogs(formato = 'json') {
            const dados = buscarLogs({});

            if (formato === 'json') {
                const jsonString = JSON.stringify(dados, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                
                const nomeArquivo = `logs_${new Date().toISOString().split('T')[0]}.json`;
                
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = nomeArquivo;
                link.click();
                URL.revokeObjectURL(link.href);
            }

            registrarAcaoUsuario('exportou logs', CONFIG.categorias.EXPORTACAO);
        }

        function limparLogs() {
            if (confirm('Deseja realmente limpar todos os logs?')) {
                logs = [];
                salvarLogs();
                alert('Logs limpos com sucesso');
                
                registrarEventoSeguranca('Logs de auditoria foram limpos');
            }
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function gerarId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        function obterIpCliente() {
            // Em produção, viria do servidor
            return '127.0.0.1';
        }

        function interceptarConsole() {
            const originalError = console.error;
            console.error = (...args) => {
                registrarErro('Erro no console', new Error(args[0]), { args });
                originalError.apply(console, args);
            };
        }

        function registrarEventosSistema() {
            // Login/Logout
            document.addEventListener('login', () => {
                registrarAcaoUsuario('realizou login', CONFIG.categorias.LOGIN);
            });

            document.addEventListener('logout', () => {
                registrarAcaoUsuario('realizou logout', CONFIG.categorias.LOGOUT);
            });

            // Erros não capturados
            window.addEventListener('error', (event) => {
                registrarErro('Erro não capturado', event.error, {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno
                });
            });

            window.addEventListener('unhandledrejection', (event) => {
                registrarErro('Promise rejeitada', event.reason);
            });
        }

        function notificarListeners(log) {
            listeners.forEach(listener => {
                try {
                    listener(log);
                } catch (e) {
                    console.error('Erro ao notificar listener:', e);
                }
            });
        }

        function notificarLogCritico(log) {
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoErro(
                    'Evento Crítico',
                    log.mensagem,
                    { prioridade: 3 }
                );
            }
        }

        function inscrever(listener) {
            listeners.push(listener);
            return () => {
                listeners = listeners.filter(l => l !== listener);
            };
        }

        function aplicarFiltros() {
            const busca = document.getElementById('filtro-busca')?.value;
            const nivel = document.getElementById('filtro-nivel')?.value;
            const categoria = document.getElementById('filtro-categoria')?.value;

            const filtrados = buscarLogs({
                busca,
                nivel,
                categoria,
                limite: 50
            });

            // Atualizar tabela
            const tbody = document.querySelector('.auditoria-logs tbody');
            if (tbody) {
                tbody.innerHTML = filtrados.map(log => `
                    <tr class="log-nivel-${log.nivel}">
                        <td>${new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                        <td>${log.usuario?.nome || 'Sistema'}</td>
                        <td><span class="badge badge-${log.nivel}">${log.nivel}</span></td>
                        <td>${log.categoria}</td>
                        <td>${log.mensagem}</td>
                        <td>
                            <button class="btn-icon" onclick="MODULO_AUDITORIA.verDetalhesLog('${log.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }

        // ==================== PERSISTÊNCIA ====================
        function salvarLogs() {
            try {
                localStorage.setItem('sme_auditoria_logs', JSON.stringify(logs));
            } catch (e) {
                console.error('Erro ao salvar logs:', e);
            }
        }

        function carregarLogs() {
            try {
                const saved = localStorage.getItem('sme_auditoria_logs');
                if (saved) {
                    logs = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar logs:', e);
            }
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            registrarLog,
            registrarAcaoUsuario,
            registrarEventoSeguranca,
            registrarErro,
            buscarLogs,
            getEstatisticas,
            abrirPainelAuditoria,
            verDetalhesLog,
            exportarLogs,
            limparLogs,
            inscrever,
            aplicarFiltros,
            niveis: CONFIG.niveis,
            categorias: CONFIG.categorias
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_AUDITORIA.init();
        }, 3500);
    });

    window.MODULO_AUDITORIA = MODULO_AUDITORIA;
    console.log('✅ Módulo de Auditoria carregado');
}
// modulos/auditoria-avancada.js - Logs de Auditoria Avançados
// Sistema de Gestão Educacional Municipal - FASE 6

if (typeof MODULO_AUDITORIA_AVANCADA === 'undefined') {
    const MODULO_AUDITORIA_AVANCADA = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            versao: '2.0.0',
            niveis: {
                DEBUG: 0,
                INFO: 1,
                AVISO: 2,
                ERRO: 3,
                CRITICO: 4,
                SEGURANCA: 5
            },
            categorias: {
                AUTENTICACAO: 'auth',
                AUTORIZACAO: 'authz',
                DADOS: 'dados',
                SISTEMA: 'sistema',
                SEGURANCA: 'seguranca',
                PERFORMANCE: 'performance',
                USUARIO: 'usuario',
                API: 'api',
                EXPORTACAO: 'exportacao',
                IMPORTACAO: 'importacao'
            },
            retencao: {
                dias: 90,
                maxLinhas: 10000
            },
            alertas: {
                email: true,
                notificacao: true,
                threshold: {
                    erro: 10, // 10 erros por minuto
                    critico: 3  // 3 críticos por minuto
                }
            }
        };

        // ==================== ESTADO ====================
        let logs = [];
        let alertas = [];
        let metricas = {
            porNivel: {},
            porCategoria: {},
            porUsuario: {},
            porHora: Array(24).fill(0)
        };
        let filtrosAtivos = {};
        let listeners = [];

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('📋 Módulo de Auditoria Avançada inicializado');
            
            carregarLogs();
            iniciarMonitoramento();
            configurarExportacao();
            
            // Registrar no módulo de auditoria base
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    'Módulo de auditoria avançada inicializado',
                    MODULO_AUDITORIA.categorias?.SISTEMA || 'sistema',
                    MODULO_AUDITORIA.niveis?.INFO || 'info'
                );
            }
        }

        // ==================== REGISTRO DE LOGS ====================
        function registrarLog(mensagem, categoria = CONFIG.categorias.SISTEMA, nivel = CONFIG.niveis.INFO, dados = {}) {
            const usuario = typeof SISTEMA !== 'undefined' ? SISTEMA.getEstado().usuario : null;
            
            const log = {
                id: gerarId(),
                timestamp: new Date().toISOString(),
                nivel,
                categoria,
                mensagem,
                usuario: usuario ? {
                    id: usuario.id,
                    nome: usuario.nome,
                    perfil: usuario.perfil,
                    email: usuario.email
                } : null,
                dados: anonimizarDadosSensiveis(dados),
                ip: obterIpCliente(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                performance: {
                    tempoCarregamento: performance.now(),
                    memoria: performance.memory ? {
                        usado: performance.memory.usedJSHeapSize,
                        total: performance.memory.totalJSHeapSize
                    } : null
                }
            };

            logs.push(log);

            // Limitar tamanho do log
            if (logs.length > CONFIG.retencao.maxLinhas) {
                logs = logs.slice(-CONFIG.retencao.maxLinhas);
            }

            atualizarMetricas(log);
            verificarAlertas(log);
            salvarLogs();
            notificarListeners('novoLog', log);

            // Logs críticos disparam ações
            if (nivel >= CONFIG.niveis.CRITICO) {
                dispararAlertaCritico(log);
            }

            return log.id;
        }

        function registrarLogSeguranca(mensagem, dados = {}) {
            return registrarLog(
                mensagem,
                CONFIG.categorias.SEGURANCA,
                CONFIG.niveis.SEGURANCA,
                dados
            );
        }

        function registrarLogErro(mensagem, erro, dados = {}) {
            return registrarLog(
                mensagem,
                CONFIG.categorias.SISTEMA,
                CONFIG.niveis.ERRO,
                {
                    erro: erro.message,
                    stack: erro.stack,
                    ...dados
                }
            );
        }

        function registrarLogUsuario(acao, dados = {}) {
            return registrarLog(
                `Usuário realizou: ${acao}`,
                CONFIG.categorias.USUARIO,
                CONFIG.niveis.INFO,
                dados
            );
        }

        // ==================== CONSULTAS ====================
        function buscarLogs(filtros = {}) {
            let resultados = [...logs];

            // Filtro por data
            if (filtros.dataInicio) {
                resultados = resultados.filter(l => l.timestamp >= filtros.dataInicio);
            }
            if (filtros.dataFim) {
                resultados = resultados.filter(l => l.timestamp <= filtros.dataFim);
            }

            // Filtro por nível
            if (filtros.nivel) {
                resultados = resultados.filter(l => l.nivel === filtros.nivel);
            }

            // Filtro por categoria
            if (filtros.categoria) {
                resultados = resultados.filter(l => l.categoria === filtros.categoria);
            }

            // Filtro por usuário
            if (filtros.usuarioId) {
                resultados = resultados.filter(l => l.usuario?.id === filtros.usuarioId);
            }

            // Busca textual
            if (filtros.busca) {
                const termo = filtros.busca.toLowerCase();
                resultados = resultados.filter(l => 
                    l.mensagem.toLowerCase().includes(termo) ||
                    l.usuario?.nome?.toLowerCase().includes(termo) ||
                    l.usuario?.email?.toLowerCase().includes(termo)
                );
            }

            // Ordenação
            resultados.sort((a, b) => 
                filtros.ordem === 'asc' 
                    ? new Date(a.timestamp) - new Date(b.timestamp)
                    : new Date(b.timestamp) - new Date(a.timestamp)
            );

            // Paginação
            if (filtros.pagina && filtros.limite) {
                const inicio = (filtros.pagina - 1) * filtros.limite;
                resultados = resultados.slice(inicio, inicio + filtros.limite);
            }

            return resultados;
        }

        function getEstatisticas(periodo = 'hoje') {
            const agora = new Date();
            const inicio = new Date();

            switch(periodo) {
                case 'hoje':
                    inicio.setHours(0, 0, 0, 0);
                    break;
                case 'semana':
                    inicio.setDate(inicio.getDate() - 7);
                    break;
                case 'mes':
                    inicio.setMonth(inicio.getMonth() - 1);
                    break;
                case 'ano':
                    inicio.setFullYear(inicio.getFullYear() - 1);
                    break;
            }

            const logsPeriodo = logs.filter(l => new Date(l.timestamp) >= inicio);

            return {
                total: logsPeriodo.length,
                porNivel: Object.values(CONFIG.niveis).reduce((acc, nivel) => {
                    acc[nivel] = logsPeriodo.filter(l => l.nivel === nivel).length;
                    return acc;
                }, {}),
                porCategoria: Object.values(CONFIG.categorias).reduce((acc, cat) => {
                    acc[cat] = logsPeriodo.filter(l => l.categoria === cat).length;
                    return acc;
                }, {}),
                usuariosAtivos: new Set(logsPeriodo.map(l => l.usuario?.id).filter(Boolean)).size,
                taxaErro: logsPeriodo.filter(l => l.nivel >= CONFIG.niveis.ERRO).length / logsPeriodo.length || 0
            };
        }

        // ==================== ANÁLISE DE PADRÕES ====================
        function detectarPadroesSuspeitos() {
            const padroes = [];

            // Muitas tentativas de login falhas
            const falhasLogin = logs.filter(l => 
                l.categoria === CONFIG.categorias.AUTENTICACAO &&
                l.nivel >= CONFIG.niveis.AVISO &&
                l.mensagem.includes('falhou')
            );

            if (falhasLogin.length > 10) {
                padroes.push({
                    tipo: 'ataque_bruteforce',
                    nivel: 'alto',
                    descricao: 'Múltiplas tentativas de login falhas detectadas',
                    contagem: falhasLogin.length,
                    periodo: 'últimas 24h'
                });
            }

            // Acessos em horários suspeitos
            const acessosNoturnos = logs.filter(l => {
                const hora = new Date(l.timestamp).getHours();
                return hora >= 0 && hora <= 4;
            });

            if (acessosNoturnos.length > 20) {
                padroes.push({
                    tipo: 'acesso_noturno',
                    nivel: 'medio',
                    descricao: 'Muitos acessos em horário noturno',
                    contagem: acessosNoturnos.length,
                    periodo: 'últimas 24h'
                });
            }

            return padroes;
        }

        // ==================== ALERTAS ====================
        function verificarAlertas(log) {
            const minutoAtual = Math.floor(Date.now() / 60000);
            const logsMinuto = logs.filter(l => 
                Math.floor(new Date(l.timestamp).getTime() / 60000) === minutoAtual
            );

            // Verificar threshold de erros
            const errosMinuto = logsMinuto.filter(l => l.nivel === CONFIG.niveis.ERRO).length;
            if (errosMinuto >= CONFIG.alertas.threshold.erro) {
                dispararAlerta({
                    tipo: 'threshold_erro',
                    nivel: 'alto',
                    mensagem: `Muitos erros detectados: ${errosMinuto} no último minuto`,
                    contagem: errosMinuto
                });
            }

            // Verificar threshold de críticos
            const criticosMinuto = logsMinuto.filter(l => l.nivel === CONFIG.niveis.CRITICO).length;
            if (criticosMinuto >= CONFIG.alertas.threshold.critico) {
                dispararAlerta({
                    tipo: 'threshold_critico',
                    nivel: 'critico',
                    mensagem: `Muitos eventos críticos: ${criticosMinuto} no último minuto`,
                    contagem: criticosMinuto
                });
            }
        }

        function dispararAlerta(alerta) {
            alertas.push({
                id: gerarId(),
                ...alerta,
                timestamp: new Date().toISOString(),
                resolvido: false
            });

            // Notificar em tempo real
            if (CONFIG.alertas.notificacao && typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoErro(
                    `Alerta de ${alerta.nivel}`,
                    alerta.mensagem,
                    { prioridade: alerta.nivel === 'critico' ? 3 : 2 }
                );
            }

            // Enviar email se configurado
            if (CONFIG.alertas.email) {
                enviarEmailAlerta(alerta);
            }

            notificarListeners('alerta', alerta);
        }

        function dispararAlertaCritico(log) {
            dispararAlerta({
                tipo: 'evento_critico',
                nivel: 'critico',
                mensagem: log.mensagem,
                log
            });
        }

        // ==================== EXPORTAÇÃO ====================
        function configurarExportacao() {
            // Exportação automática periódica
            setInterval(() => {
                exportarLogsAutomatico();
            }, 24 * 60 * 60 * 1000); // 1 dia
        }

        function exportarLogs(filtros = {}, formato = 'json') {
            const dados = buscarLogs(filtros);

            switch(formato) {
                case 'json':
                    return exportarJSON(dados);
                case 'csv':
                    return exportarCSV(dados);
                case 'pdf':
                    return exportarPDF(dados);
                default:
                    return exportarJSON(dados);
            }
        }

        function exportarJSON(dados) {
            const jsonString = JSON.stringify(dados, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `logs_${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            registrarLog('Logs exportados em JSON', CONFIG.categorias.EXPORTACAO);
        }

        function exportarCSV(dados) {
            const cabecalho = ['timestamp', 'nivel', 'categoria', 'mensagem', 'usuario', 'ip'];
            const linhas = dados.map(log => [
                log.timestamp,
                log.nivel,
                log.categoria,
                `"${log.mensagem.replace(/"/g, '""')}"`,
                log.usuario ? log.usuario.nome : 'Sistema',
                log.ip
            ]);

            const csv = [cabecalho.join(','), ...linhas.map(l => l.join(','))].join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();

            registrarLog('Logs exportados em CSV', CONFIG.categorias.EXPORTACAO);
        }

        function exportarPDF(dados) {
            // Simular exportação PDF
            console.log('Exportando PDF com', dados.length, 'logs');
            registrarLog('Logs exportados em PDF', CONFIG.categorias.EXPORTACAO);
        }

        function exportarLogsAutomatico() {
            const data = new Date();
            const filtros = {
                dataInicio: new Date(data.setDate(data.getDate() - 1)).toISOString(),
                dataFim: new Date().toISOString()
            };

            exportarLogs(filtros, 'json');
        }

        // ==================== LIMPEZA ====================
        function limparLogsAntigos() {
            const agora = Date.now();
            const limite = agora - (CONFIG.retencao.dias * 24 * 60 * 60 * 1000);
            
            const tamanhoAntes = logs.length;
            logs = logs.filter(l => new Date(l.timestamp).getTime() > limite);
            const removidos = tamanhoAntes - logs.length;

            if (removidos > 0) {
                registrarLog(
                    `${removidos} logs antigos removidos`,
                    CONFIG.categorias.SISTEMA,
                    CONFIG.niveis.INFO
                );
            }

            salvarLogs();
            return removidos;
        }

        // ==================== UTILITÁRIOS ====================
        function gerarId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        function obterIpCliente() {
            // Em produção, viria do servidor
            return '127.0.0.1';
        }

        function anonimizarDadosSensiveis(dados) {
            if (!dados) return dados;

            const dadosAnonimos = { ...dados };
            
            // Remover informações sensíveis
            delete dadosAnonimos.senha;
            delete dadosAnonimos.token;
            delete dadosAnonimos.cpf;
            delete dadosAnonimos.rg;

            return dadosAnonimos;
        }

        function atualizarMetricas(log) {
            const hora = new Date(log.timestamp).getHours();
            
            metricas.porNivel[log.nivel] = (metricas.porNivel[log.nivel] || 0) + 1;
            metricas.porCategoria[log.categoria] = (metricas.porCategoria[log.categoria] || 0) + 1;
            metricas.porHora[hora] = (metricas.porHora[hora] || 0) + 1;
            
            if (log.usuario) {
                metricas.porUsuario[log.usuario.id] = (metricas.porUsuario[log.usuario.id] || 0) + 1;
            }
        }

        function salvarLogs() {
            try {
                localStorage.setItem('sme_logs_avancados', JSON.stringify(logs.slice(-1000))); // Últimos 1000
            } catch (e) {
                console.error('Erro ao salvar logs:', e);
            }
        }

        function carregarLogs() {
            try {
                const saved = localStorage.getItem('sme_logs_avancados');
                if (saved) {
                    logs = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar logs:', e);
            }
        }

        function iniciarMonitoramento() {
            // Monitorar erros não capturados
            window.addEventListener('error', (event) => {
                registrarLogErro('Erro não capturado', event.error, {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno
                });
            });

            // Monitorar promessas rejeitadas
            window.addEventListener('unhandledrejection', (event) => {
                registrarLogErro('Promise rejeitada', event.reason);
            });

            // Monitorar performance
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (entry.entryType === 'longtask' && entry.duration > 100) {
                            registrarLog(
                                `Long task detectada: ${entry.duration}ms`,
                                CONFIG.categorias.PERFORMANCE,
                                CONFIG.niveis.AVISO,
                                { duration: entry.duration }
                            );
                        }
                    });
                });
                
                observer.observe({ entryTypes: ['longtask', 'resource'] });
            }
        }

        function notificarListeners(evento, dados) {
            listeners.forEach(cb => {
                try {
                    cb(evento, dados);
                } catch (e) {
                    console.error('Erro ao notificar listener:', e);
                }
            });
        }

        function inscrever(callback) {
            listeners.push(callback);
            return () => {
                listeners = listeners.filter(cb => cb !== callback);
            };
        }

        function enviarEmailAlerta(alerta) {
            // Simular envio de email
            console.log('📧 Email de alerta enviado:', alerta);
        }

        // ==================== INTERFACE DO USUÁRIO ====================
        function abrirPainelAuditoriaAvancada() {
            const estatisticas = getEstatisticas('hoje');
            const padroes = detectarPadroesSuspeitos();
            const logsRecentes = buscarLogs({ limite: 50 });

            const modalHTML = `
                <div class="auditoria-avancada-painel">
                    <div class="auditoria-header">
                        <h2><i class="fas fa-chart-line"></i> Auditoria Avançada</h2>
                        <div class="auditoria-actions">
                            <button class="btn btn-secondary" onclick="exportarLogsAtuais()">
                                <i class="fas fa-download"></i> Exportar
                            </button>
                            <button class="btn btn-danger" onclick="limparLogsAntigos()">
                                <i class="fas fa-trash"></i> Limpar Antigos
                            </button>
                        </div>
                    </div>
                    
                    <div class="auditoria-stats-avancadas">
                        <div class="stat-card">
                            <div class="stat-value">${estatisticas.total}</div>
                            <div class="stat-label">Total Hoje</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${estatisticas.porNivel[CONFIG.niveis.ERRO] || 0}</div>
                            <div class="stat-label">Erros</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${estatisticas.porNivel[CONFIG.niveis.CRITICO] || 0}</div>
                            <div class="stat-label">Críticos</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${estatisticas.usuariosAtivos}</div>
                            <div class="stat-label">Usuários Ativos</div>
                        </div>
                    </div>
                    
                    ${padroes.length > 0 ? `
                        <div class="padroes-suspeitos">
                            <h3><i class="fas fa-exclamation-triangle text-danger"></i> Padrões Suspeitos</h3>
                            ${padroes.map(p => `
                                <div class="padrao-item nivel-${p.nivel}">
                                    <strong>${p.tipo}:</strong> ${p.descricao}
                                    <span class="badge">${p.contagem} ocorrências</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="auditoria-filtros-avancados">
                        <input type="text" class="form-control" placeholder="Buscar..." id="filtro-busca">
                        <select class="form-control" id="filtro-nivel">
                            <option value="">Todos os níveis</option>
                            ${Object.entries(CONFIG.niveis).map(([nome, valor]) => `
                                <option value="${valor}">${nome}</option>
                            `).join('')}
                        </select>
                        <select class="form-control" id="filtro-categoria">
                            <option value="">Todas categorias</option>
                            ${Object.entries(CONFIG.categorias).map(([nome, valor]) => `
                                <option value="${valor}">${nome}</option>
                            `).join('')}
                        </select>
                        <button class="btn btn-primary" onclick="aplicarFiltrosAvancados()">
                            <i class="fas fa-filter"></i> Filtrar
                        </button>
                    </div>
                    
                    <div class="auditoria-tabela-avancada">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Nível</th>
                                    <th>Categoria</th>
                                    <th>Mensagem</th>
                                    <th>Usuário</th>
                                    <th>IP</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${logsRecentes.map(log => `
                                    <tr class="nivel-${log.nivel}">
                                        <td>${new Date(log.timestamp).toLocaleString()}</td>
                                        <td><span class="badge nivel-${log.nivel}">${log.nivel}</span></td>
                                        <td>${log.categoria}</td>
                                        <td>${log.mensagem.substring(0, 50)}...</td>
                                        <td>${log.usuario?.nome || 'Sistema'}</td>
                                        <td>${log.ip}</td>
                                        <td>
                                            <button class="btn-icon" onclick="verDetalhesLog('${log.id}')">
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
            adicionarEstilosAuditoriaAvancada();

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Auditoria Avançada', modalHTML);
            }
        }

        function adicionarEstilosAuditoriaAvancada() {
            if (document.getElementById('style-auditoria-avancada')) return;

            const style = document.createElement('style');
            style.id = 'style-auditoria-avancada';
            style.textContent = `
                .auditoria-avancada-painel {
                    max-height: 600px;
                    overflow-y: auto;
                }
                
                .auditoria-stats-avancadas {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin: 20px 0;
                }
                
                .padroes-suspeitos {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 20px 0;
                }
                
                .padrao-item {
                    padding: 10px;
                    border-bottom: 1px solid #ffeaa7;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .padrao-item:last-child {
                    border-bottom: none;
                }
                
                .padrao-item.nivel-alto {
                    color: #e74c3c;
                }
                
                .padrao-item.nivel-medio {
                    color: #f39c12;
                }
                
                .auditoria-filtros-avancados {
                    display: flex;
                    gap: 10px;
                    margin: 20px 0;
                    flex-wrap: wrap;
                }
                
                .auditoria-tabela-avancada {
                    max-height: 300px;
                    overflow-y: auto;
                }
                
                .nivel-${CONFIG.niveis.INFO} td:first-child {
                    border-left: 4px solid #3498db;
                }
                
                .nivel-${CONFIG.niveis.AVISO} td:first-child {
                    border-left: 4px solid #f39c12;
                }
                
                .nivel-${CONFIG.niveis.ERRO} td:first-child {
                    border-left: 4px solid #e74c3c;
                }
                
                .nivel-${CONFIG.niveis.CRITICO} td:first-child {
                    border-left: 4px solid #c0392b;
                    background: #fdeded;
                }
                
                .nivel-${CONFIG.niveis.SEGURANCA} td:first-child {
                    border-left: 4px solid #9b59b6;
                }
                
                .badge.nivel-${CONFIG.niveis.INFO} { background: #3498db; color: white; }
                .badge.nivel-${CONFIG.niveis.AVISO} { background: #f39c12; color: white; }
                .badge.nivel-${CONFIG.niveis.ERRO} { background: #e74c3c; color: white; }
                .badge.nivel-${CONFIG.niveis.CRITICO} { background: #c0392b; color: white; }
                .badge.nivel-${CONFIG.niveis.SEGURANCA} { background: #9b59b6; color: white; }
            `;

            document.head.appendChild(style);
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            registrarLog,
            registrarLogSeguranca,
            registrarLogErro,
            registrarLogUsuario,
            buscarLogs,
            getEstatisticas,
            detectarPadroesSuspeitos,
            exportarLogs,
            limparLogsAntigos,
            abrirPainelAuditoriaAvancada,
            inscrever,
            niveis: CONFIG.niveis,
            categorias: CONFIG.categorias
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_AUDITORIA_AVANCADA.init();
        }, 4500);
    });

    window.MODULO_AUDITORIA_AVANCADA = MODULO_AUDITORIA_AVANCADA;
    console.log('✅ Módulo de Auditoria Avançada carregado');
}
// modulos/integracoes-externas.js - Integrações com Sistemas Externos
// Sistema de Gestão Educacional Municipal - FASE 8

if (typeof MODULO_INTEGRACOES_EXTERNAS === 'undefined') {
    const MODULO_INTEGRACOES_EXTERNAS = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            versao: '1.0.0',
            sistemas: {
                SIGE: {
                    nome: 'Sistema Integrado de Gestão Escolar',
                    versao: '2.0',
                    endpoints: {
                        alunos: '/api/sige/alunos',
                        professores: '/api/sige/professores',
                        turmas: '/api/sige/turmas',
                        notas: '/api/sige/notas',
                        frequencia: '/api/sige/frequencia'
                    }
                },
                SIGEDUC: {
                    nome: 'Sistema de Gestão Educacional',
                    versao: '3.1',
                    endpoints: {
                        matricula: '/api/sigeduc/matricula',
                        boletim: '/api/sigeduc/boletim',
                        frequencia: '/api/sigeduc/frequencia',
                        transporte: '/api/sigeduc/transporte'
                    }
                },
                SIGESCOLA: {
                    nome: 'Sistema de Gestão Escolar',
                    versao: '1.5',
                    endpoints: {
                        alunos: '/api/sigescola/alunos',
                        professores: '/api/sigescola/professores',
                        turmas: '/api/sigescola/turmas'
                    }
                },
                DIARIO_CLASSE: {
                    nome: 'Diário de Classe Digital',
                    versao: '4.0',
                    endpoints: {
                        diario: '/api/diario/registros',
                        planejamento: '/api/diario/planejamento',
                        avaliacoes: '/api/diario/avaliacoes'
                    }
                },
                SECRETARIA_DIGITAL: {
                    nome: 'Secretaria Digital',
                    versao: '2.3',
                    endpoints: {
                        documentos: '/api/secretaria/documentos',
                        historico: '/api/secretaria/historico',
                        certificados: '/api/secretaria/certificados'
                    }
                }
            },
            protocolos: {
                REST: 'rest',
                SOAP: 'soap',
                GraphQL: 'graphql',
                FTP: 'ftp'
            },
            formatos: {
                JSON: 'json',
                XML: 'xml',
                CSV: 'csv',
                PDF: 'pdf'
            },
            autenticacao: {
                API_KEY: 'api_key',
                OAUTH2: 'oauth2',
                JWT: 'jwt',
                BASIC: 'basic'
            }
        };

        // ==================== ESTADO ====================
        let conexoes = {};
        let filaIntegracao = [];
        let logsIntegracao = [];
        let estatisticas = {
            integracoes: 0,
            sucessos: 0,
            erros: 0,
            tempoMedio: 0
        };

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('🔄 Módulo de Integrações Externas inicializado');
            
            carregarConexoes();
            configurarIntegracoes();
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                MODULO_AUDITORIA_AVANCADA.registrarLog(
                    'Módulo de integrações externas inicializado',
                    MODULO_AUDITORIA_AVANCADA.categorias?.SISTEMA || 'sistema',
                    MODULO_AUDITORIA_AVANCADA.niveis?.INFO || 'info'
                );
            }
        }

        // ==================== GERENCIAMENTO DE CONEXÕES ====================
        function configurarConexao(sistema, config) {
            if (!CONFIG.sistemas[sistema]) {
                throw new Error(`Sistema ${sistema} não suportado`);
            }

            conexoes[sistema] = {
                ...CONFIG.sistemas[sistema],
                ...config,
                status: 'configurado',
                ultimaConexao: null,
                estatisticas: {
                    tentativas: 0,
                    sucessos: 0,
                    falhas: 0
                }
            };

            salvarConexoes();
            return conexoes[sistema];
        }

        function testarConexao(sistema) {
            const conexao = conexoes[sistema];
            if (!conexao) {
                throw new Error(`Sistema ${sistema} não configurado`);
            }

            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const sucesso = Math.random() > 0.2; // 80% de sucesso
                    
                    if (sucesso) {
                        conexao.status = 'online';
                        conexao.ultimaConexao = new Date().toISOString();
                        conexao.estatisticas.sucessos++;
                        resolve({ status: 'online', sistema: conexao.nome });
                    } else {
                        conexao.status = 'offline';
                        conexao.estatisticas.falhas++;
                        reject(new Error(`Falha na conexão com ${conexao.nome}`));
                    }
                    
                    salvarConexoes();
                }, 1000);
            });
        }

        // ==================== INTEGRAÇÃO DE DADOS ====================
        async function integrarAlunos(sistema, opcoes = {}) {
            const conexao = conexoes[sistema];
            if (!conexao) {
                throw new Error(`Sistema ${sistema} não configurado`);
            }

            const alunos = MOCK_DATA.alunos || [];
            const inicio = Date.now();

            try {
                const resultado = await enviarParaSistema(sistema, 'alunos', alunos, opcoes);

                registrarLog({
                    tipo: 'integracao',
                    sistema: conexao.nome,
                    acao: 'integrar_alunos',
                    quantidade: alunos.length,
                    sucesso: true,
                    tempo: Date.now() - inicio
                });

                estatisticas.integracoes++;
                estatisticas.sucessos++;
                estatisticas.tempoMedio = (estatisticas.tempoMedio + (Date.now() - inicio)) / 2;

                return resultado;
            } catch (erro) {
                registrarLog({
                    tipo: 'erro',
                    sistema: conexao.nome,
                    acao: 'integrar_alunos',
                    erro: erro.message,
                    tempo: Date.now() - inicio
                });

                estatisticas.erros++;
                throw erro;
            }
        }

        async function integrarProfessores(sistema, opcoes = {}) {
            const conexao = conexoes[sistema];
            if (!conexao) {
                throw new Error(`Sistema ${sistema} não configurado`);
            }

            const professores = MOCK_DATA.professores || [];
            const inicio = Date.now();

            try {
                const resultado = await enviarParaSistema(sistema, 'professores', professores, opcoes);

                registrarLog({
                    tipo: 'integracao',
                    sistema: conexao.nome,
                    acao: 'integrar_professores',
                    quantidade: professores.length,
                    sucesso: true,
                    tempo: Date.now() - inicio
                });

                estatisticas.integracoes++;
                estatisticas.sucessos++;

                return resultado;
            } catch (erro) {
                registrarLog({
                    tipo: 'erro',
                    sistema: conexao.nome,
                    acao: 'integrar_professores',
                    erro: erro.message,
                    tempo: Date.now() - inicio
                });

                estatisticas.erros++;
                throw erro;
            }
        }

        async function integrarTurmas(sistema, opcoes = {}) {
            const conexao = conexoes[sistema];
            if (!conexao) {
                throw new Error(`Sistema ${sistema} não configurado`);
            }

            const turmas = MOCK_DATA.turmas || [];
            const inicio = Date.now();

            try {
                const resultado = await enviarParaSistema(sistema, 'turmas', turmas, opcoes);

                registrarLog({
                    tipo: 'integracao',
                    sistema: conexao.nome,
                    acao: 'integrar_turmas',
                    quantidade: turmas.length,
                    sucesso: true,
                    tempo: Date.now() - inicio
                });

                estatisticas.integracoes++;
                estatisticas.sucessos++;

                return resultado;
            } catch (erro) {
                registrarLog({
                    tipo: 'erro',
                    sistema: conexao.nome,
                    acao: 'integrar_turmas',
                    erro: erro.message,
                    tempo: Date.now() - inicio
                });

                estatisticas.erros++;
                throw erro;
            }
        }

        async function integrarNotas(sistema, opcoes = {}) {
            const conexao = conexoes[sistema];
            if (!conexao) {
                throw new Error(`Sistema ${sistema} não configurado`);
            }

            const notas = MOCK_DATA.notas || [];
            const inicio = Date.now();

            try {
                const resultado = await enviarParaSistema(sistema, 'notas', notas, opcoes);

                registrarLog({
                    tipo: 'integracao',
                    sistema: conexao.nome,
                    acao: 'integrar_notas',
                    quantidade: notas.length,
                    sucesso: true,
                    tempo: Date.now() - inicio
                });

                estatisticas.integracoes++;
                estatisticas.sucessos++;

                return resultado;
            } catch (erro) {
                registrarLog({
                    tipo: 'erro',
                    sistema: conexao.nome,
                    acao: 'integrar_notas',
                    erro: erro.message,
                    tempo: Date.now() - inicio
                });

                estatisticas.erros++;
                throw erro;
            }
        }

        async function integrarFrequencia(sistema, opcoes = {}) {
            const conexao = conexoes[sistema];
            if (!conexao) {
                throw new Error(`Sistema ${sistema} não configurado`);
            }

            const frequencias = MOCK_DATA.frequencias || [];
            const inicio = Date.now();

            try {
                const resultado = await enviarParaSistema(sistema, 'frequencia', frequencias, opcoes);

                registrarLog({
                    tipo: 'integracao',
                    sistema: conexao.nome,
                    acao: 'integrar_frequencia',
                    quantidade: frequencias.length,
                    sucesso: true,
                    tempo: Date.now() - inicio
                });

                estatisticas.integracoes++;
                estatisticas.sucessos++;

                return resultado;
            } catch (erro) {
                registrarLog({
                    tipo: 'erro',
                    sistema: conexao.nome,
                    acao: 'integrar_frequencia',
                    erro: erro.message,
                    tempo: Date.now() - inicio
                });

                estatisticas.erros++;
                throw erro;
            }
        }

        async function enviarParaSistema(sistema, recurso, dados, opcoes) {
            // Simular envio
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const sucesso = Math.random() > 0.1; // 90% de sucesso

                    if (sucesso) {
                        resolve({
                            sucesso: true,
                            sistema,
                            recurso,
                            quantidade: dados.length,
                            timestamp: new Date().toISOString(),
                            mensagem: 'Integração realizada com sucesso'
                        });
                    } else {
                        reject(new Error(`Erro ao integrar ${recurso} com ${sistema}`));
                    }
                }, 1500);
            });
        }

        // ==================== SINCRONIZAÇÃO BIDIRECIONAL ====================
        async function sincronizarBidirecional(sistema, recursos = ['alunos', 'professores', 'turmas']) {
            const conexao = conexoes[sistema];
            if (!conexao) {
                throw new Error(`Sistema ${sistema} não configurado`);
            }

            const resultados = [];
            const inicio = Date.now();

            for (const recurso of recursos) {
                try {
                    // Exportar dados do sistema
                    const dadosExportar = obterDadosRecurso(recurso);
                    
                    // Enviar para sistema externo
                    await enviarParaSistema(sistema, recurso, dadosExportar, { acao: 'exportar' });

                    // Importar dados do sistema externo
                    const dadosImportar = await importarDoSistema(sistema, recurso);

                    // Atualizar dados locais
                    await atualizarDadosLocais(recurso, dadosImportar);

                    resultados.push({
                        recurso,
                        sucesso: true,
                        exportados: dadosExportar.length,
                        importados: dadosImportar.length
                    });

                } catch (erro) {
                    resultados.push({
                        recurso,
                        sucesso: false,
                        erro: erro.message
                    });
                }
            }

            registrarLog({
                tipo: 'sincronizacao',
                sistema: conexao.nome,
                resultados,
                tempo: Date.now() - inicio
            });

            return resultados;
        }

        function obterDadosRecurso(recurso) {
            switch(recurso) {
                case 'alunos': return MOCK_DATA.alunos || [];
                case 'professores': return MOCK_DATA.professores || [];
                case 'turmas': return MOCK_DATA.turmas || [];
                case 'notas': return MOCK_DATA.notas || [];
                case 'frequencia': return MOCK_DATA.frequencias || [];
                default: return [];
            }
        }

        async function importarDoSistema(sistema, recurso) {
            // Simular importação
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(gerarDadosMock(recurso));
                }, 1000);
            });
        }

        function gerarDadosMock(recurso) {
            switch(recurso) {
                case 'alunos':
                    return Array(5).fill().map((_, i) => ({
                        id: `ext_${Date.now()}_${i}`,
                        nome: `Aluno Externo ${i + 1}`,
                        matricula: `EXT${Date.now()}${i}`,
                        turma: 'Turma Externa'
                    }));
                case 'professores':
                    return Array(3).fill().map((_, i) => ({
                        id: `ext_${Date.now()}_${i}`,
                        nome: `Professor Externo ${i + 1}`,
                        disciplina: 'Disciplina Externa'
                    }));
                default:
                    return [];
            }
        }

        async function atualizarDadosLocais(recurso, dados) {
            // Atualizar dados locais com dados importados
            console.log(`Atualizando ${recurso} com dados externos:`, dados);
        }

        // ==================== MAPEAMENTO DE CAMPOS ====================
        function configurarMapeamento(sistema, mapeamentos) {
            if (!conexoes[sistema]) {
                throw new Error(`Sistema ${sistema} não configurado`);
            }

            conexoes[sistema].mapeamentos = mapeamentos;
            salvarConexoes();
        }

        function mapearCampo(valor, mapeamento) {
            if (!mapeamento) return valor;

            // Aplicar transformações
            if (mapeamento.transform) {
                valor = mapeamento.transform(valor);
            }

            // Mapear valores
            if (mapeamento.mapa && mapeamento.mapa[valor]) {
                valor = mapeamento.mapa[valor];
            }

            return valor;
        }

        // ==================== AGENDAMENTO ====================
        function configurarAgendamento(sistema, config) {
            const conexao = conexoes[sistema];
            if (!conexao) {
                throw new Error(`Sistema ${sistema} não configurado`);
            }

            conexao.agendamento = config;

            // Configurar intervalo
            if (config.intervalo) {
                setInterval(() => {
                    executarAgendamento(sistema);
                }, config.intervalo);
            }

            salvarConexoes();
        }

        async function executarAgendamento(sistema) {
            const conexao = conexoes[sistema];
            if (!conexao || !conexao.agendamento) return;

            try {
                await sincronizarBidirecional(sistema, conexao.agendamento.recursos);
            } catch (erro) {
                console.error(`Erro no agendamento para ${sistema}:`, erro);
            }
        }

        // ==================== VALIDAÇÃO ====================
        function validarDados(dados, regras) {
            const erros = [];

            for (const [campo, regra] of Object.entries(regras)) {
                const valor = dados[campo];

                if (regra.obrigatorio && !valor) {
                    erros.push(`Campo ${campo} é obrigatório`);
                }

                if (regra.tipo && valor) {
                    const tipoValido = typeof valor === regra.tipo;
                    if (!tipoValido) {
                        erros.push(`Campo ${campo} deve ser do tipo ${regra.tipo}`);
                    }
                }

                if (regra.min && valor && valor.length < regra.min) {
                    erros.push(`Campo ${campo} deve ter no mínimo ${regra.min} caracteres`);
                }

                if (regra.max && valor && valor.length > regra.max) {
                    erros.push(`Campo ${campo} deve ter no máximo ${regra.max} caracteres`);
                }

                if (regra.pattern && valor && !regra.pattern.test(valor)) {
                    erros.push(`Campo ${campo} está em formato inválido`);
                }
            }

            return {
                valido: erros.length === 0,
                erros
            };
        }

        // ==================== LOGS ====================
        function registrarLog(log) {
            logsIntegracao.unshift({
                ...log,
                timestamp: new Date().toISOString()
            });

            // Manter apenas últimos 1000 logs
            if (logsIntegracao.length > 1000) {
                logsIntegracao = logsIntegracao.slice(0, 1000);
            }

            salvarLogs();
        }

        function getLogs(filtros = {}) {
            let logs = [...logsIntegracao];

            if (filtros.sistema) {
                logs = logs.filter(l => l.sistema === filtros.sistema);
            }

            if (filtros.tipo) {
                logs = logs.filter(l => l.tipo === filtros.tipo);
            }

            if (filtros.sucesso !== undefined) {
                logs = logs.filter(l => l.sucesso === filtros.sucesso);
            }

            if (filtros.dataInicio) {
                logs = logs.filter(l => l.timestamp >= filtros.dataInicio);
            }

            if (filtros.dataFim) {
                logs = logs.filter(l => l.timestamp <= filtros.dataFim);
            }

            return logs;
        }

        // ==================== INTERFACE DO USUÁRIO ====================
        function abrirPainelIntegracoes() {
            const modalHTML = `
                <div class="integracoes-painel">
                    <h3><i class="fas fa-plug"></i> Integrações Externas</h3>
                    
                    <div class="integracoes-grid">
                        ${Object.entries(CONFIG.sistemas).map(([key, sistema]) => {
                            const conexao = conexoes[key];
                            return `
                                <div class="integracao-card">
                                    <div class="integracao-header">
                                        <h4>${sistema.nome}</h4>
                                        <span class="status-badge ${conexao?.status || 'offline'}">
                                            ${conexao?.status || 'offline'}
                                        </span>
                                    </div>
                                    <div class="integracao-body">
                                        <p><strong>Versão:</strong> ${sistema.versao}</p>
                                        <p><strong>Protocolo:</strong> REST</p>
                                        ${conexao ? `
                                            <p><strong>Última conexão:</strong> ${conexao.ultimaConexao ? new Date(conexao.ultimaConexao).toLocaleString() : 'Nunca'}</p>
                                            <p><strong>Sucessos:</strong> ${conexao.estatisticas.sucessos}</p>
                                            <p><strong>Falhas:</strong> ${conexao.estatisticas.falhas}</p>
                                        ` : ''}
                                    </div>
                                    <div class="integracao-footer">
                                        ${!conexao ? `
                                            <button class="btn btn-primary" onclick="MODULO_INTEGRACOES_EXTERNAS.configurarSistema('${key}')">
                                                <i class="fas fa-cog"></i> Configurar
                                            </button>
                                        ` : `
                                            <button class="btn btn-success" onclick="MODULO_INTEGRACOES_EXTERNAS.testarConexao('${key}')">
                                                <i class="fas fa-plug"></i> Testar
                                            </button>
                                            <button class="btn btn-info" onclick="MODULO_INTEGRACOES_EXTERNAS.verLogs('${key}')">
                                                <i class="fas fa-history"></i> Logs
                                            </button>
                                        `}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="integracoes-stats">
                        <h4>Estatísticas</h4>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">Integrações</span>
                                <span class="stat-value">${estatisticas.integracoes}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Sucessos</span>
                                <span class="stat-value text-success">${estatisticas.sucessos}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Erros</span>
                                <span class="stat-value text-danger">${estatisticas.erros}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Tempo Médio</span>
                                <span class="stat-value">${Math.round(estatisticas.tempoMedio)}ms</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Adicionar estilos
            adicionarEstilosIntegracoes();

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Integrações Externas', modalHTML);
            }
        }

        function adicionarEstilosIntegracoes() {
            if (document.getElementById('style-integracoes')) return;

            const style = document.createElement('style');
            style.id = 'style-integracoes';
            style.textContent = `
                .integracoes-painel {
                    max-height: 600px;
                    overflow-y: auto;
                }
                
                .integracoes-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    margin: 20px 0;
                }
                
                .integracao-card {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .integracao-header {
                    padding: 15px;
                    background: #f8f9fa;
                    border-bottom: 1px solid #dee2e6;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .integracao-header h4 {
                    margin: 0;
                }
                
                .status-badge.online {
                    background: #d4edda;
                    color: #155724;
                }
                
                .status-badge.offline {
                    background: #f8d7da;
                    color: #721c24;
                }
                
                .status-badge.configurado {
                    background: #cce5ff;
                    color: #004085;
                }
                
                .integracao-body {
                    padding: 15px;
                }
                
                .integracao-body p {
                    margin: 5px 0;
                }
                
                .integracao-footer {
                    padding: 15px;
                    background: #f8f9fa;
                    border-top: 1px solid #dee2e6;
                    display: flex;
                    gap: 10px;
                }
                
                .integracoes-stats {
                    margin-top: 30px;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin-top: 15px;
                }
                
                .stat-item {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 15px;
                    text-align: center;
                }
                
                .stat-label {
                    display: block;
                    color: #7f8c8d;
                    margin-bottom: 5px;
                }
                
                .stat-value {
                    font-size: 1.5rem;
                    font-weight: bold;
                }
            `;

            document.head.appendChild(style);
        }

        function configurarSistema(sistema) {
            const modalHTML = `
                <div class="configuracao-sistema">
                    <h3>Configurar ${CONFIG.sistemas[sistema].nome}</h3>
                    
                    <div class="form-group">
                        <label>URL do Sistema</label>
                        <input type="url" class="form-control" id="config-url" 
                               placeholder="https://sistema.exemplo.com">
                    </div>
                    
                    <div class="form-group">
                        <label>Método de Autenticação</label>
                        <select class="form-control" id="config-auth">
                            <option value="api_key">API Key</option>
                            <option value="oauth2">OAuth 2.0</option>
                            <option value="jwt">JWT</option>
                            <option value="basic">Basic Auth</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>API Key / Token</label>
                        <input type="text" class="form-control" id="config-token">
                    </div>
                    
                    <div class="form-group">
                        <label>Intervalo de Sincronização</label>
                        <select class="form-control" id="config-intervalo">
                            <option value="3600000">A cada hora</option>
                            <option value="86400000">Diariamente</option>
                            <option value="604800000">Semanalmente</option>
                            <option value="2592000000">Mensalmente</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Recursos para Sincronizar</label>
                        <div class="checkbox-group">
                            <label><input type="checkbox" value="alunos" checked> Alunos</label>
                            <label><input type="checkbox" value="professores" checked> Professores</label>
                            <label><input type="checkbox" value="turmas" checked> Turmas</label>
                            <label><input type="checkbox" value="notas"> Notas</label>
                            <label><input type="checkbox" value="frequencia"> Frequência</label>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="SISTEMA.fecharModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="MODULO_INTEGRACOES_EXTERNAS.salvarConfiguracao('${sistema}')">
                            Salvar Configuração
                        </button>
                    </div>
                </div>
            `;

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Configurar Integração', modalHTML);
            }
        }

        function salvarConfiguracao(sistema) {
            const config = {
                url: document.getElementById('config-url')?.value,
                auth: document.getElementById('config-auth')?.value,
                token: document.getElementById('config-token')?.value,
                intervalo: parseInt(document.getElementById('config-intervalo')?.value),
                recursos: Array.from(document.querySelectorAll('.checkbox-group input:checked')).map(cb => cb.value)
            };

            configurarConexao(sistema, config);

            if (config.intervalo) {
                configurarAgendamento(sistema, {
                    intervalo: config.intervalo,
                    recursos: config.recursos
                });
            }

            SISTEMA.fecharModal();

            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                    'Configuração salva',
                    `Integração com ${CONFIG.sistemas[sistema].nome} configurada`
                );
            }
        }

        function verLogs(sistema) {
            const logs = getLogs({ sistema: CONFIG.sistemas[sistema].nome });

            const modalHTML = `
                <div class="logs-integracoes">
                    <h3>Logs de Integração - ${CONFIG.sistemas[sistema].nome}</h3>
                    
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Data/Hora</th>
                                <th>Tipo</th>
                                <th>Ação</th>
                                <th>Quantidade</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${logs.map(log => `
                                <tr>
                                    <td>${new Date(log.timestamp).toLocaleString()}</td>
                                    <td>${log.tipo}</td>
                                    <td>${log.acao || '-'}</td>
                                    <td>${log.quantidade || '-'}</td>
                                    <td>
                                        <span class="badge ${log.sucesso ? 'badge-success' : 'badge-danger'}">
                                            ${log.sucesso ? 'Sucesso' : 'Erro'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Logs de Integração', modalHTML);
            }
        }

        // ==================== UTILITÁRIOS ====================
        function salvarConexoes() {
            try {
                localStorage.setItem('sme_conexoes_externas', JSON.stringify(conexoes));
            } catch (e) {
                console.error('Erro ao salvar conexões:', e);
            }
        }

        function carregarConexoes() {
            try {
                const saved = localStorage.getItem('sme_conexoes_externas');
                if (saved) {
                    conexoes = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar conexões:', e);
            }
        }

        function salvarLogs() {
            try {
                localStorage.setItem('sme_logs_integracoes', JSON.stringify(logsIntegracao));
            } catch (e) {
                console.error('Erro ao salvar logs:', e);
            }
        }

        function carregarLogs() {
            try {
                const saved = localStorage.getItem('sme_logs_integracoes');
                if (saved) {
                    logsIntegracao = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar logs:', e);
            }
        }

        function configurarIntegracoes() {
            carregarLogs();
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            configurarConexao,
            testarConexao,
            integrarAlunos,
            integrarProfessores,
            integrarTurmas,
            integrarNotas,
            integrarFrequencia,
            sincronizarBidirecional,
            configurarMapeamento,
            configurarAgendamento,
            validarDados,
            getLogs,
            abrirPainelIntegracoes,
            configurarSistema,
            salvarConfiguracao,
            verLogs
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_INTEGRACOES_EXTERNAS.init();
        }, 8500);
    });

    window.MODULO_INTEGRACOES_EXTERNAS = MODULO_INTEGRACOES_EXTERNAS;
    console.log('✅ Módulo de Integrações Externas carregado');
}
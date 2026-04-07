// modulos/webhooks.js - Sistema de Webhooks
// Sistema de Gestão Educacional Municipal - FASE 8

if (typeof MODULO_WEBHOOKS === 'undefined') {
    const MODULO_WEBHOOKS = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            versao: '1.0.0',
            eventos: {
                ALUNO_CRIADO: 'aluno.criado',
                ALUNO_ATUALIZADO: 'aluno.atualizado',
                ALUNO_EXCLUIDO: 'aluno.excluido',
                PROFESSOR_CRIADO: 'professor.criado',
                PROFESSOR_ATUALIZADO: 'professor.atualizado',
                PROFESSOR_EXCLUIDO: 'professor.excluido',
                TURMA_CRIADA: 'turma.criada',
                TURMA_ATUALIZADA: 'turma.atualizada',
                TURMA_EXCLUIDA: 'turma.excluida',
                NOTA_LANCADA: 'nota.lancada',
                NOTA_ATUALIZADA: 'nota.atualizada',
                FREQUENCIA_REGISTRADA: 'frequencia.registrada',
                BIBLIOTECA_EMPRESTIMO: 'biblioteca.emprestimo',
                BIBLIOTECA_DEVOLUCAO: 'biblioteca.devolucao',
                MERENDA_CARDAPIO: 'merenda.cardapio',
                TRANSPORTE_ROTA: 'transporte.rota',
                OCORRENCIA_CRIADA: 'ocorrencia.criada',
                OCORRENCIA_RESOLVIDA: 'ocorrencia.resolvida',
                BACKUP_REALIZADO: 'backup.realizado',
                SISTEMA_ATUALIZADO: 'sistema.atualizado'
            },
            metodos: {
                GET: 'GET',
                POST: 'POST',
                PUT: 'PUT',
                DELETE: 'DELETE'
            },
            formatos: {
                JSON: 'application/json',
                XML: 'application/xml',
                FORM: 'application/x-www-form-urlencoded'
            },
            status: {
                ATIVO: 'ativo',
                INATIVO: 'inativo',
                FALHANDO: 'falhando'
            },
            tentativasMaximas: 3,
            timeout: 10000,
            retryDelay: 5000
        };

        // ==================== ESTADO ====================
        let webhooks = [];
        let filaEventos = [];
        let entregas = [];
        let estatisticas = {
            totalWebhooks: 0,
            totalEventos: 0,
            entregasSucesso: 0,
            entregasFalha: 0,
            tempoMedioResposta: 0
        };

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('🔗 Módulo de Webhooks inicializado');
            
            carregarWebhooks();
            carregarEntregas();
            iniciarProcessamentoFila();
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                MODULO_AUDITORIA_AVANCADA.registrarLog(
                    'Módulo de webhooks inicializado',
                    MODULO_AUDITORIA_AVANCADA.categorias?.SISTEMA || 'sistema',
                    MODULO_AUDITORIA_AVANCADA.niveis?.INFO || 'info'
                );
            }
        }

        // ==================== GERENCIAMENTO DE WEBHOOKS ====================
        function registrarWebhook(config) {
            const webhook = {
                id: gerarId(),
                nome: config.nome,
                url: config.url,
                eventos: config.eventos || [],
                metodo: config.metodo || CONFIG.metodos.POST,
                formato: config.formato || CONFIG.formatos.JSON,
                headers: config.headers || {},
                segredo: config.segredo || gerarSegredo(),
                status: CONFIG.status.ATIVO,
                criadoEm: new Date().toISOString(),
                estatisticas: {
                    entregas: 0,
                    sucessos: 0,
                    falhas: 0,
                    ultimaEntrega: null
                }
            };

            webhooks.push(webhook);
            estatisticas.totalWebhooks++;

            salvarWebhooks();

            if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                MODULO_AUDITORIA_AVANCADA.registrarLog(
                    `Webhook registrado: ${webhook.nome}`,
                    MODULO_AUDITORIA_AVANCADA.categorias?.SISTEMA || 'sistema',
                    MODULO_AUDITORIA_AVANCADA.niveis?.INFO || 'info'
                );
            }

            return webhook.id;
        }

        function atualizarWebhook(id, config) {
            const index = webhooks.findIndex(w => w.id === id);
            if (index === -1) return false;

            webhooks[index] = {
                ...webhooks[index],
                ...config,
                atualizadoEm: new Date().toISOString()
            };

            salvarWebhooks();
            return true;
        }

        function removerWebhook(id) {
            webhooks = webhooks.filter(w => w.id !== id);
            estatisticas.totalWebhooks--;
            salvarWebhooks();
            return true;
        }

        function getWebhook(id) {
            return webhooks.find(w => w.id === id);
        }

        function listarWebhooks(filtros = {}) {
            let resultados = [...webhooks];

            if (filtros.status) {
                resultados = resultados.filter(w => w.status === filtros.status);
            }

            if (filtros.evento) {
                resultados = resultados.filter(w => w.eventos.includes(filtros.evento));
            }

            return resultados;
        }

        // ==================== DISPARO DE EVENTOS ====================
        async function dispararEvento(evento, dados) {
            estatisticas.totalEventos++;

            // Buscar webhooks inscritos neste evento
            const webhooksInscritos = webhooks.filter(w => 
                w.status === CONFIG.status.ATIVO && 
                w.eventos.includes(evento)
            );

            if (webhooksInscritos.length === 0) {
                return { disparados: 0, webhooks: [] };
            }

            const promessas = webhooksInscritos.map(webhook => 
                entregarEvento(webhook, evento, dados)
            );

            const resultados = await Promise.all(promessas);

            const sucessos = resultados.filter(r => r.sucesso).length;
            const falhas = resultados.filter(r => !r.sucesso).length;

            return {
                disparados: resultados.length,
                sucessos,
                falhas,
                resultados
            };
        }

        async function entregarEvento(webhook, evento, dados) {
            const inicio = Date.now();
            const entregaId = gerarId();

            const payload = {
                id: entregaId,
                evento,
                timestamp: new Date().toISOString(),
                dados,
                webhook: webhook.id
            };

            // Assinar payload com segredo
            const assinatura = gerarAssinatura(payload, webhook.segredo);

            const headers = {
                'Content-Type': webhook.formato,
                'X-Webhook-ID': webhook.id,
                'X-Evento': evento,
                'X-Assinatura': assinatura,
                'X-Timestamp': Date.now().toString(),
                ...webhook.headers
            };

            let tentativa = 0;
            let sucesso = false;
            let resposta = null;

            while (tentativa < CONFIG.tentativasMaximas && !sucesso) {
                tentativa++;

                try {
                    resposta = await realizarRequisicao(webhook, payload, headers);

                    sucesso = true;

                    // Registrar entrega bem-sucedida
                    registrarEntrega({
                        id: entregaId,
                        webhookId: webhook.id,
                        evento,
                        sucesso: true,
                        tentativa,
                        tempoResposta: Date.now() - inicio,
                        resposta
                    });

                    webhook.estatisticas.entregas++;
                    webhook.estatisticas.sucessos++;
                    webhook.estatisticas.ultimaEntrega = new Date().toISOString();

                    estatisticas.entregasSucesso++;
                    estatisticas.tempoMedioResposta = (estatisticas.tempoMedioResposta + (Date.now() - inicio)) / 2;

                } catch (erro) {
                    console.warn(`Tentativa ${tentativa} falhou para webhook ${webhook.nome}:`, erro.message);

                    if (tentativa < CONFIG.tentativasMaximas) {
                        await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay * tentativa));
                    }
                }
            }

            if (!sucesso) {
                // Registrar falha
                registrarEntrega({
                    id: entregaId,
                    webhookId: webhook.id,
                    evento,
                    sucesso: false,
                    tentativa,
                    erro: resposta?.mensagem || 'Todas as tentativas falharam'
                });

                webhook.estatisticas.entregas++;
                webhook.estatisticas.falhas++;
                webhook.estatisticas.ultimaFalha = new Date().toISOString();

                estatisticas.entregasFalha++;

                // Marcar webhook como falhando se muitas falhas
                if (webhook.estatisticas.falhas > 10) {
                    webhook.status = CONFIG.status.FALHANDO;
                }
            }

            salvarWebhooks();
            salvarEntregas();

            return {
                webhookId: webhook.id,
                webhookNome: webhook.nome,
                sucesso,
                tentativa,
                tempo: Date.now() - inicio
            };
        }

        async function realizarRequisicao(webhook, payload, headers) {
            // Simular requisição HTTP
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const sucesso = Math.random() > 0.2; // 80% de sucesso

                    if (sucesso) {
                        resolve({
                            status: 200,
                            mensagem: 'OK',
                            timestamp: new Date().toISOString()
                        });
                    } else {
                        reject(new Error('Falha na requisição'));
                    }
                }, 500 + Math.random() * 1000);
            });
        }

        // ==================== FILA DE EVENTOS ====================
        function adicionarEventoFila(evento, dados) {
            filaEventos.push({
                id: gerarId(),
                evento,
                dados,
                timestamp: new Date().toISOString(),
                status: 'pendente'
            });

            processarFila();
        }

        async function processarFila() {
            const eventosPendentes = filaEventos.filter(e => e.status === 'pendente');

            for (const evento of eventosPendentes) {
                try {
                    await dispararEvento(evento.evento, evento.dados);
                    evento.status = 'processado';
                } catch (erro) {
                    evento.status = 'erro';
                    evento.erro = erro.message;
                }
            }

            // Limpar eventos antigos
            filaEventos = filaEventos.filter(e => 
                e.status !== 'processado' || 
                (Date.now() - new Date(e.timestamp).getTime() < 24 * 60 * 60 * 1000)
            );
        }

        function iniciarProcessamentoFila() {
            setInterval(processarFila, 60000); // A cada minuto
        }

        // ==================== TESTES ====================
        async function testarWebhook(id) {
            const webhook = getWebhook(id);
            if (!webhook) {
                throw new Error('Webhook não encontrado');
            }

            const payload = {
                teste: true,
                timestamp: new Date().toISOString(),
                mensagem: 'Teste de webhook'
            };

            return entregarEvento(webhook, 'teste.webhook', payload);
        }

        // ==================== LOGS E ENTREGAS ====================
        function registrarEntrega(entrega) {
            entregas.unshift({
                ...entrega,
                timestamp: new Date().toISOString()
            });

            // Manter apenas últimas 1000 entregas
            if (entregas.length > 1000) {
                entregas = entregas.slice(0, 1000);
            }

            salvarEntregas();
        }

        function getEntregas(filtros = {}) {
            let resultados = [...entregas];

            if (filtros.webhookId) {
                resultados = resultados.filter(e => e.webhookId === filtros.webhookId);
            }

            if (filtros.evento) {
                resultados = resultados.filter(e => e.evento === filtros.evento);
            }

            if (filtros.sucesso !== undefined) {
                resultados = resultados.filter(e => e.sucesso === filtros.sucesso);
            }

            if (filtros.dataInicio) {
                resultados = resultados.filter(e => e.timestamp >= filtros.dataInicio);
            }

            if (filtros.dataFim) {
                resultados = resultados.filter(e => e.timestamp <= filtros.dataFim);
            }

            return resultados;
        }

        // ==================== INTERFACE DO USUÁRIO ====================
        function abrirPainelWebhooks() {
            const modalHTML = `
                <div class="webhooks-painel">
                    <div class="webhooks-header">
                        <h3><i class="fas fa-link"></i> Webhooks</h3>
                        <button class="btn btn-success" onclick="MODULO_WEBHOOKS.abrirFormularioWebhook()">
                            <i class="fas fa-plus"></i> Novo Webhook
                        </button>
                    </div>
                    
                    <div class="webhooks-stats">
                        <div class="stat-card">
                            <div class="stat-value">${webhooks.length}</div>
                            <div class="stat-label">Total de Webhooks</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${estatisticas.totalEventos}</div>
                            <div class="stat-label">Eventos Disparados</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${estatisticas.entregasSucesso}</div>
                            <div class="stat-label">Entregas com Sucesso</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${estatisticas.entregasFalha}</div>
                            <div class="stat-label">Entregas com Falha</div>
                        </div>
                    </div>
                    
                    <div class="webhooks-lista">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>URL</th>
                                    <th>Eventos</th>
                                    <th>Status</th>
                                    <th>Estatísticas</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${webhooks.map(w => `
                                    <tr>
                                        <td><strong>${w.nome}</strong></td>
                                        <td><small>${w.url}</small></td>
                                        <td>
                                            ${w.eventos.slice(0, 3).map(e => `
                                                <span class="badge badge-info">${e}</span>
                                            `).join('')}
                                            ${w.eventos.length > 3 ? `<span class="badge">+${w.eventos.length - 3}</span>` : ''}
                                        </td>
                                        <td>
                                            <span class="status-badge ${w.status}">${w.status}</span>
                                        </td>
                                        <td>
                                            <small>
                                                Entregas: ${w.estatisticas.entregas}<br>
                                                Sucessos: ${w.estatisticas.sucessos}<br>
                                                Falhas: ${w.estatisticas.falhas}
                                            </small>
                                        </td>
                                        <td>
                                            <button class="btn-icon" onclick="MODULO_WEBHOOKS.verWebhook('${w.id}')" title="Ver detalhes">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button class="btn-icon" onclick="MODULO_WEBHOOKS.editarWebhook('${w.id}')" title="Editar">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn-icon" onclick="MODULO_WEBHOOKS.testarWebhook('${w.id}')" title="Testar">
                                                <i class="fas fa-flask"></i>
                                            </button>
                                            <button class="btn-icon text-danger" onclick="MODULO_WEBHOOKS.excluirWebhook('${w.id}')" title="Excluir">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="webhooks-eventos">
                        <h4>Eventos Disponíveis</h4>
                        <div class="eventos-grid">
                            ${Object.entries(CONFIG.eventos).map(([key, value]) => `
                                <div class="evento-item">
                                    <code>${value}</code>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

            // Adicionar estilos
            adicionarEstilosWebhooks();

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Webhooks', modalHTML);
            }
        }

        function adicionarEstilosWebhooks() {
            if (document.getElementById('style-webhooks')) return;

            const style = document.createElement('style');
            style.id = 'style-webhooks';
            style.textContent = `
                .webhooks-painel {
                    max-height: 600px;
                    overflow-y: auto;
                }
                
                .webhooks-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .webhooks-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin-bottom: 30px;
                }
                
                .webhooks-stats .stat-card {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 15px;
                    text-align: center;
                }
                
                .webhooks-stats .stat-value {
                    font-size: 1.8rem;
                    font-weight: bold;
                    color: #3498db;
                }
                
                .webhooks-stats .stat-label {
                    color: #7f8c8d;
                    font-size: 0.9rem;
                }
                
                .status-badge.ativo {
                    background: #d4edda;
                    color: #155724;
                }
                
                .status-badge.inativo {
                    background: #f8d7da;
                    color: #721c24;
                }
                
                .status-badge.falhando {
                    background: #fff3cd;
                    color: #856404;
                }
                
                .webhooks-eventos {
                    margin-top: 30px;
                }
                
                .eventos-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 10px;
                    margin-top: 10px;
                }
                
                .evento-item {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                    padding: 5px;
                    text-align: center;
                }
                
                .evento-item code {
                    color: #e74c3c;
                    font-size: 0.85rem;
                }
                
                .webhook-form {
                    max-height: 500px;
                    overflow-y: auto;
                }
                
                .eventos-checkbox {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    max-height: 200px;
                    overflow-y: auto;
                    padding: 10px;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                }
                
                .eventos-checkbox label {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                
                .webhook-detalhes {
                    max-height: 500px;
                    overflow-y: auto;
                }
                
                .info-group {
                    margin-bottom: 20px;
                }
                
                .info-group h4 {
                    margin: 0 0 10px 0;
                    color: #2c3e50;
                }
                
                .info-row {
                    display: flex;
                    padding: 8px 0;
                    border-bottom: 1px solid #f0f0f0;
                }
                
                .info-label {
                    width: 120px;
                    color: #7f8c8d;
                }
                
                .info-value {
                    flex: 1;
                    font-weight: 500;
                }
                
                .entregas-lista {
                    max-height: 300px;
                    overflow-y: auto;
                }
                
                .entrega-item {
                    padding: 10px;
                    border-bottom: 1px solid #dee2e6;
                }
                
                .entrega-item.sucesso {
                    border-left: 4px solid #27ae60;
                }
                
                .entrega-item.falha {
                    border-left: 4px solid #e74c3c;
                }
                
                .entrega-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                
                .entrega-tempo {
                    color: #7f8c8d;
                    font-size: 0.9rem;
                }
                
                .badge-segredo {
                    font-family: monospace;
                    background: #f8f9fa;
                    padding: 2px 5px;
                    border-radius: 3px;
                }
            `;

            document.head.appendChild(style);
        }

        function abrirFormularioWebhook(webhookId = null) {
            const webhook = webhookId ? getWebhook(webhookId) : null;

            const modalHTML = `
                <div class="webhook-form">
                    <h3>${webhook ? 'Editar' : 'Novo'} Webhook</h3>
                    
                    <div class="form-group">
                        <label>Nome *</label>
                        <input type="text" class="form-control" id="webhook-nome" 
                               value="${webhook?.nome || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label>URL *</label>
                        <input type="url" class="form-control" id="webhook-url" 
                               value="${webhook?.url || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Método HTTP</label>
                        <select class="form-control" id="webhook-metodo">
                            <option value="POST" ${webhook?.metodo === 'POST' ? 'selected' : ''}>POST</option>
                            <option value="PUT" ${webhook?.metodo === 'PUT' ? 'selected' : ''}>PUT</option>
                            <option value="GET" ${webhook?.metodo === 'GET' ? 'selected' : ''}>GET</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Formato</label>
                        <select class="form-control" id="webhook-formato">
                            <option value="application/json" ${webhook?.formato === 'application/json' ? 'selected' : ''}>JSON</option>
                            <option value="application/xml" ${webhook?.formato === 'application/xml' ? 'selected' : ''}>XML</option>
                            <option value="application/x-www-form-urlencoded" ${webhook?.formato === 'application/x-www-form-urlencoded' ? 'selected' : ''}>Form</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Eventos</label>
                        <div class="eventos-checkbox">
                            ${Object.entries(CONFIG.eventos).map(([key, value]) => `
                                <label>
                                    <input type="checkbox" value="${value}" 
                                           ${webhook?.eventos.includes(value) ? 'checked' : ''}>
                                    ${key}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Headers Adicionais (um por linha, formato: Chave: Valor)</label>
                        <textarea class="form-control" id="webhook-headers" rows="3">${webhook ? Object.entries(webhook.headers).map(([k, v]) => `${k}: ${v}`).join('\n') : ''}</textarea>
                    </div>
                    
                    ${webhook ? `
                        <div class="form-group">
                            <label>Segredo</label>
                            <div class="input-group">
                                <input type="text" class="form-control" value="${webhook.segredo}" readonly>
                                <button class="btn btn-secondary" onclick="copiarSegredo()">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="SISTEMA.fecharModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="MODULO_WEBHOOKS.salvarWebhook('${webhookId || ''}')">
                            Salvar Webhook
                        </button>
                    </div>
                </div>
            `;

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal(webhook ? 'Editar Webhook' : 'Novo Webhook', modalHTML);
            }
        }

        function salvarWebhook(webhookId) {
            const nome = document.getElementById('webhook-nome')?.value;
            const url = document.getElementById('webhook-url')?.value;
            const metodo = document.getElementById('webhook-metodo')?.value;
            const formato = document.getElementById('webhook-formato')?.value;
            
            const eventos = Array.from(document.querySelectorAll('.eventos-checkbox input:checked'))
                .map(cb => cb.value);

            const headersText = document.getElementById('webhook-headers')?.value;
            const headers = {};

            if (headersText) {
                headersText.split('\n').forEach(linha => {
                    const [chave, ...valores] = linha.split(':');
                    if (chave && valores.length) {
                        headers[chave.trim()] = valores.join(':').trim();
                    }
                });
            }

            if (!nome || !url) {
                alert('Preencha os campos obrigatórios');
                return;
            }

            const config = {
                nome,
                url,
                metodo,
                formato,
                eventos,
                headers
            };

            if (webhookId) {
                atualizarWebhook(webhookId, config);
                if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                    MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                        'Webhook atualizado',
                        nome
                    );
                }
            } else {
                registrarWebhook(config);
                if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                    MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                        'Webhook criado',
                        nome
                    );
                }
            }

            SISTEMA.fecharModal();
        }

        function verWebhook(id) {
            const webhook = getWebhook(id);
            if (!webhook) return;

            const entregasWebhook = getEntregas({ webhookId: id });

            const modalHTML = `
                <div class="webhook-detalhes">
                    <h3>${webhook.nome}</h3>
                    
                    <div class="info-group">
                        <h4>Informações</h4>
                        <div class="info-row">
                            <span class="info-label">URL:</span>
                            <span class="info-value">${webhook.url}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Método:</span>
                            <span class="info-value">${webhook.metodo}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Formato:</span>
                            <span class="info-value">${webhook.formato}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Status:</span>
                            <span class="info-value">
                                <span class="status-badge ${webhook.status}">${webhook.status}</span>
                            </span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Segredo:</span>
                            <span class="info-value badge-segredo">${webhook.segredo}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Criado em:</span>
                            <span class="info-value">${new Date(webhook.criadoEm).toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <div class="info-group">
                        <h4>Eventos Inscritos</h4>
                        <div class="eventos-grid">
                            ${webhook.eventos.map(e => `
                                <div class="evento-item">
                                    <code>${e}</code>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="info-group">
                        <h4>Headers</h4>
                        ${Object.entries(webhook.headers).map(([chave, valor]) => `
                            <div class="info-row">
                                <span class="info-label">${chave}:</span>
                                <span class="info-value">${valor}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="info-group">
                        <h4>Estatísticas</h4>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">Entregas</span>
                                <span class="stat-value">${webhook.estatisticas.entregas}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Sucessos</span>
                                <span class="stat-value text-success">${webhook.estatisticas.sucessos}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Falhas</span>
                                <span class="stat-value text-danger">${webhook.estatisticas.falhas}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-group">
                        <h4>Últimas Entregas</h4>
                        <div class="entregas-lista">
                            ${entregasWebhook.slice(0, 10).map(e => `
                                <div class="entrega-item ${e.sucesso ? 'sucesso' : 'falha'}">
                                    <div class="entrega-header">
                                        <span class="entrega-evento">${e.evento}</span>
                                        <span class="entrega-data">${new Date(e.timestamp).toLocaleString()}</span>
                                    </div>
                                    <div class="entrega-detalhes">
                                        <span>Tentativa: ${e.tentativa}</span>
                                        <span>Tempo: ${e.tempoResposta}ms</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Detalhes do Webhook', modalHTML);
            }
        }

        function editarWebhook(id) {
            abrirFormularioWebhook(id);
        }

        function excluirWebhook(id) {
            if (confirm('Tem certeza que deseja excluir este webhook?')) {
                removerWebhook(id);
                
                if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                    MODULO_NOTIFICACOES.adicionarNotificacaoInfo(
                        'Webhook excluído',
                        'O webhook foi removido com sucesso'
                    );
                }
            }
        }

        // ==================== UTILITÁRIOS ====================
        function gerarId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        function gerarSegredo() {
            return 'whsec_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }

        function gerarAssinatura(payload, segredo) {
            // Simular assinatura HMAC
            const str = JSON.stringify(payload) + segredo;
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash = hash & hash;
            }
            return hash.toString(16);
        }

        function salvarWebhooks() {
            try {
                localStorage.setItem('sme_webhooks', JSON.stringify(webhooks));
            } catch (e) {
                console.error('Erro ao salvar webhooks:', e);
            }
        }

        function carregarWebhooks() {
            try {
                const saved = localStorage.getItem('sme_webhooks');
                if (saved) {
                    webhooks = JSON.parse(saved);
                    estatisticas.totalWebhooks = webhooks.length;
                }
            } catch (e) {
                console.error('Erro ao carregar webhooks:', e);
            }
        }

        function salvarEntregas() {
            try {
                localStorage.setItem('sme_webhook_entregas', JSON.stringify(entregas));
            } catch (e) {
                console.error('Erro ao salvar entregas:', e);
            }
        }

        function carregarEntregas() {
            try {
                const saved = localStorage.getItem('sme_webhook_entregas');
                if (saved) {
                    entregas = JSON.parse(saved);
                    
                    // Atualizar estatísticas
                    entregas.forEach(e => {
                        if (e.sucesso) {
                            estatisticas.entregasSucesso++;
                        } else {
                            estatisticas.entregasFalha++;
                        }
                    });
                }
            } catch (e) {
                console.error('Erro ao carregar entregas:', e);
            }
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            registrarWebhook,
            atualizarWebhook,
            removerWebhook,
            getWebhook,
            listarWebhooks,
            dispararEvento,
            testarWebhook,
            getEntregas,
            abrirPainelWebhooks,
            abrirFormularioWebhook,
            salvarWebhook,
            verWebhook,
            editarWebhook,
            excluirWebhook,
            eventos: CONFIG.eventos
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_WEBHOOKS.init();
        }, 9500);
    });

    window.MODULO_WEBHOOKS = MODULO_WEBHOOKS;
    console.log('✅ Módulo de Webhooks carregado');
}
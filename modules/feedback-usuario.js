// modulos/feedback-usuario.js - Sistema de Feedback do Usuário
// Sistema de Gestão Educacional Municipal - FASE 7

if (typeof MODULO_FEEDBACK_USUARIO === 'undefined') {
    const MODULO_FEEDBACK_USUARIO = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            versao: '1.0.0',
            tipos: {
                SUGESTAO: 'sugestao',
                BUG: 'bug',
                DUVIDA: 'duvida',
                ELOGIO: 'elogio',
                CRITICA: 'critica',
                MELHORIA: 'melhoria'
            },
            prioridades: {
                BAIXA: 1,
                MEDIA: 2,
                ALTA: 3,
                URGENTE: 4
            },
            status: {
                PENDENTE: 'pendente',
                EM_ANALISE: 'em_analise',
                EM_ANDAMENTO: 'em_andamento',
                RESOLVIDO: 'resolvido',
                REJEITADO: 'rejeitado'
            },
            avaliacoes: {
                PESSIMO: 1,
                RUIM: 2,
                REGULAR: 3,
                BOM: 4,
                OTIMO: 5
            },
            maxCaracteres: 2000,
            permitirAnexos: true,
            anexosMax: 5,
            anexosTamanhoMax: 5 * 1024 * 1024 // 5MB
        };

        // ==================== ESTADO ====================
        let feedbacks = [];
        let estatisticas = {
            total: 0,
            porTipo: {},
            porStatus: {},
            porPrioridade: {},
            resolvidos: 0,
            tempoMedioResolucao: 0
        };
        let notificacoes = [];

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('💬 Módulo de Feedback do Usuário inicializado');
            
            carregarFeedbacks();
            carregarEstatisticas();
            adicionarBotaoFeedback();
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                MODULO_AUDITORIA_AVANCADA.registrarLog(
                    'Módulo de feedback do usuário inicializado',
                    MODULO_AUDITORIA_AVANCADA.categorias?.SISTEMA || 'sistema',
                    MODULO_AUDITORIA_AVANCADA.niveis?.INFO || 'info'
                );
            }
        }

        // ==================== FUNÇÕES PRINCIPAIS ====================
        function enviarFeedback(dados) {
            const usuario = obterUsuarioAtual();
            
            const feedback = {
                id: gerarId(),
                timestamp: new Date().toISOString(),
                usuario: usuario ? {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    perfil: usuario.perfil
                } : null,
                tipo: dados.tipo || CONFIG.tipos.SUGESTAO,
                titulo: dados.titulo,
                descricao: dados.descricao,
                prioridade: dados.prioridade || CONFIG.prioridades.MEDIA,
                status: CONFIG.status.PENDENTE,
                anexos: dados.anexos || [],
                avaliacao: null,
                resposta: null,
                historico: [{
                    data: new Date().toISOString(),
                    acao: 'criado',
                    usuario: usuario?.nome || 'Anônimo'
                }]
            };

            feedbacks.unshift(feedback);
            
            atualizarEstatisticas();
            salvarFeedbacks();
            notificarNovoFeedback(feedback);

            return feedback.id;
        }

        function responderFeedback(feedbackId, resposta) {
            const feedback = feedbacks.find(f => f.id === feedbackId);
            if (!feedback) return false;

            feedback.resposta = {
                texto: resposta,
                data: new Date().toISOString(),
                usuario: obterUsuarioAtual()?.nome
            };

            feedback.status = CONFIG.status.RESOLVIDO;
            feedback.historico.push({
                data: new Date().toISOString(),
                acao: 'respondido',
                usuario: obterUsuarioAtual()?.nome
            });

            atualizarEstatisticas();
            salvarFeedbacks();
            notificarResposta(feedback);

            return true;
        }

        function avaliarFeedback(feedbackId, avaliacao, comentario = '') {
            const feedback = feedbacks.find(f => f.id === feedbackId);
            if (!feedback) return false;

            feedback.avaliacao = {
                nota: avaliacao,
                comentario: comentario,
                data: new Date().toISOString()
            };

            feedback.historico.push({
                data: new Date().toISOString(),
                acao: 'avaliado',
                usuario: obterUsuarioAtual()?.nome
            });

            salvarFeedbacks();
            atualizarEstatisticasAvaliacao();

            return true;
        }

        function atualizarStatus(feedbackId, status, observacao = '') {
            const feedback = feedbacks.find(f => f.id === feedbackId);
            if (!feedback) return false;

            feedback.status = status;
            feedback.historico.push({
                data: new Date().toISOString(),
                acao: `status_alterado: ${status}`,
                usuario: obterUsuarioAtual()?.nome,
                observacao
            });

            salvarFeedbacks();
            atualizarEstatisticas();

            return true;
        }

        // ==================== CONSULTAS ====================
        function listarFeedbacks(filtros = {}) {
            let resultados = [...feedbacks];

            if (filtros.tipo) {
                resultados = resultados.filter(f => f.tipo === filtros.tipo);
            }

            if (filtros.status) {
                resultados = resultados.filter(f => f.status === filtros.status);
            }

            if (filtros.prioridade) {
                resultados = resultados.filter(f => f.prioridade >= filtros.prioridade);
            }

            if (filtros.usuarioId) {
                resultados = resultados.filter(f => f.usuario?.id === filtros.usuarioId);
            }

            if (filtros.dataInicio) {
                resultados = resultados.filter(f => f.timestamp >= filtros.dataInicio);
            }

            if (filtros.dataFim) {
                resultados = resultados.filter(f => f.timestamp <= filtros.dataFim);
            }

            if (filtros.busca) {
                const termo = filtros.busca.toLowerCase();
                resultados = resultados.filter(f => 
                    f.titulo.toLowerCase().includes(termo) ||
                    f.descricao.toLowerCase().includes(termo)
                );
            }

            // Ordenar por data (mais recentes primeiro)
            resultados.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            return resultados;
        }

        function getEstatisticasDetalhadas() {
            const agora = Date.now();
            
            return {
                ...estatisticas,
                taxaResolucao: estatisticas.total > 0 
                    ? (estatisticas.resolvidos / estatisticas.total * 100).toFixed(1) + '%'
                    : '0%',
                satisfacao: calcularSatisfacao(),
                tendencias: analisarTendencias(),
                palavrasChave: extrairPalavrasChave()
            };
        }

        function calcularSatisfacao() {
            const avaliados = feedbacks.filter(f => f.avaliacao);
            if (avaliados.length === 0) return 0;

            const soma = avaliados.reduce((acc, f) => acc + f.avaliacao.nota, 0);
            return (soma / avaliados.length).toFixed(1);
        }

        function analisarTendencias() {
            const ultimos30Dias = feedbacks.filter(f => {
                const data = new Date(f.timestamp);
                const diff = Date.now() - data;
                return diff <= 30 * 24 * 60 * 60 * 1000;
            });

            return {
                total: ultimos30Dias.length,
                porTipo: Object.values(CONFIG.tipos).reduce((acc, tipo) => {
                    acc[tipo] = ultimos30Dias.filter(f => f.tipo === tipo).length;
                    return acc;
                }, {}),
                tempoMedioResposta: calcularTempoMedioResposta(ultimos30Dias)
            };
        }

        function calcularTempoMedioResposta(feedbacks) {
            const comResposta = feedbacks.filter(f => f.resposta);
            if (comResposta.length === 0) return 0;

            const soma = comResposta.reduce((acc, f) => {
                const criacao = new Date(f.timestamp);
                const resposta = new Date(f.resposta.data);
                return acc + (resposta - criacao);
            }, 0);

            return Math.round(soma / comResposta.length / (1000 * 60 * 60)); // em horas
        }

        function extrairPalavrasChave() {
            const palavras = {};
            const stopWords = ['de', 'da', 'do', 'em', 'para', 'com', 'uma', 'um', 'os', 'as'];
            
            feedbacks.forEach(f => {
                const texto = `${f.titulo} ${f.descricao}`.toLowerCase();
                const tokens = texto.split(/\W+/);
                
                tokens.forEach(token => {
                    if (token.length > 3 && !stopWords.includes(token)) {
                        palavras[token] = (palavras[token] || 0) + 1;
                    }
                });
            });

            return Object.entries(palavras)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([palavra, contagem]) => ({ palavra, contagem }));
        }

        // ==================== INTERFACE DO USUÁRIO ====================
        function adicionarBotaoFeedback() {
            const botao = document.createElement('button');
            botao.id = 'feedback-botao';
            botao.className = 'feedback-botao-flutuante';
            botao.innerHTML = `
                <i class="fas fa-comment"></i>
                <span>Feedback</span>
            `;

            botao.addEventListener('click', () => {
                abrirModalFeedback();
            });

            document.body.appendChild(botao);

            // Adicionar estilos
            adicionarEstilosFeedback();
        }

        function adicionarEstilosFeedback() {
            if (document.getElementById('style-feedback')) return;

            const style = document.createElement('style');
            style.id = 'style-feedback';
            style.textContent = `
                .feedback-botao-flutuante {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #9b59b6;
                    color: white;
                    border: none;
                    border-radius: 50px;
                    padding: 12px 24px;
                    cursor: pointer;
                    box-shadow: 0 5px 20px rgba(155, 89, 182, 0.3);
                    z-index: 9997;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 1rem;
                    transition: all 0.3s;
                }
                
                .feedback-botao-flutuante:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(155, 89, 182, 0.4);
                }
                
                .feedback-modal {
                    max-height: 600px;
                    overflow-y: auto;
                }
                
                .feedback-tipos {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin: 15px 0;
                }
                
                .tipo-btn {
                    padding: 10px;
                    border: 2px solid #dee2e6;
                    border-radius: 8px;
                    background: none;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                }
                
                .tipo-btn i {
                    font-size: 1.2rem;
                }
                
                .tipo-btn.selecionado {
                    border-color: #9b59b6;
                    background: #f3e5f5;
                }
                
                .tipo-btn.sugestao i { color: #3498db; }
                .tipo-btn.bug i { color: #e74c3c; }
                .tipo-btn.duvida i { color: #f39c12; }
                .tipo-btn.elogio i { color: #27ae60; }
                .tipo-btn.critica i { color: #e67e22; }
                .tipo-btn.melhoria i { color: #9b59b6; }
                
                .feedback-anexos {
                    border: 2px dashed #dee2e6;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin: 15px 0;
                }
                
                .feedback-anexos:hover {
                    border-color: #9b59b6;
                    background: #f8f9fa;
                }
                
                .feedback-anexos i {
                    font-size: 2rem;
                    color: #9b59b6;
                    margin-bottom: 10px;
                }
                
                .anexos-lista {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin: 10px 0;
                }
                
                .anexo-item {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                    padding: 5px 10px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                
                .anexo-item i {
                    color: #9b59b6;
                }
                
                .anexo-item button {
                    background: none;
                    border: none;
                    color: #e74c3c;
                    cursor: pointer;
                }
                
                .feedback-lista {
                    max-height: 400px;
                    overflow-y: auto;
                }
                
                .feedback-card {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 10px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .feedback-card:hover {
                    transform: translateX(5px);
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                
                .feedback-card.pendente { border-left: 4px solid #f39c12; }
                .feedback-card.em_analise { border-left: 4px solid #3498db; }
                .feedback-card.em_andamento { border-left: 4px solid #9b59b6; }
                .feedback-card.resolvido { border-left: 4px solid #27ae60; }
                .feedback-card.rejeitado { border-left: 4px solid #e74c3c; }
                
                .feedback-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .feedback-tipo-badge {
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 500;
                }
                
                .feedback-tipo-badge.sugestao { background: #e8f4fd; color: #3498db; }
                .feedback-tipo-badge.bug { background: #fdeded; color: #e74c3c; }
                .feedback-tipo-badge.duvida { background: #feeddb; color: #f39c12; }
                .feedback-tipo-badge.elogio { background: #e1f7e8; color: #27ae60; }
                .feedback-tipo-badge.critica { background: #fee4e2; color: #e67e22; }
                .feedback-tipo-badge.melhoria { background: #f3e5f5; color: #9b59b6; }
                
                .feedback-prioridade {
                    display: inline-flex;
                    align-items: center;
                    gap: 2px;
                }
                
                .prioridade-1 i { color: #27ae60; }
                .prioridade-2 i { color: #f39c12; }
                .prioridade-3 i { color: #e67e22; }
                .prioridade-4 i { color: #e74c3c; }
                
                .feedback-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin: 20px 0;
                }
                
                .feedback-stats .stat-card {
                    padding: 15px;
                    text-align: center;
                }
                
                .feedback-stats .stat-value {
                    font-size: 2rem;
                    font-weight: bold;
                    color: #9b59b6;
                }
                
                .feedback-stats .stat-label {
                    color: #7f8c8d;
                    font-size: 0.9rem;
                }
            `;

            document.head.appendChild(style);
        }

        function abrirModalFeedback() {
            const usuario = obterUsuarioAtual();
            const tipos = Object.entries(CONFIG.tipos);

            const modalHTML = `
                <div class="feedback-modal">
                    <h3><i class="fas fa-comment"></i> Enviar Feedback</h3>
                    
                    <div class="feedback-tipos">
                        ${tipos.map(([chave, valor]) => `
                            <button class="tipo-btn ${valor}" onclick="selecionarTipo('${valor}')">
                                <i class="fas ${getIconeTipo(valor)}"></i>
                                <span>${chave}</span>
                            </button>
                        `).join('')}
                    </div>
                    
                    <input type="hidden" id="feedback-tipo" value="">
                    
                    <div class="form-group">
                        <label>Título</label>
                        <input type="text" class="form-control" id="feedback-titulo" maxlength="100">
                    </div>
                    
                    <div class="form-group">
                        <label>Descrição</label>
                        <textarea class="form-control" id="feedback-descricao" rows="5" 
                                  maxlength="${CONFIG.maxCaracteres}"></textarea>
                        <small class="text-muted" id="caracteres-restantes">${CONFIG.maxCaracteres} caracteres restantes</small>
                    </div>
                    
                    <div class="form-group">
                        <label>Prioridade</label>
                        <select class="form-control" id="feedback-prioridade">
                            <option value="1">Baixa</option>
                            <option value="2" selected>Média</option>
                            <option value="3">Alta</option>
                            <option value="4">Urgente</option>
                        </select>
                    </div>
                    
                    ${CONFIG.permitirAnexos ? `
                        <div class="feedback-anexos" onclick="adicionarAnexo()">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Clique para adicionar anexos (máx. ${CONFIG.anexosMax})</p>
                            <p class="text-muted">Formatos: imagem, PDF, DOC</p>
                        </div>
                        
                        <div class="anexos-lista" id="anexos-lista"></div>
                    ` : ''}
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="SISTEMA.fecharModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="MODULO_FEEDBACK_USUARIO.enviarFeedback()">
                            <i class="fas fa-paper-plane"></i> Enviar
                        </button>
                    </div>
                    
                    <hr>
                    
                    <h4>Seus Feedbacks</h4>
                    <div class="feedback-lista">
                        ${listarFeedbacksUsuario(usuario?.id).map(f => `
                            <div class="feedback-card ${f.status}" onclick="verFeedback('${f.id}')">
                                <div class="feedback-header">
                                    <span class="feedback-tipo-badge ${f.tipo}">${f.tipo}</span>
                                    <span class="feedback-prioridade prioridade-${f.prioridade}">
                                        ${Array(f.prioridade).fill('<i class="fas fa-flag"></i>').join('')}
                                    </span>
                                </div>
                                <h5>${f.titulo}</h5>
                                <p class="text-muted">${new Date(f.timestamp).toLocaleDateString()}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Feedback', modalHTML);
            }

            // Configurar contador de caracteres
            document.getElementById('feedback-descricao')?.addEventListener('input', function() {
                const restantes = CONFIG.maxCaracteres - this.value.length;
                document.getElementById('caracteres-restantes').textContent = 
                    `${restantes} caracteres restantes`;
            });
        }

        function selecionarTipo(tipo) {
            document.querySelectorAll('.tipo-btn').forEach(btn => {
                btn.classList.remove('selecionado');
            });
            event.target.closest('.tipo-btn').classList.add('selecionado');
            document.getElementById('feedback-tipo').value = tipo;
        }

        function adicionarAnexo() {
            if (document.querySelectorAll('.anexo-item').length >= CONFIG.anexosMax) {
                alert(`Máximo de ${CONFIG.anexosMax} anexos atingido`);
                return;
            }

            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*,.pdf,.doc,.docx';
            input.multiple = false;

            input.onchange = function() {
                const file = this.files[0];
                if (file.size > CONFIG.anexosTamanhoMax) {
                    alert('Arquivo muito grande. Tamanho máximo: 5MB');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    const anexo = {
                        nome: file.name,
                        tipo: file.type,
                        tamanho: file.size,
                        dados: e.target.result
                    };

                    adicionarAnexoNaLista(anexo);
                };
                reader.readAsDataURL(file);
            };

            input.click();
        }

        function adicionarAnexoNaLista(anexo) {
            const lista = document.getElementById('anexos-lista');
            const div = document.createElement('div');
            div.className = 'anexo-item';
            div.innerHTML = `
                <i class="fas ${getIconeArquivo(anexo.tipo)}"></i>
                <span>${anexo.nome}</span>
                <button onclick="removerAnexo(this)">
                    <i class="fas fa-times"></i>
                </button>
            `;
            div.dataset.anexo = JSON.stringify(anexo);
            lista.appendChild(div);
        }

        function removerAnexo(botao) {
            botao.closest('.anexo-item').remove();
        }

        function getIconeTipo(tipo) {
            const icones = {
                sugestao: 'fa-lightbulb',
                bug: 'fa-bug',
                duvida: 'fa-question-circle',
                elogio: 'fa-star',
                critica: 'fa-exclamation-triangle',
                melhoria: 'fa-chart-line'
            };
            return icones[tipo] || 'fa-comment';
        }

        function getIconeArquivo(tipo) {
            if (tipo.startsWith('image/')) return 'fa-file-image';
            if (tipo.includes('pdf')) return 'fa-file-pdf';
            if (tipo.includes('word')) return 'fa-file-word';
            return 'fa-file';
        }

        function listarFeedbacksUsuario(usuarioId) {
            return feedbacks.filter(f => f.usuario?.id === usuarioId).slice(0, 5);
        }

        // ==================== NOTIFICAÇÕES ====================
        function notificarNovoFeedback(feedback) {
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoInfo(
                    'Novo Feedback',
                    `${feedback.usuario?.nome || 'Anônimo'} enviou: ${feedback.titulo}`,
                    {
                        prioridade: feedback.prioridade >= 3 ? 2 : 1,
                        acao: () => verFeedback(feedback.id)
                    }
                );
            }
        }

        function notificarResposta(feedback) {
            if (typeof MODULO_NOTIFICACOES !== 'undefined' && feedback.usuario) {
                MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                    'Feedback Respondido',
                    `Seu feedback "${feedback.titulo}" foi respondido`,
                    {
                        acao: () => verFeedback(feedback.id)
                    }
                );
            }
        }

        function verFeedback(feedbackId) {
            const feedback = feedbacks.find(f => f.id === feedbackId);
            if (!feedback) return;

            const modalHTML = `
                <div class="feedback-detalhes">
                    <h4>${feedback.titulo}</h4>
                    
                    <div class="feedback-meta">
                        <span class="feedback-tipo-badge ${feedback.tipo}">${feedback.tipo}</span>
                        <span class="feedback-status ${feedback.status}">${feedback.status}</span>
                        <span class="feedback-prioridade prioridade-${feedback.prioridade}">
                            ${Array(feedback.prioridade).fill('<i class="fas fa-flag"></i>').join('')}
                        </span>
                    </div>
                    
                    <p><strong>Data:</strong> ${new Date(feedback.timestamp).toLocaleString()}</p>
                    <p><strong>Usuário:</strong> ${feedback.usuario?.nome || 'Anônimo'}</p>
                    
                    <div class="feedback-descricao">
                        <h5>Descrição:</h5>
                        <p>${feedback.descricao}</p>
                    </div>
                    
                    ${feedback.anexos?.length > 0 ? `
                        <div class="feedback-anexos">
                            <h5>Anexos:</h5>
                            <div class="anexos-lista">
                                ${feedback.anexos.map(a => `
                                    <div class="anexo-item">
                                        <i class="fas ${getIconeArquivo(a.tipo)}"></i>
                                        <span>${a.nome}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${feedback.resposta ? `
                        <div class="feedback-resposta">
                            <h5>Resposta:</h5>
                            <div class="resposta-box">
                                <p>${feedback.resposta.texto}</p>
                                <small>${new Date(feedback.resposta.data).toLocaleString()} - ${feedback.resposta.usuario}</small>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${feedback.avaliacao ? `
                        <div class="feedback-avaliacao">
                            <h5>Sua avaliação:</h5>
                            <div class="avaliacao">
                                ${Array(feedback.avaliacao.nota).fill('<i class="fas fa-star text-warning"></i>').join('')}
                                ${feedback.avaliacao.comentario ? `<p>${feedback.avaliacao.comentario}</p>` : ''}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${!feedback.avaliacao && feedback.status === CONFIG.status.RESOLVIDO ? `
                        <div class="feedback-avaliar">
                            <h5>Avalie esta resposta:</h5>
                            <div class="estrelas-avaliacao">
                                ${[1,2,3,4,5].map(n => `
                                    <i class="far fa-star" onclick="avaliarFeedback('${feedback.id}', ${n})"></i>
                                `).join('')}
                            </div>
                            <textarea class="form-control mt-10" placeholder="Comentário (opcional)" id="avaliacao-comentario"></textarea>
                            <button class="btn btn-primary mt-10" onclick="enviarAvaliacao('${feedback.id}')">
                                Enviar Avaliação
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Detalhes do Feedback', modalHTML);
            }
        }

        // ==================== UTILITÁRIOS ====================
        function gerarId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        function obterUsuarioAtual() {
            if (typeof SISTEMA !== 'undefined') {
                return SISTEMA.getEstado().usuario;
            }
            return null;
        }

        function atualizarEstatisticas() {
            estatisticas.total = feedbacks.length;
            
            estatisticas.porTipo = Object.values(CONFIG.tipos).reduce((acc, tipo) => {
                acc[tipo] = feedbacks.filter(f => f.tipo === tipo).length;
                return acc;
            }, {});
            
            estatisticas.porStatus = Object.values(CONFIG.status).reduce((acc, status) => {
                acc[status] = feedbacks.filter(f => f.status === status).length;
                return acc;
            }, {});
            
            estatisticas.porPrioridade = Object.values(CONFIG.prioridades).reduce((acc, prioridade) => {
                acc[prioridade] = feedbacks.filter(f => f.prioridade === prioridade).length;
                return acc;
            }, {});
            
            estatisticas.resolvidos = feedbacks.filter(f => f.status === CONFIG.status.RESOLVIDO).length;
        }

        function atualizarEstatisticasAvaliacao() {
            // Atualizar estatísticas de avaliação
        }

        function salvarFeedbacks() {
            try {
                localStorage.setItem('sme_feedbacks', JSON.stringify(feedbacks));
            } catch (e) {
                console.error('Erro ao salvar feedbacks:', e);
            }
        }

        function carregarFeedbacks() {
            try {
                const saved = localStorage.getItem('sme_feedbacks');
                if (saved) {
                    feedbacks = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar feedbacks:', e);
            }
        }

        function carregarEstatisticas() {
            atualizarEstatisticas();
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            enviarFeedback,
            responderFeedback,
            avaliarFeedback,
            atualizarStatus,
            listarFeedbacks,
            getEstatisticasDetalhadas,
            abrirModalFeedback,
            verFeedback,
            tipos: CONFIG.tipos,
            prioridades: CONFIG.prioridades,
            status: CONFIG.status
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_FEEDBACK_USUARIO.init();
        }, 6500);
    });

    window.MODULO_FEEDBACK_USUARIO = MODULO_FEEDBACK_USUARIO;
    console.log('✅ Módulo de Feedback do Usuário carregado');
}
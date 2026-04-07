// modulos/sincronizacao.js - Sincronização em Tempo Real
// Sistema de Gestão Educacional Municipal - FASE 5

if (typeof MODULO_SINCRONIZACAO === 'undefined') {
    const MODULO_SINCRONIZACAO = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            versao: '1.0.0',
            syncInterval: 30000, // 30 segundos
            realtimeInterval: 5000, // 5 segundos para dados críticos
            maxRetries: 3,
            retryDelay: 5000, // 5 segundos
            batchSize: 50,
            conflictResolution: 'server-wins', // 'server-wins', 'client-wins', 'manual'
            endpoints: {
                alunos: '/api/sync/alunos',
                professores: '/api/sync/professores',
                turmas: '/api/sync/turmas',
                notas: '/api/sync/notas',
                frequencia: '/api/sync/frequencia'
            }
        };

        // ==================== ESTADO ====================
        let syncState = {
            ultimaSincronizacao: null,
            sincronizando: false,
            pendentes: {},
            conflitos: [],
            estatisticas: {
                totalSincronizado: 0,
                totalErros: 0,
                totalConflitos: 0,
                tempoMedio: 0
            }
        };

        let timers = {
            normal: null,
            realtime: null
        };

        let listeners = [];
        let filaPrioridade = {
            alta: [],   // dados críticos (notas, frequência)
            media: [],   // dados importantes (alunos, professores)
            baixa: []    // dados não críticos (logs, estatísticas)
        };

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('🔄 Módulo de Sincronização em Tempo Real inicializado');
            
            carregarEstado();
            iniciarSincronizacaoPeriodica();
            configurarListeners();
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    'Módulo de sincronização inicializado',
                    MODULO_AUDITORIA.categorias?.SISTEMA || 'sistema',
                    MODULO_AUDITORIA.niveis?.INFO || 'info'
                );
            }
        }

        // ==================== GERENCIAMENTO DE FILA ====================
        function adicionarParaSincronizar(dados, prioridade = 'media') {
            const item = {
                id: gerarId(),
                dados,
                prioridade,
                timestamp: Date.now(),
                tentativas: 0,
                status: 'pendente'
            };

            filaPrioridade[prioridade].push(item);
            
            // Disparar sincronização imediata para prioridade alta
            if (prioridade === 'alta' && navigator.onLine) {
                sincronizarAgora();
            }

            atualizarEstadoPendente();
            salvarEstado();

            return item.id;
        }

        function adicionarLoteParaSincronizar(itens, prioridade = 'media') {
            const lote = itens.map(item => ({
                id: gerarId(),
                dados: item,
                prioridade,
                timestamp: Date.now(),
                tentativas: 0,
                status: 'pendente'
            }));

            filaPrioridade[prioridade].push(...lote);
            
            if (prioridade === 'alta' && navigator.onLine) {
                sincronizarAgora();
            }

            atualizarEstadoPendente();
            salvarEstado();

            return lote.map(item => item.id);
        }

        // ==================== SINCRONIZAÇÃO ====================
        async function sincronizarAgora() {
            if (syncState.sincronizando) {
                console.log('⚠️ Sincronização já em andamento');
                return;
            }

            if (!navigator.onLine) {
                console.log('📴 Offline - sincronização adiada');
                return;
            }

            syncState.sincronizando = true;
            notificarListeners('syncStart');

            const inicio = Date.now();
            let totalProcessados = 0;
            let totalErros = 0;

            try {
                // Processar por prioridade
                for (const prioridade of ['alta', 'media', 'baixa']) {
                    const itens = filaPrioridade[prioridade].filter(i => i.status === 'pendente');
                    
                    if (itens.length === 0) continue;

                    // Processar em lotes
                    for (let i = 0; i < itens.length; i += CONFIG.batchSize) {
                        const lote = itens.slice(i, i + CONFIG.batchSize);
                        const resultado = await sincronizarLote(lote, prioridade);
                        
                        totalProcessados += resultado.processados;
                        totalErros += resultado.erros;

                        // Atualizar status dos itens
                        lote.forEach(item => {
                            const itemLote = filaPrioridade[prioridade].find(p => p.id === item.id);
                            if (itemLote) {
                                if (resultado.sucessos.includes(item.id)) {
                                    itemLote.status = 'sincronizado';
                                    filaPrioridade[prioridade] = filaPrioridade[prioridade].filter(p => p.id !== item.id);
                                } else if (resultado.erros.includes(item.id)) {
                                    itemLote.tentativas++;
                                    if (itemLote.tentativas >= CONFIG.maxRetries) {
                                        itemLote.status = 'falhou';
                                    }
                                }
                            }
                        });
                    }
                }

                syncState.ultimaSincronizacao = Date.now();
                syncState.estatisticas.totalSincronizado += totalProcessados;
                syncState.estatisticas.totalErros += totalErros;
                syncState.estatisticas.tempoMedio = (syncState.estatisticas.tempoMedio + (Date.now() - inicio)) / 2;

                notificarListeners('syncComplete', {
                    processados: totalProcessados,
                    erros: totalErros,
                    tempo: Date.now() - inicio
                });

            } catch (erro) {
                console.error('Erro na sincronização:', erro);
                syncState.estatisticas.totalErros++;
                
                notificarListeners('syncError', {
                    erro: erro.message
                });
            } finally {
                syncState.sincronizando = false;
                salvarEstado();
                atualizarEstadoPendente();
            }
        }

        async function sincronizarLote(lote, prioridade) {
            return new Promise(async (resolve) => {
                try {
                    // Simular envio para servidor
                    const resposta = await enviarParaServidor(lote, prioridade);
                    
                    const sucessos = [];
                    const erros = [];

                    if (resposta.sucesso) {
                        resposta.resultados.forEach((resultado, index) => {
                            if (resultado.sucesso) {
                                sucessos.push(lote[index].id);
                            } else {
                                erros.push(lote[index].id);
                                
                                if (resultado.conflito) {
                                    tratarConflito(lote[index], resultado);
                                }
                            }
                        });
                    }

                    resolve({
                        processados: lote.length,
                        sucessos,
                        erros
                    });

                } catch (erro) {
                    console.error('Erro no lote:', erro);
                    resolve({
                        processados: 0,
                        sucessos: [],
                        erros: lote.map(i => i.id)
                    });
                }
            });
        }

        // ==================== COMUNICAÇÃO COM SERVIDOR ====================
        async function enviarParaServidor(lote, prioridade) {
            // Simular envio para API
            return new Promise((resolve) => {
                setTimeout(() => {
                    const resultados = lote.map(item => ({
                        sucesso: Math.random() > 0.1, // 90% de sucesso
                        conflito: Math.random() > 0.95, // 5% de conflito
                        mensagem: 'Processado com sucesso'
                    }));

                    resolve({
                        sucesso: true,
                        resultados,
                        timestamp: Date.now()
                    });
                }, 1000);
            });
        }

        // ==================== TRATAMENTO DE CONFLITOS ====================
        function tratarConflito(item, resultado) {
            const conflito = {
                id: gerarId(),
                item,
                resultado,
                timestamp: Date.now(),
                resolucao: CONFIG.conflictResolution,
                status: 'pendente'
            };

            syncState.conflitos.push(conflito);
            
            switch(CONFIG.conflictResolution) {
                case 'server-wins':
                    resolverConflitoServerWins(conflito);
                    break;
                case 'client-wins':
                    resolverConflitoClientWins(conflito);
                    break;
                case 'manual':
                    notificarConflitoManual(conflito);
                    break;
            }

            syncState.estatisticas.totalConflitos++;
        }

        function resolverConflitoServerWins(conflito) {
            // Aceitar versão do servidor
            conflito.status = 'resolvido';
            conflito.resolucao = 'server-wins';
            
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoInfo(
                    'Conflito Resolvido',
                    'Versão do servidor foi mantida'
                );
            }
        }

        function resolverConflitoClientWins(conflito) {
            // Reenviar versão do cliente
            conflito.status = 'resolvido';
            conflito.resolucao = 'client-wins';
            
            adicionarParaSincronizar(conflito.item.dados, conflito.item.prioridade);
            
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoInfo(
                    'Conflito Resolvido',
                    'Sua versão será reenviada'
                );
            }
        }

        function notificarConflitoManual(conflito) {
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoAviso(
                    'Conflito Detectado',
                    'Resolução manual necessária',
                    {
                        acao: () => abrirModalConflito(conflito),
                        prioridade: 2
                    }
                );
            }
        }

        // ==================== SINCRONIZAÇÃO EM TEMPO REAL ====================
        function iniciarSincronizacaoPeriodica() {
            // Sincronização normal
            timers.normal = setInterval(() => {
                if (navigator.onLine && temPendentes()) {
                    sincronizarAgora();
                }
            }, CONFIG.syncInterval);

            // Sincronização em tempo real (dados críticos)
            timers.realtime = setInterval(() => {
                if (navigator.onLine && filaPrioridade.alta.length > 0) {
                    sincronizarAgora();
                }
            }, CONFIG.realtimeInterval);
        }

        function pararSincronizacaoPeriodica() {
            if (timers.normal) clearInterval(timers.normal);
            if (timers.realtime) clearInterval(timers.realtime);
        }

        // ==================== CONFLITOS MANUAIS ====================
        function abrirModalConflito(conflito) {
            const modalHTML = `
                <div class="conflito-modal">
                    <h3>Resolução de Conflito</h3>
                    
                    <div class="conflito-detalhes">
                        <h4>Detalhes do Conflito</h4>
                        <p><strong>Tipo:</strong> ${conflito.item.tipo}</p>
                        <p><strong>Data:</strong> ${new Date(conflito.timestamp).toLocaleString()}</p>
                    </div>
                    
                    <div class="conflito-opcoes">
                        <h4>Escolha uma opção:</h4>
                        
                        <div class="opcao-card" onclick="resolverConflito(${conflito.id}, 'server')">
                            <i class="fas fa-server"></i>
                            <div>
                                <strong>Manter versão do servidor</strong>
                                <p>Os dados do servidor sobrescreverão suas alterações</p>
                            </div>
                        </div>
                        
                        <div class="opcao-card" onclick="resolverConflito(${conflito.id}, 'client')">
                            <i class="fas fa-user"></i>
                            <div>
                                <strong>Manter minha versão</strong>
                                <p>Suas alterações serão reenviadas ao servidor</p>
                            </div>
                        </div>
                        
                        <div class="opcao-card" onclick="resolverConflito(${conflito.id}, 'merge')">
                            <i class="fas fa-code-branch"></i>
                            <div>
                                <strong>Mesclar alterações</strong>
                                <p>Tentar mesclar manualmente as alterações</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Resolução de Conflito', modalHTML);
            }
        }

        function resolverConflito(conflitoId, resolucao) {
            const conflito = syncState.conflitos.find(c => c.id === conflitoId);
            if (!conflito) return;

            switch(resolucao) {
                case 'server':
                    resolverConflitoServerWins(conflito);
                    break;
                case 'client':
                    resolverConflitoClientWins(conflito);
                    break;
                case 'merge':
                    // Abrir editor de merge
                    abrirEditorMerge(conflito);
                    break;
            }

            // Remover da lista de conflitos
            syncState.conflitos = syncState.conflitos.filter(c => c.id !== conflitoId);
            
            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.fecharModal();
            }
            
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                    'Conflito Resolvido',
                    'Resolução aplicada com sucesso'
                );
            }
        }

        // ==================== LISTENERS ====================
        function configurarListeners() {
            window.addEventListener('online', () => {
                if (temPendentes()) {
                    sincronizarAgora();
                }
            });

            window.addEventListener('offline', () => {
                notificarListeners('offline');
            });
        }

        function inscrever(callback) {
            listeners.push(callback);
            return () => {
                listeners = listeners.filter(cb => cb !== callback);
            };
        }

        function notificarListeners(evento, dados = {}) {
            listeners.forEach(callback => {
                try {
                    callback(evento, dados);
                } catch (erro) {
                    console.error('Erro ao notificar listener:', erro);
                }
            });
        }

        // ==================== UTILITÁRIOS ====================
        function gerarId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        function temPendentes() {
            return filaPrioridade.alta.length > 0 || 
                   filaPrioridade.media.length > 0 || 
                   filaPrioridade.baixa.length > 0;
        }

        function atualizarEstadoPendente() {
            syncState.pendentes = {
                alta: filaPrioridade.alta.length,
                media: filaPrioridade.media.length,
                baixa: filaPrioridade.baixa.length,
                total: filaPrioridade.alta.length + filaPrioridade.media.length + filaPrioridade.baixa.length
            };
        }

        function salvarEstado() {
            try {
                localStorage.setItem('sme_sync_state', JSON.stringify({
                    filaPrioridade,
                    syncState: {
                        ultimaSincronizacao: syncState.ultimaSincronizacao,
                        estatisticas: syncState.estatisticas,
                        conflitos: syncState.conflitos
                    }
                }));
            } catch (e) {
                console.error('Erro ao salvar estado:', e);
            }
        }

        function carregarEstado() {
            try {
                const saved = localStorage.getItem('sme_sync_state');
                if (saved) {
                    const dados = JSON.parse(saved);
                    filaPrioridade = dados.filaPrioridade || filaPrioridade;
                    syncState.ultimaSincronizacao = dados.syncState?.ultimaSincronizacao || null;
                    syncState.estatisticas = dados.syncState?.estatisticas || syncState.estatisticas;
                    syncState.conflitos = dados.syncState?.conflitos || [];
                }
            } catch (e) {
                console.error('Erro ao carregar estado:', e);
            }
        }

        function getStatus() {
            return {
                sincronizando: syncState.sincronizando,
                pendentes: syncState.pendentes,
                ultimaSincronizacao: syncState.ultimaSincronizacao ? 
                    new Date(syncState.ultimaSincronizacao).toLocaleString() : 'Nunca',
                conflitos: syncState.conflitos.length,
                estatisticas: { ...syncState.estatisticas }
            };
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            adicionarParaSincronizar,
            adicionarLoteParaSincronizar,
            sincronizarAgora,
            getStatus,
            inscrever,
            resolverConflito,
            pararSincronizacaoPeriodica
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_SINCRONIZACAO.init();
        }, 3500);
    });

    window.MODULO_SINCRONIZACAO = MODULO_SINCRONIZACAO;
    console.log('✅ Módulo de Sincronização em Tempo Real carregado');
}
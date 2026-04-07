// modulos/offline.js - Modo Offline Completo
// Sistema de Gestão Educacional Municipal - FASE 5

if (typeof MODULO_OFFLINE === 'undefined') {
    const MODULO_OFFLINE = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            syncInterval: 5 * 60 * 1000, // 5 minutos
            maxQueueSize: 1000,
            storageKey: 'sme_offline_queue',
            autoSync: true,
            showIndicator: true,
            criticalModules: ['alunos', 'professores', 'turmas'] // Módulos essenciais
        };

        // ==================== ESTADO ====================
        let isOnline = navigator.onLine;
        let syncQueue = [];
        let syncTimer = null;
        let pendingChanges = 0;
        let lastSync = null;

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('📴 Módulo Offline inicializado');
            
            carregarFila();
            configurarListeners();
            configurarServiceWorker();
            iniciarSincronizacaoAutomatica();
            adicionarIndicadorOffline();
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    'Módulo offline inicializado',
                    MODULO_AUDITORIA.categorias?.SISTEMA || 'sistema',
                    MODULO_AUDITORIA.niveis?.INFO || 'info'
                );
            }
        }

        // ==================== LISTENERS DE CONEXÃO ====================
        function configurarListeners() {
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);
        }

        function handleOnline() {
            isOnline = true;
            mostrarNotificacao('online', 'Conexão restaurada! Sincronizando dados...');
            atualizarIndicadorOffline(false);
            
            if (CONFIG.autoSync) {
                sincronizarAgora();
            }
            
            document.dispatchEvent(new CustomEvent('appOnline'));
        }

        function handleOffline() {
            isOnline = false;
            mostrarNotificacao('offline', 'Você está offline. Algumas funcionalidades podem estar limitadas.');
            atualizarIndicadorOffline(true);
            
            document.dispatchEvent(new CustomEvent('appOffline'));
        }

        // ==================== FILA DE OPERAÇÕES ====================
        function adicionarOperacao(tipo, dados, prioridade = 0) {
            const operacao = {
                id: gerarId(),
                tipo,
                dados,
                prioridade,
                timestamp: Date.now(),
                tentativas: 0,
                status: 'pendente'
            };

            syncQueue.push(operacao);
            
            // Manter limite da fila
            if (syncQueue.length > CONFIG.maxQueueSize) {
                syncQueue = syncQueue.slice(-CONFIG.maxQueueSize);
            }

            salvarFila();
            atualizarContadorPendente();

            // Tentar sincronizar imediatamente se estiver online
            if (isOnline && prioridade > 1) {
                sincronizarAgora();
            }

            return operacao.id;
        }

        async function processarFila() {
            if (!isOnline || syncQueue.length === 0) return;

            // Ordenar por prioridade (maior primeiro)
            const filaOrdenada = [...syncQueue].sort((a, b) => b.prioridade - a.prioridade);
            
            const resultados = [];
            
            for (const operacao of filaOrdenada) {
                if (operacao.status === 'pendente') {
                    const resultado = await executarOperacao(operacao);
                    resultados.push(resultado);
                    
                    if (resultado.sucesso) {
                        removerDaFila(operacao.id);
                    } else if (operacao.tentativas >= 3) {
                        operacao.status = 'falhou';
                    } else {
                        operacao.tentativas++;
                    }
                }
            }

            salvarFila();
            atualizarContadorPendente();
            
            return resultados;
        }

        async function executarOperacao(operacao) {
            try {
                let resultado;
                
                switch(operacao.tipo) {
                    case 'criar':
                        resultado = await executarCriacao(operacao.dados);
                        break;
                    case 'atualizar':
                        resultado = await executarAtualizacao(operacao.dados);
                        break;
                    case 'excluir':
                        resultado = await executarExclusao(operacao.dados);
                        break;
                    case 'sincronizar':
                        resultado = await executarSincronizacao(operacao.dados);
                        break;
                    default:
                        resultado = { sucesso: false, erro: 'Tipo desconhecido' };
                }

                return {
                    id: operacao.id,
                    sucesso: resultado.sucesso,
                    dados: resultado
                };
            } catch (erro) {
                return {
                    id: operacao.id,
                    sucesso: false,
                    erro: erro.message
                };
            }
        }

        // ==================== OPERAÇÕES OFFLINE ====================
        async function executarCriacao(dados) {
            // Simular criação offline
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        sucesso: true,
                        id: Date.now(),
                        dados: {
                            ...dados,
                            criadoOffline: true,
                            sincronizado: false
                        }
                    });
                }, 500);
            });
        }

        async function executarAtualizacao(dados) {
            // Simular atualização offline
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        sucesso: true,
                        dados: {
                            ...dados,
                            atualizadoOffline: true,
                            sincronizado: false
                        }
                    });
                }, 500);
            });
        }

        async function executarExclusao(dados) {
            // Simular exclusão offline
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        sucesso: true,
                        id: dados.id,
                        excluidoOffline: true
                    });
                }, 500);
            });
        }

        async function executarSincronizacao(dados) {
            // Simular sincronização
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        sucesso: true,
                        sincronizado: true,
                        timestamp: Date.now()
                    });
                }, 1000);
            });
        }

        // ==================== SERVIÇOS ESSENCIAIS OFFLINE ====================
        async function getDadosOffline(tipo, id = null) {
            // Buscar do cache primeiro
            if (typeof MODULO_CACHE_AVANCADO !== 'undefined') {
                const cacheKey = id ? `${tipo}_${id}` : tipo;
                const cached = await MODULO_CACHE_AVANCADO.get(cacheKey);
                
                if (cached) {
                    return cached;
                }
            }

            // Se não estiver no cache, retornar dados estáticos
            return getDadosEstaticos(tipo, id);
        }

        function getDadosEstaticos(tipo, id) {
            // Dados essenciais para funcionamento offline
            const dadosEstaticos = {
                escolas: MOCK_DATA.escolas?.slice(0, 5) || [],
                professores: MOCK_DATA.professores?.slice(0, 10) || [],
                alunos: MOCK_DATA.alunos?.slice(0, 20) || [],
                turmas: MOCK_DATA.turmas?.slice(0, 10) || []
            };

            if (id) {
                const lista = dadosEstaticos[tipo] || [];
                return lista.find(item => item.id === id) || null;
            }

            return dadosEstaticos[tipo] || null;
        }

        // ==================== SINCRONIZAÇÃO ====================
        function iniciarSincronizacaoAutomatica() {
            if (syncTimer) {
                clearInterval(syncTimer);
            }

            syncTimer = setInterval(() => {
                if (isOnline && syncQueue.length > 0) {
                    sincronizarAgora();
                }
            }, CONFIG.syncInterval);
        }

        async function sincronizarAgora() {
            if (!isOnline) {
                mostrarNotificacao('offline', 'Não é possível sincronizar: offline');
                return;
            }

            if (syncQueue.length === 0) {
                mostrarNotificacao('info', 'Nenhum dado pendente para sincronizar');
                return;
            }

            mostrarNotificacao('sync', `Sincronizando ${syncQueue.length} itens...`);
            
            const resultados = await processarFila();
            
            const sucessos = resultados.filter(r => r.sucesso).length;
            const falhas = resultados.filter(r => !r.sucesso).length;
            
            lastSync = Date.now();
            
            mostrarNotificacao(
                falhas > 0 ? 'warning' : 'success',
                `Sincronização concluída: ${sucessos} sucessos, ${falhas} falhas`
            );

            document.dispatchEvent(new CustomEvent('syncComplete', {
                detail: { sucessos, falhas, resultados }
            }));

            return { sucessos, falhas };
        }

        // ==================== INTERFACE ====================
        function adicionarIndicadorOffline() {
            if (!CONFIG.showIndicator) return;

            const indicador = document.createElement('div');
            indicador.id = 'offline-indicator';
            indicador.className = 'offline-indicator hidden';
            indicador.innerHTML = `
                <i class="fas fa-wifi-slash"></i>
                <span>Modo Offline</span>
                <button class="btn-icon" onclick="MODULO_OFFLINE.fecharIndicador()">
                    <i class="fas fa-times"></i>
                </button>
            `;

            document.body.appendChild(indicador);

            // Estilos
            const style = document.createElement('style');
            style.textContent = `
                .offline-indicator {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: #e74c3c;
                    color: white;
                    padding: 10px;
                    text-align: center;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transform: translateY(-100%);
                    transition: transform 0.3s ease;
                }
                
                .offline-indicator.visible {
                    transform: translateY(0);
                }
                
                .offline-indicator button {
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: white;
                }
                
                .offline-indicator button:hover {
                    background: rgba(255,255,255,0.2);
                }
                
                .sync-indicator {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #3498db;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 30px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 9999;
                    animation: slideIn 0.3s ease;
                }
                
                .sync-indicator i {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;

            document.head.appendChild(style);
        }

        function atualizarIndicadorOffline(offline) {
            const indicador = document.getElementById('offline-indicator');
            if (indicador) {
                if (offline) {
                    indicador.classList.add('visible');
                } else {
                    indicador.classList.remove('visible');
                }
            }
        }

        function fecharIndicador() {
            const indicador = document.getElementById('offline-indicator');
            if (indicador) {
                indicador.classList.remove('visible');
            }
        }

        function mostrarNotificacao(tipo, mensagem) {
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                switch(tipo) {
                    case 'online':
                        MODULO_NOTIFICACOES.adicionarNotificacaoSucesso('Online', mensagem);
                        break;
                    case 'offline':
                        MODULO_NOTIFICACOES.adicionarNotificacaoAviso('Offline', mensagem);
                        break;
                    case 'sync':
                        MODULO_NOTIFICACOES.adicionarNotificacaoInfo('Sincronizando', mensagem);
                        break;
                    case 'warning':
                        MODULO_NOTIFICACOES.adicionarNotificacaoAviso('Aviso', mensagem);
                        break;
                    case 'success':
                        MODULO_NOTIFICACOES.adicionarNotificacaoSucesso('Sucesso', mensagem);
                        break;
                }
            }
        }

        // ==================== SERVICE WORKER ====================
        function configurarServiceWorker() {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(reg => {
                        console.log('✅ Service Worker registrado:', reg.scope);
                        
                        reg.addEventListener('updatefound', () => {
                            const newWorker = reg.installing;
                            console.log('🔄 Nova versão do Service Worker encontrada');
                        });
                    })
                    .catch(err => {
                        console.error('❌ Erro ao registrar Service Worker:', err);
                    });
            }
        }

        // ==================== UTILITÁRIOS ====================
        function gerarId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        function salvarFila() {
            try {
                localStorage.setItem(CONFIG.storageKey, JSON.stringify(syncQueue));
            } catch (e) {
                console.error('Erro ao salvar fila:', e);
            }
        }

        function carregarFila() {
            try {
                const saved = localStorage.getItem(CONFIG.storageKey);
                if (saved) {
                    syncQueue = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar fila:', e);
            }
        }

        function removerDaFila(id) {
            syncQueue = syncQueue.filter(op => op.id !== id);
            salvarFila();
        }

        function atualizarContadorPendente() {
            pendingChanges = syncQueue.filter(op => op.status === 'pendente').length;
            
            // Disparar evento
            document.dispatchEvent(new CustomEvent('pendingChanges', {
                detail: { count: pendingChanges }
            }));
        }

        function getStatus() {
            return {
                online: isOnline,
                pendentes: pendingChanges,
                filaTamanho: syncQueue.length,
                ultimaSincronizacao: lastSync ? new Date(lastSync).toLocaleString() : 'Nunca'
            };
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            adicionarOperacao,
            sincronizarAgora,
            getDadosOffline,
            getStatus,
            fecharIndicador,
            isOnline: () => isOnline,
            getPendentes: () => pendingChanges
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_OFFLINE.init();
        }, 3000);
    });

    window.MODULO_OFFLINE = MODULO_OFFLINE;
    console.log('✅ Módulo Offline Completo carregado');
}

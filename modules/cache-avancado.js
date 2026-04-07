// modulos/cache-avancado.js - Sistema de Cache Avançado
// Sistema de Gestão Educacional Municipal - FASE 5

if (typeof MODULO_CACHE_AVANCADO === 'undefined') {
    const MODULO_CACHE_AVANCADO = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            versao: '1.0.0',
            storagePrefix: 'sme_cache_',
            defaultTTL: 3600, // 1 hora em segundos
            maxItems: 1000,
            compressionThreshold: 10240, // 10KB
            estrategias: {
                LRU: 'lru', // Least Recently Used
                LFU: 'lfu', // Least Frequently Used
                FIFO: 'fifo' // First In First Out
            },
            niveis: {
                MEMORIA: 'memoria',
                LOCALSTORAGE: 'localstorage',
                INDEXEDDB: 'indexeddb',
                SESSION: 'session'
            }
        };

        // ==================== ESTADO ====================
        let cache = {
            memoria: new Map(),
            estatisticas: {
                hits: 0,
                misses: 0,
                tamanhoTotal: 0,
                itens: 0
            },
            filaAcesso: [],
            frequencia: new Map()
        };

        let db = null;
        let estrategiaAtual = CONFIG.estrategias.LRU;

        // ==================== INICIALIZAÇÃO ====================
        async function init() {
            console.log('🚀 Sistema de Cache Avançado inicializado');
            
            await inicializarIndexedDB();
            carregarCachePersistente();
            iniciarLimpezaAutomatica();
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    'Sistema de cache avançado inicializado',
                    MODULO_AUDITORIA.categorias?.SISTEMA || 'sistema',
                    MODULO_AUDITORIA.niveis?.INFO || 'info'
                );
            }
        }

        // ==================== INDEXED DB ====================
        function inicializarIndexedDB() {
            return new Promise((resolve, reject) => {
                if (!window.indexedDB) {
                    console.warn('IndexedDB não suportado');
                    resolve(null);
                    return;
                }

                const request = indexedDB.open('SistemaEducacionalCache', 1);

                request.onerror = () => {
                    console.error('Erro ao abrir IndexedDB');
                    resolve(null);
                };

                request.onsuccess = (event) => {
                    db = event.target.result;
                    console.log('✅ IndexedDB conectado');
                    resolve(db);
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('cache')) {
                        const store = db.createObjectStore('cache', { keyPath: 'chave' });
                        store.createIndex('timestamp', 'timestamp', { unique: false });
                        store.createIndex('expira', 'expira', { unique: false });
                        store.createIndex('frequencia', 'frequencia', { unique: false });
                    }
                };
            });
        }

        // ==================== FUNÇÕES PRINCIPAIS ====================
        async function set(chave, valor, opcoes = {}) {
            const ttl = opcoes.ttl || CONFIG.defaultTTL;
            const nivel = opcoes.nivel || CONFIG.niveis.MEMORIA;
            const comprimir = opcoes.comprimir || JSON.stringify(valor).length > CONFIG.compressionThreshold;

            const item = {
                chave,
                valor: comprimir ? comprimirDados(valor) : valor,
                comprimido: comprimir,
                timestamp: Date.now(),
                expira: Date.now() + (ttl * 1000),
                hits: 0,
                tamanho: estimarTamanho(valor),
                nivel
            };

            // Aplicar estratégia de evicção se necessário
            if (cache.memoria.size >= CONFIG.maxItems) {
                aplicarEviccao();
            }

            // Armazenar no nível apropriado
            switch(nivel) {
                case CONFIG.niveis.MEMORIA:
                    cache.memoria.set(chave, item);
                    atualizarFilaAcesso(chave);
                    atualizarFrequencia(chave);
                    break;
                    
                case CONFIG.niveis.LOCALSTORAGE:
                    try {
                        localStorage.setItem(CONFIG.storagePrefix + chave, JSON.stringify(item));
                    } catch (e) {
                        console.warn('Erro ao salvar no localStorage:', e);
                        // Fallback para memória
                        cache.memoria.set(chave, item);
                    }
                    break;
                    
                case CONFIG.niveis.INDEXEDDB:
                    if (db) {
                        await salvarNoIndexedDB(item);
                    } else {
                        cache.memoria.set(chave, item);
                    }
                    break;
                    
                case CONFIG.niveis.SESSION:
                    sessionStorage.setItem(CONFIG.storagePrefix + chave, JSON.stringify(item));
                    break;
            }

            atualizarEstatisticas();
            return true;
        }

        async function get(chave, opcoes = {}) {
            const niveis = opcoes.niveis || [
                CONFIG.niveis.MEMORIA,
                CONFIG.niveis.LOCALSTORAGE,
                CONFIG.niveis.SESSION,
                CONFIG.niveis.INDEXEDDB
            ];

            for (const nivel of niveis) {
                const item = await buscarEmNivel(chave, nivel);
                
                if (item) {
                    // Verificar expiração
                    if (item.expira && item.expira < Date.now()) {
                        await remove(chave);
                        continue;
                    }

                    // Atualizar estatísticas
                    item.hits++;
                    cache.estatisticas.hits++;
                    
                    if (nivel === CONFIG.niveis.MEMORIA) {
                        atualizarFilaAcesso(chave);
                        atualizarFrequencia(chave);
                    }

                    // Retornar valor descomprimido se necessário
                    return item.comprimido ? descomprimirDados(item.valor) : item.valor;
                }
            }

            cache.estatisticas.misses++;
            return null;
        }

        async function buscarEmNivel(chave, nivel) {
            switch(nivel) {
                case CONFIG.niveis.MEMORIA:
                    return cache.memoria.get(chave);
                    
                case CONFIG.niveis.LOCALSTORAGE:
                    const lsItem = localStorage.getItem(CONFIG.storagePrefix + chave);
                    return lsItem ? JSON.parse(lsItem) : null;
                    
                case CONFIG.niveis.SESSION:
                    const ssItem = sessionStorage.getItem(CONFIG.storagePrefix + chave);
                    return ssItem ? JSON.parse(ssItem) : null;
                    
                case CONFIG.niveis.INDEXEDDB:
                    return await buscarNoIndexedDB(chave);
                    
                default:
                    return null;
            }
        }

        async function remove(chave) {
            cache.memoria.delete(chave);
            localStorage.removeItem(CONFIG.storagePrefix + chave);
            sessionStorage.removeItem(CONFIG.storagePrefix + chave);
            
            if (db) {
                await removerDoIndexedDB(chave);
            }
            
            cache.filaAcesso = cache.filaAcesso.filter(k => k !== chave);
            cache.frequencia.delete(chave);
        }

        async function limpar() {
            cache.memoria.clear();
            cache.filaAcesso = [];
            cache.frequencia.clear();
            
            // Limpar localStorage
            Object.keys(localStorage)
                .filter(key => key.startsWith(CONFIG.storagePrefix))
                .forEach(key => localStorage.removeItem(key));
            
            // Limpar sessionStorage
            Object.keys(sessionStorage)
                .filter(key => key.startsWith(CONFIG.storagePrefix))
                .forEach(key => sessionStorage.removeItem(key));
            
            // Limpar IndexedDB
            if (db) {
                const transaction = db.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                await store.clear();
            }
            
            resetarEstatisticas();
        }

        // ==================== INDEXED DB OPERAÇÕES ====================
        function salvarNoIndexedDB(item) {
            return new Promise((resolve, reject) => {
                if (!db) {
                    resolve();
                    return;
                }

                const transaction = db.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                const request = store.put(item);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }

        function buscarNoIndexedDB(chave) {
            return new Promise((resolve, reject) => {
                if (!db) {
                    resolve(null);
                    return;
                }

                const transaction = db.transaction(['cache'], 'readonly');
                const store = transaction.objectStore('cache');
                const request = store.get(chave);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }

        function removerDoIndexedDB(chave) {
            return new Promise((resolve, reject) => {
                if (!db) {
                    resolve();
                    return;
                }

                const transaction = db.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                const request = store.delete(chave);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }

        // ==================== ESTRATÉGIAS DE EVICÇÃO ====================
        function aplicarEviccao() {
            switch(estrategiaAtual) {
                case CONFIG.estrategias.LRU:
                    evictLRU();
                    break;
                case CONFIG.estrategias.LFU:
                    evictLFU();
                    break;
                case CONFIG.estrategias.FIFO:
                    evictFIFO();
                    break;
                default:
                    evictLRU();
            }
        }

        function evictLRU() {
            // Remover o item menos recentemente usado
            const lru = cache.filaAcesso.shift();
            if (lru) {
                cache.memoria.delete(lru);
                cache.frequencia.delete(lru);
            }
        }

        function evictLFU() {
            // Remover o item menos frequentemente usado
            let menorFreq = Infinity;
            let chaveMenorFreq = null;

            cache.frequencia.forEach((freq, chave) => {
                if (freq < menorFreq) {
                    menorFreq = freq;
                    chaveMenorFreq = chave;
                }
            });

            if (chaveMenorFreq) {
                cache.memoria.delete(chaveMenorFreq);
                cache.frequencia.delete(chaveMenorFreq);
                cache.filaAcesso = cache.filaAcesso.filter(k => k !== chaveMenorFreq);
            }
        }

        function evictFIFO() {
            // Remover o item mais antigo
            const maisAntigo = cache.filaAcesso[0];
            if (maisAntigo) {
                cache.memoria.delete(maisAntigo);
                cache.frequencia.delete(maisAntigo);
                cache.filaAcesso.shift();
            }
        }

        // ==================== COMPRESSÃO DE DADOS ====================
        function comprimirDados(dados) {
            try {
                const jsonString = JSON.stringify(dados);
                // Simulação de compressão (em produção, usar biblioteca real)
                return {
                    tipo: 'comprimido',
                    dados: jsonString,
                    tamanhoOriginal: jsonString.length
                };
            } catch (e) {
                console.error('Erro ao comprimir dados:', e);
                return dados;
            }
        }

        function descomprimirDados(dados) {
            try {
                if (dados && dados.tipo === 'comprimido') {
                    return JSON.parse(dados.dados);
                }
                return dados;
            } catch (e) {
                console.error('Erro ao descomprimir dados:', e);
                return dados;
            }
        }

        // ==================== UTILITÁRIOS ====================
        function atualizarFilaAcesso(chave) {
            cache.filaAcesso = cache.filaAcesso.filter(k => k !== chave);
            cache.filaAcesso.push(chave);
            
            // Manter apenas últimos 1000
            if (cache.filaAcesso.length > 1000) {
                cache.filaAcesso = cache.filaAcesso.slice(-1000);
            }
        }

        function atualizarFrequencia(chave) {
            const freq = cache.frequencia.get(chave) || 0;
            cache.frequencia.set(chave, freq + 1);
        }

        function estimarTamanho(valor) {
            try {
                return new Blob([JSON.stringify(valor)]).size;
            } catch (e) {
                return 0;
            }
        }

        function atualizarEstatisticas() {
            cache.estatisticas.itens = cache.memoria.size;
            cache.estatisticas.tamanhoTotal = Array.from(cache.memoria.values())
                .reduce((acc, item) => acc + (item.tamanho || 0), 0);
        }

        function resetarEstatisticas() {
            cache.estatisticas = {
                hits: 0,
                misses: 0,
                tamanhoTotal: 0,
                itens: 0
            };
        }

        function getEstatisticas() {
            return {
                ...cache.estatisticas,
                hitRate: cache.estatisticas.hits + cache.estatisticas.misses > 0
                    ? (cache.estaticas.hits / (cache.estatisticas.hits + cache.estatisticas.misses) * 100).toFixed(2) + '%'
                    : '0%',
                memoriaUsada: formatarBytes(cache.estatisticas.tamanhoTotal),
                itensEmCache: cache.memoria.size,
                estrategia: estrategiaAtual
            };
        }

        function formatarBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function carregarCachePersistente() {
            // Carregar itens frequentes do localStorage para memória
            Object.keys(localStorage)
                .filter(key => key.startsWith(CONFIG.storagePrefix))
                .slice(0, 100) // Limitar para não sobrecarregar
                .forEach(key => {
                    try {
                        const item = JSON.parse(localStorage.getItem(key));
                        if (item.expira > Date.now()) {
                            cache.memoria.set(item.chave, item);
                        }
                    } catch (e) {}
                });
        }

        function iniciarLimpezaAutomatica() {
            setInterval(() => {
                const agora = Date.now();
                
                // Limpar memória
                cache.memoria.forEach((item, chave) => {
                    if (item.expira < agora) {
                        cache.memoria.delete(chave);
                    }
                });
                
                // Limpar fila de acesso
                cache.filaAcesso = cache.filaAcesso.filter(chave => cache.memoria.has(chave));
                
                // Atualizar estatísticas
                atualizarEstatisticas();
                
            }, 60000); // A cada minuto
        }

        // ==================== CACHE INTELIGENTE ====================
        async function getOrSet(chave, fn, opcoes = {}) {
            const cached = await get(chave, opcoes);
            
            if (cached !== null) {
                return cached;
            }

            const valor = await fn();
            await set(chave, valor, opcoes);
            return valor;
        }

        function cacheUsuario(usuarioId) {
            return {
                set: (chave, valor, opcoes = {}) => 
                    set(`usuario_${usuarioId}_${chave}`, valor, { 
                        ...opcoes, 
                        nivel: CONFIG.niveis.INDEXEDDB 
                    }),
                
                get: (chave, opcoes = {}) => 
                    get(`usuario_${usuarioId}_${chave}`, opcoes),
                
                limpar: async () => {
                    const prefixo = `usuario_${usuarioId}_`;
                    
                    // Limpar memória
                    cache.memoria.forEach((_, chave) => {
                        if (chave.startsWith(prefixo)) {
                            cache.memoria.delete(chave);
                        }
                    });
                    
                    // Limpar localStorage
                    Object.keys(localStorage)
                        .filter(key => key.startsWith(CONFIG.storagePrefix + prefixo))
                        .forEach(key => localStorage.removeItem(key));
                }
            };
        }

        function cachePaginacao(tipo, pagina, dados) {
            return set(`pagina_${tipo}_${pagina}`, dados, {
                ttl: 1800, // 30 minutos
                nivel: CONFIG.niveis.LOCALSTORAGE
            });
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            set,
            get,
            remove,
            limpar,
            getOrSet,
            cacheUsuario,
            cachePaginacao,
            getEstatisticas,
            setEstrategia: (estrategia) => {
                if (Object.values(CONFIG.estrategias).includes(estrategia)) {
                    estrategiaAtual = estrategia;
                }
            },
            niveis: CONFIG.niveis,
            estrategias: CONFIG.estrategias
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_CACHE_AVANCADO.init();
        }, 2000);
    });

    window.MODULO_CACHE_AVANCADO = MODULO_CACHE_AVANCADO;
    console.log('✅ Módulo de Cache Avançado carregado');
}
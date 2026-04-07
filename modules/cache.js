// modulos/cache.js - Sistema de Cache Inteligente
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_CACHE === 'undefined') {
    const MODULO_CACHE = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            prefixo: 'sme_cache_',
            tempoPadrao: 5 * 60 * 1000, // 5 minutos
            maxItens: 100,
            estrategias: {
                MEMORIA: 'memoria',
                LOCALSTORAGE: 'localstorage',
                INDEXEDDB: 'indexeddb'
            },
            niveis: {
                BAIXO: 1,
                MEDIO: 2,
                ALTO: 3,
                CRITICO: 4
            }
        };

        // ==================== ESTADO ====================
        let memoriaCache = new Map();
        let estatisticas = {
            hits: 0,
            misses: 0,
            itens: 0,
            tamanho: 0
        };
        let observers = [];

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('💾 Sistema de Cache Inteligente inicializado');
            
            // Limpar cache expirado
            limparExpirados();
            
            // Configurar limpeza periódica
            setInterval(limparExpirados, 60 * 1000); // 1 minuto
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    'Sistema de cache inicializado',
                    MODULO_AUDITORIA.categorias.SISTEMA,
                    MODULO_AUDITORIA.niveis.INFO
                );
            }
        }

        // ==================== FUNÇÕES PRINCIPAIS ====================
        function set(chave, valor, opcoes = {}) {
            const tempo = opcoes.tempo || CONFIG.tempoPadrao;
            const nivel = opcoes.nivel || CONFIG.niveis.MEDIO;
            const estrategia = opcoes.estrategia || CONFIG.estrategias.MEMORIA;

            const item = {
                valor,
                timestamp: Date.now(),
                expira: Date.now() + tempo,
                nivel,
                hits: 0,
                tamanho: aproximarTamanho(valor)
            };

            // Verificar limite de itens
            if (memoriaCache.size >= CONFIG.maxItens) {
                limparItensAntigos();
            }

            // Armazenar conforme estratégia
            switch (estrategia) {
                case CONFIG.estrategias.MEMORIA:
                    memoriaCache.set(chave, item);
                    break;
                    
                case CONFIG.estrategias.LOCALSTORAGE:
                    try {
                        localStorage.setItem(CONFIG.prefixo + chave, JSON.stringify(item));
                    } catch (e) {
                        console.warn('Erro ao salvar no localStorage:', e);
                    }
                    break;
                    
                case CONFIG.estrategias.INDEXEDDB:
                    // Implementar se necessário
                    break;
            }

            atualizarEstatisticas();
            notificarObservers('set', { chave, nivel });

            return true;
        }

        function get(chave, opcoes = {}) {
            const estrategia = opcoes.estrategia || CONFIG.estrategias.MEMORIA;
            let item = null;

            // Buscar conforme estratégia
            switch (estrategia) {
                case CONFIG.estrategias.MEMORIA:
                    item = memoriaCache.get(chave);
                    break;
                    
                case CONFIG.estrategias.LOCALSTORAGE:
                    try {
                        const saved = localStorage.getItem(CONFIG.prefixo + chave);
                        if (saved) {
                            item = JSON.parse(saved);
                        }
                    } catch (e) {
                        console.warn('Erro ao ler do localStorage:', e);
                    }
                    break;
            }

            // Verificar se existe e não expirou
            if (item && item.expira > Date.now()) {
                item.hits++;
                estatisticas.hits++;
                
                // Atualizar no cache se necessário
                if (estrategia === CONFIG.estrategias.MEMORIA) {
                    memoriaCache.set(chave, item);
                }
                
                return item.valor;
            }

            estatisticas.misses++;
            return null;
        }

        function getOrSet(chave, fn, opcoes = {}) {
            const cached = get(chave, opcoes);
            
            if (cached !== null) {
                return Promise.resolve(cached);
            }

            return Promise.resolve(fn()).then(valor => {
                set(chave, valor, opcoes);
                return valor;
            });
        }

        function remove(chave) {
            memoriaCache.delete(chave);
            localStorage.removeItem(CONFIG.prefixo + chave);
            
            notificarObservers('remove', { chave });
        }

        function limpar() {
            memoriaCache.clear();
            
            // Limpar localStorage
            Object.keys(localStorage)
                .filter(key => key.startsWith(CONFIG.prefixo))
                .forEach(key => localStorage.removeItem(key));
            
            atualizarEstatisticas();
            notificarObservers('limpar', {});
        }

        function limparExpirados() {
            const agora = Date.now();
            let removidos = 0;

            // Memória
            for (const [chave, item] of memoriaCache) {
                if (item.expira <= agora) {
                    memoriaCache.delete(chave);
                    removidos++;
                }
            }

            // LocalStorage
            Object.keys(localStorage)
                .filter(key => key.startsWith(CONFIG.prefixo))
                .forEach(key => {
                    try {
                        const item = JSON.parse(localStorage.getItem(key));
                        if (item.expira <= agora) {
                            localStorage.removeItem(key);
                            removidos++;
                        }
                    } catch (e) {
                        // Ignorar itens corrompidos
                    }
                });

            if (removidos > 0) {
                atualizarEstatisticas();
                notificarObservers('limparExpirados', { removidos });
            }
        }

        function limparItensAntigos() {
            // Ordenar por hits (menos acessados primeiro)
            const itens = Array.from(memoriaCache.entries())
                .sort((a, b) => a[1].hits - b[1].hits);
            
            // Remover 20% dos itens menos acessados
            const remover = Math.ceil(itens.length * 0.2);
            
            for (let i = 0; i < remover; i++) {
                memoriaCache.delete(itens[i][0]);
            }
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function aproximarTamanho(valor) {
            try {
                return new Blob([JSON.stringify(valor)]).size;
            } catch (e) {
                return 0;
            }
        }

        function atualizarEstatisticas() {
            estatisticas.itens = memoriaCache.size;
            estatisticas.tamanho = Array.from(memoriaCache.values())
                .reduce((acc, item) => acc + item.tamanho, 0);
        }

        function getEstatisticas() {
            return { ...estatisticas };
        }

        function getChaves() {
            return Array.from(memoriaCache.keys());
        }

        // ==================== CACHE ESPECÍFICO ====================
        function cacheUsuario(usuarioId) {
            return {
                set: (chave, valor, opcoes = {}) => 
                    set(`usuario_${usuarioId}_${chave}`, valor, { 
                        ...opcoes, 
                        nivel: CONFIG.niveis.ALTO 
                    }),
                
                get: (chave) => 
                    get(`usuario_${usuarioId}_${chave}`),
                
                limpar: () => {
                    const prefixo = `usuario_${usuarioId}_`;
                    for (const chave of memoriaCache.keys()) {
                        if (chave.startsWith(prefixo)) {
                            memoriaCache.delete(chave);
                        }
                    }
                }
            };
        }

        function cachePaginacao(tipo, pagina, dados) {
            return set(`pagina_${tipo}_${pagina}`, dados, {
                tempo: 30 * 60 * 1000, // 30 minutos
                nivel: CONFIG.niveis.MEDIO
            });
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
            set,
            get,
            getOrSet,
            remove,
            limpar,
            getEstatisticas,
            getChaves,
            cacheUsuario,
            cachePaginacao,
            observar,
            estrategias: CONFIG.estrategias,
            niveis: CONFIG.niveis
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_CACHE.init();
        }, 5500);
    });

    window.MODULO_CACHE = MODULO_CACHE;
    console.log('✅ Módulo de Cache Inteligente carregado');
}
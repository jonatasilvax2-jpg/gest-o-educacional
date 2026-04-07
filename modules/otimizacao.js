// modulos/otimizacao.js - Otimização de Performance
// Sistema de Gestão Educacional Municipal - FASE 5

if (typeof MODULO_OTIMIZACAO === 'undefined') {
    const MODULO_OTIMIZACAO = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            lazyLoadThreshold: 200, // pixels antes de carregar
            debounceDelay: 300, // ms
            throttleDelay: 100, // ms
            maxConcurrentRequests: 6,
            prefetchLinks: true,
            imageQuality: 0.8,
            enableWebWorker: true
        };

        // ==================== ESTADO ====================
        let observadores = [];
        let webWorker = null;
        let metricas = {
            tempoCarregamento: 0,
            requestsOtimizados: 0,
            imagensOtimizadas: 0,
            cacheHits: 0
        };

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('⚡ Módulo de Otimização de Performance inicializado');
            
            iniciarObservadores();
            configurarWebWorker();
            otimizarImagens();
            configurarPrefetch();
            monitorarPerformance();
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    'Módulo de otimização inicializado',
                    MODULO_AUDITORIA.categorias?.SISTEMA || 'sistema',
                    MODULO_AUDITORIA.niveis?.INFO || 'info'
                );
            }
        }

        // ==================== LAZY LOADING ====================
        function iniciarObservadores() {
            // Observador para imagens
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        carregarImagemLazy(img);
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: `${CONFIG.lazyLoadThreshold}px`
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });

            // Observador para componentes
            const componentObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const component = entry.target;
                        carregarComponenteLazy(component);
                        componentObserver.unobserve(component);
                    }
                });
            });

            document.querySelectorAll('[data-lazy-component]').forEach(comp => {
                componentObserver.observe(comp);
            });

            observadores.push(imageObserver, componentObserver);
        }

        function carregarImagemLazy(img) {
            const src = img.dataset.src;
            if (src) {
                // Otimizar imagem antes de carregar
                otimizarImagem(src).then(optimizedSrc => {
                    img.src = optimizedSrc;
                    img.classList.add('loaded');
                    metricas.imagensOtimizadas++;
                });
            }
        }

        async function carregarComponenteLazy(component) {
            const componentName = component.dataset.lazyComponent;
            const props = component.dataset.props ? JSON.parse(component.dataset.props) : {};

            try {
                const module = await import(`./componentes/${componentName}.js`);
                const Componente = module.default;
                const instancia = new Componente(props);
                component.innerHTML = instancia.render();
                metricas.requestsOtimizados++;
            } catch (erro) {
                console.error(`Erro ao carregar componente ${componentName}:`, erro);
            }
        }

        // ==================== OTIMIZAÇÃO DE IMAGENS ====================
        async function otimizarImagem(src) {
            // Verificar cache primeiro
            if (typeof MODULO_CACHE_AVANCADO !== 'undefined') {
                const cached = await MODULO_CACHE_AVANCADO.get(`img_${src}`);
                if (cached) {
                    metricas.cacheHits++;
                    return cached;
                }
            }

            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Redimensionar se necessário
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > 1920) {
                        height = (height * 1920) / width;
                        width = 1920;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Comprimir
                    const optimizedSrc = canvas.toDataURL('image/jpeg', CONFIG.imageQuality);
                    
                    // Salvar no cache
                    if (typeof MODULO_CACHE_AVANCADO !== 'undefined') {
                        MODULO_CACHE_AVANCADO.set(`img_${src}`, optimizedSrc, {
                            ttl: 86400, // 24 horas
                            nivel: MODULO_CACHE_AVANCADO.niveis.INDEXEDDB
                        });
                    }
                    
                    resolve(optimizedSrc);
                };
                
                img.src = src;
            });
        }

        // ==================== WEB WORKER ====================
        function configurarWebWorker() {
            if (!CONFIG.enableWebWorker || !window.Worker) return;

            try {
                const workerCode = `
                    self.addEventListener('message', function(e) {
                        const { type, data } = e.data;
                        
                        switch(type) {
                            case 'processarDados':
                                const resultado = processarDados(data);
                                self.postMessage({ type: 'resultado', data: resultado });
                                break;
                                
                            case 'calcularMetricas':
                                const metricas = calcularMetricas(data);
                                self.postMessage({ type: 'metricas', data: metricas });
                                break;
                        }
                    });
                    
                    function processarDados(dados) {
                        // Processamento pesado aqui
                        return dados.map(item => ({
                            ...item,
                            processado: true,
                            timestamp: Date.now()
                        }));
                    }
                    
                    function calcularMetricas(dados) {
                        const soma = dados.reduce((acc, item) => acc + (item.valor || 0), 0);
                        return {
                            soma,
                            media: soma / dados.length,
                            max: Math.max(...dados.map(d => d.valor || 0)),
                            min: Math.min(...dados.map(d => d.valor || 0))
                        };
                    }
                `;

                const blob = new Blob([workerCode], { type: 'application/javascript' });
                webWorker = new Worker(URL.createObjectURL(blob));

                webWorker.onmessage = function(e) {
                    const { type, data } = e.data;
                    document.dispatchEvent(new CustomEvent('workerResult', { 
                        detail: { type, data } 
                    }));
                };

                console.log('✅ Web Worker configurado');
            } catch (erro) {
                console.warn('Erro ao configurar Web Worker:', erro);
            }
        }

        function processarEmWorker(tipo, dados) {
            if (webWorker) {
                webWorker.postMessage({ type: tipo, data: dados });
            } else {
                console.warn('Web Worker não disponível');
            }
        }

        // ==================== PREFETCH ====================
        function configurarPrefetch() {
            if (!CONFIG.prefetchLinks) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const link = entry.target;
                        prefetchURL(link.href);
                        observer.unobserve(link);
                    }
                });
            });

            document.querySelectorAll('a[data-prefetch]').forEach(link => {
                observer.observe(link);
            });
        }

        async function prefetchURL(url) {
            try {
                const response = await fetch(url, { method: 'HEAD' });
                if (response.ok) {
                    const link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.href = url;
                    document.head.appendChild(link);
                    
                    metricas.requestsOtimizados++;
                }
            } catch (erro) {
                // Ignorar erros de prefetch
            }
        }

        // ==================== DEBOUNCE E THROTTLE ====================
        function debounce(func, wait = CONFIG.debounceDelay) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        function throttle(func, limit = CONFIG.throttleDelay) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }

        // ==================== MONITORAMENTO ====================
        function monitorarPerformance() {
            // Medir tempo de carregamento
            window.addEventListener('load', () => {
                const timing = performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                metricas.tempoCarregamento = loadTime;
                
                console.log(`📊 Tempo de carregamento: ${loadTime}ms`);
                
                // Enviar métricas
                if (typeof MODULO_AUDITORIA !== 'undefined') {
                    MODULO_AUDITORIA.registrarLog(
                        `Performance: ${loadTime}ms`,
                        MODULO_AUDITORIA.categorias?.SISTEMA || 'sistema',
                        MODULO_AUDITORIA.niveis?.INFO || 'info',
                        { metricas }
                    );
                }
            });

            // Monitorar Long Tasks
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (entry.duration > 50) {
                            console.warn('⚠️ Long Task detectada:', entry);
                        }
                    });
                });
                
                observer.observe({ entryTypes: ['longtask'] });
            }

            // Monitorar memória
            setInterval(() => {
                if (performance.memory) {
                    const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
                    const usoMemoria = (usedJSHeapSize / totalJSHeapSize * 100).toFixed(2);
                    
                    if (usoMemoria > 80) {
                        console.warn(`⚠️ Uso de memória alto: ${usoMemoria}%`);
                        solicitarColetaLixo();
                    }
                }
            }, 30000);
        }

        // ==================== OTIMIZAÇÃO DE DOM ====================
        function otimizarDOM() {
            // Remover elementos desnecessários
            document.querySelectorAll('[data-cleanup]').forEach(el => {
                if (el.dataset.cleanup === 'true') {
                    el.remove();
                }
            });

            // Comprimir CSS inline
            document.querySelectorAll('style[data-inline]').forEach(style => {
                style.textContent = comprimirCSS(style.textContent);
            });

            // Diferir scripts não críticos
            document.querySelectorAll('script[data-defer]').forEach(script => {
                script.defer = true;
            });
        }

        function comprimirCSS(css) {
            return css
                .replace(/\s+/g, ' ')
                .replace(/\s*{\s*/g, '{')
                .replace(/\s*}\s*/g, '}')
                .replace(/\s*:\s*/g, ':')
                .replace(/\s*;\s*/g, ';')
                .replace(/\s*,\s*/g, ',')
                .trim();
        }

        // ==================== GARBAGE COLLECTION ====================
        function solicitarColetaLixo() {
            // Limpar caches antigos
            if (typeof MODULO_CACHE_AVANCADO !== 'undefined') {
                MODULO_CACHE_AVANCADO.limparExpirados?.();
            }

            // Limpar observadores não utilizados
            observadores = observadores.filter(obs => {
                if (obs && typeof obs.disconnect === 'function') {
                    obs.disconnect();
                    return false;
                }
                return true;
            });

            // Forçar garbage collection (se disponível)
            if (window.gc) {
                window.gc();
            }
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            debounce,
            throttle,
            processarEmWorker,
            otimizarImagem,
            getMetricas: () => ({ ...metricas }),
            solicitarColetaLixo,
            CONFIG
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_OTIMIZACAO.init();
        }, 2500);
    });

    window.MODULO_OTIMIZACAO = MODULO_OTIMIZACAO;
    console.log('✅ Módulo de Otimização de Performance carregado');
}
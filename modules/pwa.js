// modulos/pwa.js - Progressive Web App
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_PWA === 'undefined') {
    const MODULO_PWA = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            nome: 'Sistema de Gestão Educacional',
            nomeCurto: 'SGE Municipal',
            descricao: 'Sistema completo de gestão educacional para municípios',
            tema: '#3498db',
            backgroundColor: '#f5f7fa',
            versao: '4.0.0',
            cacheVersao: 'v4',
            recursosParaCache: [
                '/',
                '/index.html',
                '/style.css',
                '/script.js',
                '/dados/mockData.js',
                '/modulos/auth.js',
                '/modulos/dashboard.js',
                '/modulos/secretaria.js',
                '/modulos/diretor.js',
                '/modulos/professor.js',
                '/modulos/aluno.js',
                '/modulos/biblioteca.js',
                '/modulos/merenda.js',
                '/modulos/transporte.js',
                '/modulos/ocorrencias.js',
                '/modulos/comunicacao.js',
                '/modulos/atividades.js',
                '/modulos/vagas.js',
                '/modulos/reunioes.js',
                '/modulos/projetos.js',
                '/modulos/saude.js',
                '/modulos/bolsas.js',
                '/modulos/estagio.js',
                '/modulos/monitoria.js',
                '/modulos/competicoes.js',
                '/modulos/horas.js',
                '/modulos/pesquisas.js',
                '/modulos/documentos.js',
                '/modulos/uniforme.js',
                '/modulos/cursos.js',
                '/modulos/feedback.js',
                '/modulos/relatorios.js',
                '/modulos/notificacoes.js',
                '/modulos/graficos.js',
                '/modulos/busca.js',
                '/modulos/temas.js',
                '/modulos/pwa.js',
                'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
                'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
            ],
            rotasOffline: ['/login', '/dashboard']
        };

        // ==================== ESTADO ====================
        let serviceWorkerRegistrado = false;
        let modoOffline = false;
        let sincronizacaoPendente = [];
        let cacheStatus = {};

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('📱 Inicializando PWA...');

            // Verificar suporte
            if (!verificarSuporte()) {
                console.warn('PWA não é suportado neste navegador');
                return;
            }

            // Registrar Service Worker
            registrarServiceWorker();

            // Configurar listeners de conexão
            configurarListenersConexao();

            // Criar manifesto
            criarManifesto();

            // Configurar sincronização em segundo plano
            configurarSyncBackground();

            // Verificar cache
            verificarCache();

            // Adicionar botão de instalação
            adicionarBotaoInstalacao();

            console.log('✅ PWA inicializado com sucesso');
        }

        // ==================== VERIFICAÇÃO DE SUPORTE ====================
        function verificarSuporte() {
            const suporta = 'serviceWorker' in navigator && 
                           'PushManager' in window && 
                           'Notification' in window &&
                           'caches' in window;

            if (!suporta) {
                console.warn('Recursos PWA não disponíveis neste navegador');
            }

            return suporta;
        }

        // ==================== SERVICE WORKER ====================
        function registrarServiceWorker() {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registro => {
                        serviceWorkerRegistrado = true;
                        console.log('✅ Service Worker registrado:', registro.scope);

                        // Verificar atualizações
                        registro.addEventListener('updatefound', () => {
                            const novoWorker = registro.installing;
                            console.log('🔄 Nova versão do Service Worker encontrada');

                            novoWorker.addEventListener('statechange', () => {
                                if (novoWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    notificarNovaVersao();
                                }
                            });
                        });
                    })
                    .catch(erro => {
                        console.error('❌ Erro ao registrar Service Worker:', erro);
                    });

                // Listener para controle de atualizações
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    console.log('🔄 Service Worker atualizado');
                    window.location.reload();
                });
            }
        }

        // ==================== CRIAÇÃO DO MANIFESTO ====================
        function criarManifesto() {
            const manifesto = {
                name: CONFIG.nome,
                short_name: CONFIG.nomeCurto,
                description: CONFIG.descricao,
                start_url: '/',
                display: 'standalone',
                background_color: CONFIG.backgroundColor,
                theme_color: CONFIG.tema,
                orientation: 'any',
                scope: '/',
                icons: [
                    {
                        src: '/icons/icon-72x72.png',
                        sizes: '72x72',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/icons/icon-96x96.png',
                        sizes: '96x96',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/icons/icon-128x128.png',
                        sizes: '128x128',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/icons/icon-144x144.png',
                        sizes: '144x144',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/icons/icon-152x152.png',
                        sizes: '152x152',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/icons/icon-384x384.png',
                        sizes: '384x384',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ],
                shortcuts: [
                    {
                        name: 'Dashboard',
                        short_name: 'Dashboard',
                        description: 'Ir para o Dashboard',
                        url: '/dashboard',
                        icons: [{ src: '/icons/shortcut-dashboard.png', sizes: '192x192' }]
                    },
                    {
                        name: 'Notificações',
                        short_name: 'Notificações',
                        description: 'Ver notificações',
                        url: '/notificacoes',
                        icons: [{ src: '/icons/shortcut-notifications.png', sizes: '192x192' }]
                    },
                    {
                        name: 'Perfil',
                        short_name: 'Perfil',
                        description: 'Meu Perfil',
                        url: '/perfil',
                        icons: [{ src: '/icons/shortcut-profile.png', sizes: '192x192' }]
                    }
                ],
                categories: ['education', 'productivity'],
                screenshots: [
                    {
                        src: '/screenshots/dashboard.png',
                        sizes: '1280x720',
                        type: 'image/png'
                    },
                    {
                        src: '/screenshots/login.png',
                        sizes: '1280x720',
                        type: 'image/png'
                    }
                ]
            };

            const manifestoString = JSON.stringify(manifesto);
            const blob = new Blob([manifestoString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('link');
            link.rel = 'manifest';
            link.href = url;
            document.head.appendChild(link);
        }

        // ==================== GERENCIAMENTO DE CACHE ====================
        async function verificarCache() {
            try {
                const cache = await caches.open(CONFIG.cacheVersao);
                const chaves = await cache.keys();
                
                cacheStatus = {
                    total: chaves.length,
                    recursos: chaves.map(r => r.url)
                };

                console.log('📦 Cache status:', cacheStatus);
            } catch (erro) {
                console.error('Erro ao verificar cache:', erro);
            }
        }

        async function limparCacheAntigo() {
            const chaves = await caches.keys();
            const versoesAntigas = chaves.filter(key => key !== CONFIG.cacheVersao);
            
            await Promise.all(versoesAntigas.map(key => caches.delete(key)));
            console.log('🧹 Cache antigo limpo:', versoesAntigas);
        }

        // ==================== MODO OFFLINE ====================
        function configurarListenersConexao() {
            window.addEventListener('online', () => {
                modoOffline = false;
                console.log('📶 Conexão restabelecida');
                notificarConexaoRestaurada();
                sincronizarDadosPendentes();
            });

            window.addEventListener('offline', () => {
                modoOffline = true;
                console.log('📴 Modo offline ativado');
                notificarModoOffline();
            });

            // Verificar status inicial
            modoOffline = !navigator.onLine;
        }

        function notificarModoOffline() {
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoAviso(
                    'Modo Offline',
                    'Você está offline. Algumas funcionalidades podem estar limitadas.',
                    { prioridade: 2 }
                );
            }

            // Adicionar indicador visual
            adicionarIndicadorOffline();
        }

        function notificarConexaoRestaurada() {
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                    'Conexão Restaurada',
                    'Sincronizando dados...',
                    { prioridade: 1 }
                );
            }

            removerIndicadorOffline();
        }

        function adicionarIndicadorOffline() {
            if (document.getElementById('indicador-offline')) return;

            const indicador = document.createElement('div');
            indicador.id = 'indicador-offline';
            indicador.className = 'indicador-offline';
            indicador.innerHTML = `
                <i class="fas fa-wifi-slash"></i>
                <span>Offline</span>
            `;
            document.body.appendChild(indicador);

            // Estilos para o indicador
            const style = document.createElement('style');
            style.textContent = `
                .indicador-offline {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    background: #e74c3c;
                    color: white;
                    padding: 8px 15px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    z-index: 9999;
                    animation: slideInLeft 0.3s ease;
                }
                
                @keyframes slideInLeft {
                    from { transform: translateX(-100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        function removerIndicadorOffline() {
            const indicador = document.getElementById('indicador-offline');
            if (indicador) {
                indicador.remove();
            }
        }

        // ==================== SINCRONIZAÇÃO ====================
        function configurarSyncBackground() {
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                navigator.serviceWorker.ready.then(registration => {
                    // Registrar sync periódico
                    if ('periodicSync' in registration) {
                        registration.periodicSync.register('sync-dados', {
                            minInterval: 24 * 60 * 60 * 1000 // 24 horas
                        });
                    }
                });
            }
        }

        function adicionarSyncPendente(dados) {
            sincronizacaoPendente.push({
                id: Date.now(),
                dados: dados,
                timestamp: new Date().toISOString()
            });

            // Salvar no IndexedDB
            salvarSyncPendente();

            // Tentar sincronizar se estiver online
            if (navigator.onLine) {
                sincronizarDadosPendentes();
            }
        }

        async function sincronizarDadosPendentes() {
            if (sincronizacaoPendente.length === 0) return;

            console.log('🔄 Sincronizando dados pendentes...');

            const sucessos = [];
            const falhas = [];

            for (const item of sincronizacaoPendente) {
                try {
                    // Tentar enviar dados para o servidor
                    await enviarDadosServidor(item.dados);
                    sucessos.push(item);
                } catch (erro) {
                    console.error('Erro ao sincronizar:', erro);
                    falhas.push(item);
                }
            }

            // Remover itens sincronizados com sucesso
            sincronizacaoPendente = sincronizacaoPendente.filter(
                item => !sucessos.includes(item)
            );

            // Salvar lista atualizada
            salvarSyncPendente();

            if (sucessos.length > 0) {
                if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                    MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                        'Sincronização Concluída',
                        `${sucessos.length} ${sucessos.length === 1 ? 'item sincronizado' : 'itens sincronizados'}`
                    );
                }
            }
        }

        async function enviarDadosServidor(dados) {
            // Simular envio para servidor
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log('✅ Dados enviados:', dados);
                    resolve();
                }, 1000);
            });
        }

        function salvarSyncPendente() {
            try {
                localStorage.setItem('sme_sync_pendente', JSON.stringify(sincronizacaoPendente));
            } catch (e) {
                console.error('Erro ao salvar sync pendente:', e);
            }
        }

        function carregarSyncPendente() {
            try {
                const saved = localStorage.getItem('sme_sync_pendente');
                if (saved) {
                    sincronizacaoPendente = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar sync pendente:', e);
            }
        }

        // ==================== NOTIFICAÇÕES PUSH ====================
        async function solicitarPermissaoNotificacoes() {
            if (!('Notification' in window)) {
                console.warn('Notificações não suportadas');
                return false;
            }

            if (Notification.permission === 'granted') {
                return true;
            }

            if (Notification.permission !== 'denied') {
                const permission = await Notification.requestPermission();
                return permission === 'granted';
            }

            return false;
        }

        function enviarNotificacaoPush(titulo, opcoes = {}) {
            if (Notification.permission === 'granted') {
                const notification = new Notification(titulo, {
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/icon-72x72.png',
                    ...opcoes
                });

                notification.onclick = () => {
                    window.focus();
                    if (opcoes.url) {
                        window.location.href = opcoes.url;
                    }
                };
            }
        }

        // ==================== INSTALAÇÃO DO APP ====================
        let eventoAntesInstalacao = null;

        function adicionarBotaoInstalacao() {
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                eventoAntesInstalacao = e;
                
                // Mostrar botão de instalação
                mostrarBotaoInstalacao();
            });

            window.addEventListener('appinstalled', () => {
                console.log('✅ App instalado com sucesso');
                esconderBotaoInstalacao();
                
                if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                    MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                        'App Instalado',
                        'O aplicativo foi instalado com sucesso!'
                    );
                }
            });
        }

        function mostrarBotaoInstalacao() {
            if (document.getElementById('btn-instalar')) return;

            const btn = document.createElement('button');
            btn.id = 'btn-instalar';
            btn.className = 'btn-instalar-pwa';
            btn.innerHTML = `
                <i class="fas fa-download"></i>
                <span>Instalar App</span>
            `;
            
            btn.addEventListener('click', instalarApp);
            document.body.appendChild(btn);

            // Estilos para o botão
            const style = document.createElement('style');
            style.textContent = `
                .btn-instalar-pwa {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #3498db, #2980b9);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 30px;
                    font-size: 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
                    z-index: 9999;
                    animation: pulse 2s infinite;
                    transition: all 0.3s;
                }
                
                .btn-instalar-pwa:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }

        function esconderBotaoInstalacao() {
            const btn = document.getElementById('btn-instalar');
            if (btn) btn.remove();
        }

        async function instalarApp() {
            if (!eventoAntesInstalacao) {
                alert('A instalação não está disponível no momento');
                return;
            }

            eventoAntesInstalacao.prompt();
            const resultado = await eventoAntesInstalacao.userChoice;
            
            if (resultado.outcome === 'accepted') {
                console.log('✅ Usuário aceitou instalar');
            } else {
                console.log('❌ Usuário recusou instalar');
            }

            eventoAntesInstalacao = null;
            esconderBotaoInstalacao();
        }

        // ==================== FUNÇÕES DE UTILIDADE ====================
        function notificarNovaVersao() {
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoInfo(
                    'Nova versão disponível',
                    'Atualize para a versão mais recente',
                    {
                        acao: () => window.location.reload(),
                        prioridade: 2
                    }
                );
            }
        }

        function estaOffline() {
            return modoOffline;
        }

        function getStatus() {
            return {
                serviceWorker: serviceWorkerRegistrado,
                offline: modoOffline,
                sincronizacaoPendente: sincronizacaoPendente.length,
                cache: cacheStatus
            };
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            estaOffline,
            getStatus,
            adicionarSyncPendente,
            solicitarPermissaoNotificacoes,
            enviarNotificacaoPush,
            instalarApp,
            limparCacheAntigo
        };
    })();

    // Inicializar após o carregamento da página
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_PWA.init();
        }, 2000);
    });

    window.MODULO_PWA = MODULO_PWA;
    console.log('✅ Módulo PWA carregado');
}
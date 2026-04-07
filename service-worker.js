// service-worker.js - Service Worker para PWA
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

const CACHE_NAME = 'sge-municipal-v4';
const OFFLINE_URL = '/offline.html';

// Recursos para cache
const RECURSOS_PARA_CACHE = [
    '/',
    '/index.html',
    '/offline.html',
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
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js'
];

// ==================== INSTALAÇÃO ====================
self.addEventListener('install', (event) => {
    console.log('🔄 Service Worker instalando...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Cache aberto, adicionando recursos...');
                return cache.addAll(RECURSOS_PARA_CACHE);
            })
            .then(() => {
                console.log('✅ Cache inicializado com sucesso');
                return self.skipWaiting();
            })
            .catch(erro => {
                console.error('❌ Erro ao cachear recursos:', erro);
            })
    );
});

// ==================== ATIVAÇÃO ====================
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker ativando...');

    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => {
                        console.log('🧹 Removendo cache antigo:', key);
                        return caches.delete(key);
                    })
            );
        }).then(() => {
            console.log('✅ Service Worker ativado');
            return self.clients.claim();
        })
    );
});

// ==================== INTERCEPTAÇÃO DE REQUISIÇÕES ====================
self.addEventListener('fetch', (event) => {
    // Ignorar requisições de análise e não GET
    if (event.request.method !== 'GET' || 
        event.request.url.includes('analytics') ||
        event.request.url.includes('chrome-extension')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(resposta => {
                if (resposta) {
                    // Retornar do cache
                    return resposta;
                }

                // Tentar buscar da rede
                return fetch(event.request)
                    .then(respostaRede => {
                        // Verificar se é resposta válida
                        if (!respostaRede || respostaRede.status !== 200 || respostaRede.type !== 'basic') {
                            return respostaRede;
                        }

                        // Clonar para poder cachear
                        const respostaClonada = respostaRede.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, respostaClonada);
                            });

                        return respostaRede;
                    })
                    .catch(erro => {
                        console.log('📴 Falha na rede, tentando página offline');

                        // Se for navegação, retornar página offline
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }

                        // Para outros recursos, retornar erro
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// ==================== SINCRONIZAÇÃO EM BACKGROUND ====================
self.addEventListener('sync', (event) => {
    console.log('🔄 Evento de sincronização:', event.tag);

    if (event.tag === 'sync-dados') {
        event.waitUntil(sincronizarDados());
    }
});

async function sincronizarDados() {
    try {
        // Buscar dados pendentes do IndexedDB
        const dadosPendentes = await obterDadosPendentes();
        
        for (const dado of dadosPendentes) {
            await enviarDadosServidor(dado);
        }

        console.log('✅ Sincronização concluída');
    } catch (erro) {
        console.error('❌ Erro na sincronização:', erro);
    }
}

async function obterDadosPendentes() {
    // Simular obtenção de dados pendentes
    return [];
}

async function enviarDadosServidor(dado) {
    // Simular envio para servidor
    return new Promise(resolve => setTimeout(resolve, 1000));
}

// ==================== NOTIFICAÇÕES PUSH ====================
self.addEventListener('push', (event) => {
    console.log('📨 Notificação push recebida');

    let dados = {
        titulo: 'SGE Municipal',
        mensagem: 'Nova notificação',
        icone: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png'
    };

    if (event.data) {
        try {
            dados = JSON.parse(event.data.text());
        } catch (e) {
            dados.mensagem = event.data.text();
        }
    }

    const opcoes = {
        body: dados.mensagem,
        icon: dados.icone,
        badge: dados.badge,
        vibrate: [200, 100, 200],
        data: {
            url: dados.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(dados.titulo, opcoes)
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notificação clicada');

    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                const url = event.notification.data.url;

                // Verificar se já existe uma janela aberta
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }

                // Abrir nova janela
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

// ==================== PERIODIC BACKGROUND SYNC ====================
self.addEventListener('periodicsync', (event) => {
    console.log('🔄 Sincronização periódica:', event.tag);

    if (event.tag === 'sync-dados') {
        event.waitUntil(sincronizarDados());
    }
});

// ==================== MENSAGENS DO CLIENTE ====================
self.addEventListener('message', (event) => {
    console.log('📩 Mensagem recebida do cliente:', event.data);

    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
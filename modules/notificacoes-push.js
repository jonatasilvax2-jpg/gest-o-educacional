// modulos/notificacoes-push.js - Notificações Push Avançadas
// Sistema de Gestão Educacional Municipal - FASE 7

if (typeof MODULO_NOTIFICACOES_PUSH === 'undefined') {
    const MODULO_NOTIFICACOES_PUSH = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            versao: '1.0.0',
            vapidPublicKey: 'BPnUxM3E5qZ8xL5QvK2wR7yT9aB4cD6fG8hJ1kL3mN5pP7rS9tV2wX4yZ6aB8cD0eF2gH4iJ6kL8mN0pP2rS4tU6vW8xY0zA2',
            tipos: {
                INFO: 'info',
                AVISO: 'aviso',
                ALERTA: 'alerta',
                SUCESSO: 'sucesso',
                LEMBRETE: 'lembrete',
                CONQUISTA: 'conquista'
            },
            prioridades: {
                BAIXA: 1,
                MEDIA: 2,
                ALTA: 3,
                URGENTE: 4
            },
            canais: {
                SISTEMA: 'sistema',
                ESCOLA: 'escola',
                TURMA: 'turma',
                ALUNO: 'aluno',
                PROFESSOR: 'professor',
                BIBLIOTECA: 'biblioteca',
                MERENDA: 'merenda',
                TRANSPORTE: 'transporte'
            },
            preferenciasPadrao: {
                push: true,
                email: true,
                sms: false,
                som: true,
                vibrar: true,
                horarioInicio: '08:00',
                horarioFim: '22:00'
            }
        };

        // ==================== ESTADO ====================
        let serviceWorkerRegistrado = false;
        let subscription = null;
        let notificacoes = [];
        let preferencias = {};
        let estatisticas = {
            enviadas: 0,
            recebidas: 0,
            clicadas: 0,
            descartadas: 0
        };

        // ==================== INICIALIZAÇÃO ====================
        async function init() {
            console.log('📱 Módulo de Notificações Push inicializado');
            
            await verificarSuporte();
            await registrarServiceWorker();
            await carregarPreferencias();
            await solicitarPermissao();
            
            configurarListeners();
            carregarNotificacoes();
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                MODULO_AUDITORIA_AVANCADA.registrarLog(
                    'Módulo de notificações push inicializado',
                    MODULO_AUDITORIA_AVANCADA.categorias?.SISTEMA || 'sistema',
                    MODULO_AUDITORIA_AVANCADA.niveis?.INFO || 'info'
                );
            }
        }

        // ==================== VERIFICAÇÃO DE SUPORTE ====================
        async function verificarSuporte() {
            if (!('Notification' in window)) {
                console.warn('Notificações não suportadas');
                return false;
            }

            if (!('serviceWorker' in navigator)) {
                console.warn('Service Worker não suportado');
                return false;
            }

            if (!('PushManager' in window)) {
                console.warn('Push notifications não suportadas');
                return false;
            }

            return true;
        }

        // ==================== SERVICE WORKER ====================
        async function registrarServiceWorker() {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                serviceWorkerRegistrado = true;
                console.log('✅ Service Worker registrado');

                // Verificar subscription existente
                subscription = await registration.pushManager.getSubscription();

                return registration;
            } catch (erro) {
                console.error('❌ Erro ao registrar Service Worker:', erro);
                return null;
            }
        }

        // ==================== PERMISSÕES ====================
        async function solicitarPermissao() {
            if (Notification.permission === 'granted') {
                await inscreverPush();
                return true;
            }

            if (Notification.permission === 'denied') {
                console.warn('Permissão de notificações negada');
                return false;
            }

            try {
                const permission = await Notification.requestPermission();
                
                if (permission === 'granted') {
                    await inscreverPush();
                    return true;
                }
            } catch (erro) {
                console.error('Erro ao solicitar permissão:', erro);
            }

            return false;
        }

        async function inscreverPush() {
            try {
                const registration = await navigator.serviceWorker.ready;
                
                // Converter chave VAPID
                const convertedVapidKey = urlBase64ToUint8Array(CONFIG.vapidPublicKey);

                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                });

                console.log('✅ Inscrição push realizada:', subscription);

                // Salvar subscription no servidor (simulado)
                await salvarSubscription(subscription);

                return subscription;
            } catch (erro) {
                console.error('❌ Erro ao inscrever push:', erro);
                return null;
            }
        }

        // ==================== ENVIO DE NOTIFICAÇÕES ====================
        async function enviarNotificacao(titulo, opcoes = {}) {
            if (!subscription) {
                console.warn('Sem inscrição push');
                return false;
            }

            const usuario = obterUsuarioAtual();
            const notificacao = criarNotificacao(titulo, opcoes);

            // Verificar preferências
            if (!verificarPreferencias(usuario?.id, notificacao)) {
                return false;
            }

            try {
                // Simular envio para servidor
                const resultado = await enviarParaServidor(subscription, notificacao);

                if (resultado.sucesso) {
                    notificacao.enviada = true;
                    notificacao.dataEnvio = new Date().toISOString();
                    
                    notificacoes.push(notificacao);
                    estatisticas.enviadas++;
                    
                    salvarNotificacoes();
                    
                    // Registrar no auditório
                    if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                        MODULO_AUDITORIA_AVANCADA.registrarLog(
                            `Notificação enviada: ${titulo}`,
                            MODULO_AUDITORIA_AVANCADA.categorias?.SISTEMA || 'sistema',
                            MODULO_AUDITORIA_AVANCADA.niveis?.INFO || 'info'
                        );
                    }

                    return true;
                }
            } catch (erro) {
                console.error('Erro ao enviar notificação:', erro);
            }

            return false;
        }

        function criarNotificacao(titulo, opcoes = {}) {
            const usuario = obterUsuarioAtual();
            
            return {
                id: gerarId(),
                titulo,
                corpo: opcoes.corpo || '',
                icone: opcoes.icone || '/icons/icon-192x192.png',
                badge: opcoes.badge || '/icons/icon-72x72.png',
                tipo: opcoes.tipo || CONFIG.tipos.INFO,
                prioridade: opcoes.prioridade || CONFIG.prioridades.MEDIA,
                canal: opcoes.canal || CONFIG.canais.SISTEMA,
                destinatario: opcoes.destinatario || null,
                dados: opcoes.dados || {},
                acoes: opcoes.acoes || [],
                dataCriacao: new Date().toISOString(),
                lida: false,
                clicada: false,
                expiracao: opcoes.expiracao || null
            };
        }

        function verificarPreferencias(usuarioId, notificacao) {
            const pref = preferencias[usuarioId] || CONFIG.preferenciasPadrao;

            // Verificar se push está habilitado
            if (!pref.push) return false;

            // Verificar horário
            if (!verificarHorario(pref)) return false;

            // Verificar canal
            if (notificacao.canal && !pref[notificacao.canal]) return false;

            return true;
        }

        function verificarHorario(pref) {
            const agora = new Date();
            const horaAtual = agora.getHours() * 60 + agora.getMinutes();

            const [horaInicio, minInicio] = pref.horarioInicio.split(':').map(Number);
            const [horaFim, minFim] = pref.horarioFim.split(':').map(Number);

            const inicio = horaInicio * 60 + minInicio;
            const fim = horaFim * 60 + minFim;

            return horaAtual >= inicio && horaAtual <= fim;
        }

        // ==================== RECEBIMENTO DE NOTIFICAÇÕES ====================
        function receberNotificacao(notificacao) {
            notificacao.recebida = true;
            notificacao.dataRecebimento = new Date().toISOString();
            
            notificacoes.push(notificacao);
            estatisticas.recebidas++;

            // Exibir notificação se permitido
            if (Notification.permission === 'granted') {
                exibirNotificacao(notificacao);
            }

            salvarNotificacoes();
        }

        function exibirNotificacao(notificacao) {
            const opcoes = {
                body: notificacao.corpo,
                icon: notificacao.icone,
                badge: notificacao.badge,
                vibrate: [200, 100, 200],
                data: notificacao.dados,
                actions: notificacao.acoes.map(a => ({
                    action: a.id,
                    title: a.titulo,
                    icon: a.icone
                }))
            };

            const notification = new Notification(notificacao.titulo, opcoes);

            notification.onclick = function(event) {
                event.preventDefault();
                notificacao.clicada = true;
                estatisticas.clicadas++;
                
                if (notificacao.dados.url) {
                    window.open(notificacao.dados.url, '_blank');
                }
                
                salvarNotificacoes();
            };

            notification.onclose = function() {
                estatisticas.descartadas++;
            };
        }

        // ==================== GERENCIAMENTO DE NOTIFICAÇÕES ====================
        function marcarComoLida(notificacaoId) {
            const notificacao = notificacoes.find(n => n.id === notificacaoId);
            if (notificacao) {
                notificacao.lida = true;
                notificacao.dataLeitura = new Date().toISOString();
                salvarNotificacoes();
            }
        }

        function marcarTodasComoLidas() {
            notificacoes.forEach(n => {
                n.lida = true;
                n.dataLeitura = new Date().toISOString();
            });
            salvarNotificacoes();
        }

        function removerNotificacao(notificacaoId) {
            notificacoes = notificacoes.filter(n => n.id !== notificacaoId);
            salvarNotificacoes();
        }

        function limparNotificacoesAntigas(dias = 30) {
            const limite = new Date();
            limite.setDate(limite.getDate() - dias);

            notificacoes = notificacoes.filter(n => {
                const data = new Date(n.dataCriacao);
                return data >= limite;
            });

            salvarNotificacoes();
        }

        function getNotificacoesNaoLidas() {
            return notificacoes.filter(n => !n.lida);
        }

        function getNotificacoesPorTipo(tipo) {
            return notificacoes.filter(n => n.tipo === tipo);
        }

        // ==================== PREFERÊNCIAS ====================
        function salvarPreferencias(usuarioId, novasPreferencias) {
            preferencias[usuarioId] = {
                ...CONFIG.preferenciasPadrao,
                ...novasPreferencias
            };

            localStorage.setItem('sme_push_prefs', JSON.stringify(preferencias));
        }

        function getPreferencias(usuarioId) {
            return preferencias[usuarioId] || CONFIG.preferenciasPadrao;
        }

        async function carregarPreferencias() {
            try {
                const saved = localStorage.getItem('sme_push_prefs');
                if (saved) {
                    preferencias = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar preferências:', e);
            }
        }

        // ==================== CONFIGURAÇÃO DE LISTENERS ====================
        function configurarListeners() {
            // Listener para notificações push
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'push') {
                    receberNotificacao(event.data.notificacao);
                }
            });

            // Listener para quando a página ganha foco
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    atualizarBadgeNotificacoes();
                }
            });
        }

        // ==================== INTERFACE DO USUÁRIO ====================
        function adicionarBadgeNotificacoes() {
            const headerRight = document.querySelector('.header-right');
            if (!headerRight) return;

            const badge = document.createElement('div');
            badge.className = 'push-notificacoes-badge';
            badge.id = 'push-notificacoes-badge';
            badge.innerHTML = `
                <i class="fas fa-bell"></i>
                <span class="badge-count">0</span>
            `;

            badge.addEventListener('click', () => {
                abrirCentralNotificacoes();
            });

            headerRight.appendChild(badge);

            // Adicionar estilos
            adicionarEstilosPush();
        }

        function adicionarEstilosPush() {
            if (document.getElementById('style-push')) return;

            const style = document.createElement('style');
            style.id = 'style-push';
            style.textContent = `
                .push-notificacoes-badge {
                    position: relative;
                    cursor: pointer;
                    padding: 5px;
                    border-radius: 50%;
                    transition: all 0.3s;
                }
                
                .push-notificacoes-badge:hover {
                    background: #f0f0f0;
                }
                
                .push-notificacoes-badge i {
                    font-size: 1.2rem;
                    color: #3498db;
                }
                
                .badge-count {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #e74c3c;
                    color: white;
                    font-size: 0.7rem;
                    padding: 2px 5px;
                    border-radius: 10px;
                    min-width: 18px;
                    text-align: center;
                }
                
                .central-notificacoes-push {
                    max-height: 500px;
                    overflow-y: auto;
                }
                
                .push-notificacao-item {
                    display: flex;
                    align-items: start;
                    gap: 15px;
                    padding: 15px;
                    border-bottom: 1px solid #dee2e6;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .push-notificacao-item:hover {
                    background: #f8f9fa;
                }
                
                .push-notificacao-item.nao-lida {
                    background: #f0f7ff;
                }
                
                .push-notificacao-icone {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                
                .icone-info { background: #3498db; }
                .icone-aviso { background: #f39c12; }
                .icone-alerta { background: #e74c3c; }
                .icone-sucesso { background: #27ae60; }
                .icone-lembrete { background: #9b59b6; }
                .icone-conquista { background: #f1c40f; }
                
                .push-notificacao-conteudo {
                    flex: 1;
                }
                
                .push-notificacao-titulo {
                    font-weight: 600;
                    margin-bottom: 5px;
                }
                
                .push-notificacao-corpo {
                    color: #7f8c8d;
                    font-size: 0.9rem;
                    margin-bottom: 5px;
                }
                
                .push-notificacao-data {
                    font-size: 0.8rem;
                    color: #95a5a6;
                }
                
                .push-preferencias-painel {
                    padding: 20px;
                }
                
                .preferencia-grupo {
                    margin-bottom: 20px;
                }
                
                .preferencia-grupo h4 {
                    margin: 0 0 15px 0;
                    color: #2c3e50;
                }
                
                .preferencia-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid #dee2e6;
                }
                
                .preferencia-item:last-child {
                    border-bottom: none;
                }
                
                .horario-inputs {
                    display: flex;
                    gap: 10px;
                }
                
                .horario-inputs input {
                    width: 100px;
                }
                
                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 24px;
                }
                
                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                
                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                    border-radius: 24px;
                }
                
                .toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 16px;
                    width: 16px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                
                input:checked + .toggle-slider {
                    background-color: #3498db;
                }
                
                input:checked + .toggle-slider:before {
                    transform: translateX(26px);
                }
            `;

            document.head.appendChild(style);
        }

        function abrirCentralNotificacoes() {
            const naoLidas = getNotificacoesNaoLidas();
            const todas = notificacoes.slice(0, 50);

            const modalHTML = `
                <div class="central-notificacoes-push">
                    <div class="central-header">
                        <h3><i class="fas fa-bell"></i> Central de Notificações</h3>
                        <div class="central-acoes">
                            <button class="btn-link" onclick="MODULO_NOTIFICACOES_PUSH.marcarTodasComoLidas()">
                                Marcar todas como lidas
                            </button>
                            <button class="btn-link" onclick="MODULO_NOTIFICACOES_PUSH.abrirPreferencias()">
                                <i class="fas fa-cog"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="notificacoes-lista">
                        ${todas.map(n => `
                            <div class="push-notificacao-item ${n.lida ? '' : 'nao-lida'}" 
                                 onclick="MODULO_NOTIFICACOES_PUSH.abrirNotificacao('${n.id}')">
                                <div class="push-notificacao-icone icone-${n.tipo}">
                                    <i class="fas ${getIconeTipo(n.tipo)}"></i>
                                </div>
                                <div class="push-notificacao-conteudo">
                                    <div class="push-notificacao-titulo">${n.titulo}</div>
                                    <div class="push-notificacao-corpo">${n.corpo}</div>
                                    <div class="push-notificacao-data">${new Date(n.dataCriacao).toLocaleString()}</div>
                                </div>
                                ${!n.lida ? '<span class="badge badge-primary">Nova</span>' : ''}
                            </div>
                        `).join('')}
                        
                        ${todas.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-bell-slash"></i>
                                <p>Nenhuma notificação</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Notificações', modalHTML);
            }

            // Resetar badge
            atualizarBadgeNotificacoes();
        }

        function abrirPreferencias() {
            const usuarioId = obterUsuarioAtual()?.id;
            if (!usuarioId) return;

            const pref = getPreferencias(usuarioId);

            const modalHTML = `
                <div class="push-preferencias-painel">
                    <h3><i class="fas fa-cog"></i> Configurações de Notificações</h3>
                    
                    <div class="preferencia-grupo">
                        <h4>Canais de Notificação</h4>
                        
                        <div class="preferencia-item">
                            <span>Push Notifications</span>
                            <label class="toggle-switch">
                                <input type="checkbox" id="pref-push" ${pref.push ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="preferencia-item">
                            <span>Email</span>
                            <label class="toggle-switch">
                                <input type="checkbox" id="pref-email" ${pref.email ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="preferencia-item">
                            <span>SMS</span>
                            <label class="toggle-switch">
                                <input type="checkbox" id="pref-sms" ${pref.sms ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="preferencia-grupo">
                        <h4>Comportamento</h4>
                        
                        <div class="preferencia-item">
                            <span>Som</span>
                            <label class="toggle-switch">
                                <input type="checkbox" id="pref-som" ${pref.som ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="preferencia-item">
                            <span>Vibração</span>
                            <label class="toggle-switch">
                                <input type="checkbox" id="pref-vibrar" ${pref.vibrar ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="preferencia-grupo">
                        <h4>Horário de Funcionamento</h4>
                        
                        <div class="preferencia-item">
                            <span>Horário de início</span>
                            <input type="time" class="form-control" id="pref-horario-inicio" value="${pref.horarioInicio}">
                        </div>
                        
                        <div class="preferencia-item">
                            <span>Horário de fim</span>
                            <input type="time" class="form-control" id="pref-horario-fim" value="${pref.horarioFim}">
                        </div>
                    </div>
                    
                    <div class="preferencia-grupo">
                        <h4>Canais Específicos</h4>
                        
                        ${Object.values(CONFIG.canais).map(canal => `
                            <div class="preferencia-item">
                                <span>${canal.charAt(0).toUpperCase() + canal.slice(1)}</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="pref-${canal}" ${pref[canal] !== false ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="SISTEMA.fecharModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="MODULO_NOTIFICACOES_PUSH.salvarPreferenciasModal()">
                            Salvar Preferências
                        </button>
                    </div>
                </div>
            `;

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Configurações de Notificações', modalHTML);
            }
        }

        function salvarPreferenciasModal() {
            const usuarioId = obterUsuarioAtual()?.id;
            if (!usuarioId) return;

            const novasPreferencias = {
                push: document.getElementById('pref-push')?.checked || false,
                email: document.getElementById('pref-email')?.checked || false,
                sms: document.getElementById('pref-sms')?.checked || false,
                som: document.getElementById('pref-som')?.checked || false,
                vibrar: document.getElementById('pref-vibrar')?.checked || false,
                horarioInicio: document.getElementById('pref-horario-inicio')?.value || '08:00',
                horarioFim: document.getElementById('pref-horario-fim')?.value || '22:00'
            };

            // Adicionar canais
            Object.values(CONFIG.canais).forEach(canal => {
                novasPreferencias[canal] = document.getElementById(`pref-${canal}`)?.checked || false;
            });

            salvarPreferencias(usuarioId, novasPreferencias);

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.fecharModal();
            }

            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                    'Preferências salvas',
                    'Configurações de notificações atualizadas'
                );
            }
        }

        function abrirNotificacao(notificacaoId) {
            const notificacao = notificacoes.find(n => n.id === notificacaoId);
            if (!notificacao) return;

            marcarComoLida(notificacaoId);

            if (notificacao.dados.url) {
                window.open(notificacao.dados.url, '_blank');
            }
        }

        function atualizarBadgeNotificacoes() {
            const badge = document.getElementById('push-notificacoes-badge');
            if (!badge) return;

            const count = getNotificacoesNaoLidas().length;
            const countSpan = badge.querySelector('.badge-count');
            
            if (countSpan) {
                countSpan.textContent = count;
                countSpan.style.display = count > 0 ? 'block' : 'none';
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

        function urlBase64ToUint8Array(base64String) {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);

            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        }

        function getIconeTipo(tipo) {
            const icones = {
                info: 'fa-info-circle',
                aviso: 'fa-exclamation-triangle',
                alerta: 'fa-bell',
                sucesso: 'fa-check-circle',
                lembrete: 'fa-clock',
                conquista: 'fa-trophy'
            };
            return icones[tipo] || 'fa-bell';
        }

        async function salvarSubscription(subscription) {
            // Simular salvamento no servidor
            console.log('Subscription salva:', subscription);
            localStorage.setItem('sme_push_subscription', JSON.stringify(subscription));
        }

        async function enviarParaServidor(subscription, notificacao) {
            // Simular envio para servidor
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ sucesso: true, id: notificacao.id });
                }, 500);
            });
        }

        function salvarNotificacoes() {
            try {
                localStorage.setItem('sme_push_notificacoes', JSON.stringify(notificacoes.slice(-100)));
            } catch (e) {
                console.error('Erro ao salvar notificações:', e);
            }
        }

        function carregarNotificacoes() {
            try {
                const saved = localStorage.getItem('sme_push_notificacoes');
                if (saved) {
                    notificacoes = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar notificações:', e);
            }
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            enviarNotificacao,
            marcarComoLida,
            marcarTodasComoLidas,
            removerNotificacao,
            limparNotificacoesAntigas,
            getNotificacoesNaoLidas,
            getNotificacoesPorTipo,
            salvarPreferencias,
            getPreferencias,
            abrirCentralNotificacoes,
            abrirPreferencias,
            salvarPreferenciasModal,
            abrirNotificacao,
            tipos: CONFIG.tipos,
            prioridades: CONFIG.prioridades,
            canais: CONFIG.canais
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_NOTIFICACOES_PUSH.init();
        }, 7500);
    });

    window.MODULO_NOTIFICACOES_PUSH = MODULO_NOTIFICACOES_PUSH;
    console.log('✅ Módulo de Notificações Push Avançadas carregado');
}
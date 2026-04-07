// script.js - Arquivo Principal do Sistema
// Sistema de Gestão Educacional Municipal - VERSÃO 8.0 COMPLETA
// Inclui todas as funcionalidades das 7 Fases com 58 módulos funcionando

// ==================== VERIFICAÇÃO INICIAL ====================
if (typeof SISTEMA_EDUCACIONAL === 'undefined') {
    
    // ==================== CONSTANTES GLOBAIS ====================
    const CONFIG = {
        nome: 'Sistema de Gestão Educacional Municipal',
        versao: '8.0.0',
        debug: true,
        storageKey: 'sme_sessao',
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
        modulosCarregados: 0,
        totalModulos: 58
    };

    // ==================== ESTADO GLOBAL ====================
    const Estado = {
        autenticado: false,
        usuario: null,
        perfil: null,
        view: 'login',
        sidebar: false,
        modulo: 'dashboard',
        secao: 'home',
        idioma: 'pt-BR',
        tema: 'claro',
        notificacoes: 0,
        gamificacao: {
            pontos: 0,
            nivel: 1,
            conquistas: []
        }
    };

    // ==================== INICIALIZAÇÃO ====================
    document.addEventListener('DOMContentLoaded', function() {
        console.log(`${CONFIG.nome} v${CONFIG.versao} - Inicializando...`);
        console.log('🚀 Carregando 58 módulos...');
        
        // Verificar se os dados foram carregados
        if (typeof MOCK_DATA === 'undefined') {
            console.error('ERRO: MOCK_DATA não foi carregado!');
            mostrarMensagem('Erro ao carregar dados do sistema.', 'error');
            return;
        }
        
        // Carregar estilos
        carregarEstilos();
        
        // Verificar sessão existente
        verificarSessao();
        
        // Configurar eventos
        configurarEventos();
        
        // Configurar modal
        configurarModal();
        
        // Inicializar todos os módulos
        inicializarTodosModulos();
        
        // Atualizar interface
        atualizarInterface();
        
        console.log(`✅ Sistema inicializado com sucesso! ${CONFIG.modulosCarregados}/${CONFIG.totalModulos} módulos carregados.`);
        mostrarMensagem(`Sistema v${CONFIG.versao} carregado com sucesso!`, 'success');
    });

    // ==================== INICIALIZAÇÃO DE TODOS OS MÓDULOS ====================
    function inicializarTodosModulos() {
        console.log('🔧 Inicializando módulos...');
        
        // === FASE 1 - MÓDULOS BÁSICOS (24 módulos) ===
        setTimeout(() => {
            // Módulos de Gestão
            if (typeof MODULO_SECRETARIA !== 'undefined') {
                try { 
                    window.MODULO_SECRETARIA = MODULO_SECRETARIA;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Secretaria carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Secretaria:', e); }
            }
            
            if (typeof MODULO_DIRETOR !== 'undefined') {
                try { 
                    window.MODULO_DIRETOR = MODULO_DIRETOR;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Diretor carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Diretor:', e); }
            }
            
            if (typeof MODULO_PROFESSOR !== 'undefined') {
                try { 
                    window.MODULO_PROFESSOR = MODULO_PROFESSOR;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Professor carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Professor:', e); }
            }
            
            if (typeof MODULO_ALUNO !== 'undefined') {
                try { 
                    window.MODULO_ALUNO = MODULO_ALUNO;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Aluno carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Aluno:', e); }
            }
            
            if (typeof MODULO_BIBLIOTECA !== 'undefined') {
                try { 
                    window.MODULO_BIBLIOTECA = MODULO_BIBLIOTECA;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Biblioteca carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Biblioteca:', e); }
            }
            
            if (typeof MODULO_MERENDA !== 'undefined') {
                try { 
                    window.MODULO_MERENDA = MODULO_MERENDA;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Merenda carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Merenda:', e); }
            }
            
            if (typeof MODULO_TRANSPORTE !== 'undefined') {
                try { 
                    window.MODULO_TRANSPORTE = MODULO_TRANSPORTE;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Transporte carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Transporte:', e); }
            }
            
            if (typeof MODULO_OCORRENCIAS !== 'undefined') {
                try { 
                    window.MODULO_OCORRENCIAS = MODULO_OCORRENCIAS;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Ocorrências carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Ocorrências:', e); }
            }
            
            if (typeof MODULO_COMUNICACAO !== 'undefined') {
                try { 
                    window.MODULO_COMUNICACAO = MODULO_COMUNICACAO;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Comunicação carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Comunicação:', e); }
            }
            
            if (typeof MODULO_ATIVIDADES !== 'undefined') {
                try { 
                    window.MODULO_ATIVIDADES = MODULO_ATIVIDADES;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Atividades carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Atividades:', e); }
            }
            
            if (typeof MODULO_VAGAS !== 'undefined') {
                try { 
                    window.MODULO_VAGAS = MODULO_VAGAS;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Vagas carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Vagas:', e); }
            }
            
            if (typeof MODULO_REUNIOES !== 'undefined') {
                try { 
                    window.MODULO_REUNIOES = MODULO_REUNIOES;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Reuniões carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Reuniões:', e); }
            }
            
            if (typeof MODULO_PROJETOS !== 'undefined') {
                try { 
                    window.MODULO_PROJETOS = MODULO_PROJETOS;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Projetos carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Projetos:', e); }
            }
            
            if (typeof MODULO_SAUDE !== 'undefined') {
                try { 
                    window.MODULO_SAUDE = MODULO_SAUDE;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Saúde carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Saúde:', e); }
            }
            
            if (typeof MODULO_BOLSAS !== 'undefined') {
                try { 
                    window.MODULO_BOLSAS = MODULO_BOLSAS;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Bolsas carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Bolsas:', e); }
            }
            
            if (typeof MODULO_ESTAGIO !== 'undefined') {
                try { 
                    window.MODULO_ESTAGIO = MODULO_ESTAGIO;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Estágio carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Estágio:', e); }
            }
            
            if (typeof MODULO_MONITORIA !== 'undefined') {
                try { 
                    window.MODULO_MONITORIA = MODULO_MONITORIA;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Monitoria carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Monitoria:', e); }
            }
            
            if (typeof MODULO_COMPETICOES !== 'undefined') {
                try { 
                    window.MODULO_COMPETICOES = MODULO_COMPETICOES;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Competições carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Competições:', e); }
            }
            
            if (typeof MODULO_HORAS !== 'undefined') {
                try { 
                    window.MODULO_HORAS = MODULO_HORAS;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Horas Complementares carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Horas:', e); }
            }
            
            if (typeof MODULO_PESQUISAS !== 'undefined') {
                try { 
                    window.MODULO_PESQUISAS = MODULO_PESQUISAS;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Pesquisas carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Pesquisas:', e); }
            }
            
            if (typeof MODULO_DOCUMENTOS !== 'undefined') {
                try { 
                    window.MODULO_DOCUMENTOS = MODULO_DOCUMENTOS;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Documentos carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Documentos:', e); }
            }
            
            if (typeof MODULO_UNIFORME !== 'undefined') {
                try { 
                    window.MODULO_UNIFORME = MODULO_UNIFORME;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Uniforme carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Uniforme:', e); }
            }
            
            if (typeof MODULO_CURSOS !== 'undefined') {
                try { 
                    window.MODULO_CURSOS = MODULO_CURSOS;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Cursos carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Cursos:', e); }
            }
            
            if (typeof MODULO_FEEDBACK !== 'undefined') {
                try { 
                    window.MODULO_FEEDBACK = MODULO_FEEDBACK;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Feedback carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Feedback:', e); }
            }
            
            if (typeof MODULO_RELATORIOS !== 'undefined') {
                try { 
                    window.MODULO_RELATORIOS = MODULO_RELATORIOS;
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Relatórios carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Relatórios:', e); }
            }
        }, 100);

        // === FASE 2 - MÓDULOS DE MELHORIAS (7 módulos) ===
        setTimeout(() => {
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                try { 
                    MODULO_NOTIFICACOES.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Notificações carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Notificações:', e); }
            }
            
            if (typeof MODULO_GRAFICOS !== 'undefined') {
                try { 
                    MODULO_GRAFICOS.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Gráficos carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Gráficos:', e); }
            }
            
            if (typeof MODULO_BUSCA !== 'undefined') {
                try { 
                    MODULO_BUSCA.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Busca Avançada carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Busca:', e); }
            }
            
            if (typeof MODULO_TEMAS !== 'undefined') {
                try { 
                    MODULO_TEMAS.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Temas carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Temas:', e); }
            }
            
            if (typeof MODULO_PWA !== 'undefined') {
                try { 
                    MODULO_PWA.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo PWA carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo PWA:', e); }
            }
            
            if (typeof MODULO_EXPORTACAO !== 'undefined') {
                try { 
                    MODULO_EXPORTACAO.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Exportação carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Exportação:', e); }
            }
            
            if (typeof MODULO_BACKUP !== 'undefined') {
                try { 
                    MODULO_BACKUP.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Backup carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Backup:', e); }
            }
        }, 200);

        // === FASE 3 - MÓDULOS AVANÇADOS (7 módulos) ===
        setTimeout(() => {
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                try { 
                    MODULO_AUDITORIA.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Auditoria carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Auditoria:', e); }
            }
            
            if (typeof MODULO_2FA !== 'undefined') {
                try { 
                    MODULO_2FA.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo 2FA carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo 2FA:', e); }
            }
            
            if (typeof MODULO_API !== 'undefined') {
                try { 
                    MODULO_API.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo API carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo API:', e); }
            }
            
            if (typeof MODULO_I18N !== 'undefined') {
                try { 
                    MODULO_I18N.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Internacionalização carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo I18N:', e); }
            }
            
            if (typeof MODULO_ACESSIBILIDADE !== 'undefined') {
                try { 
                    MODULO_ACESSIBILIDADE.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Acessibilidade carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Acessibilidade:', e); }
            }
            
            if (typeof MODULO_CACHE !== 'undefined') {
                try { 
                    MODULO_CACHE.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Cache carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Cache:', e); }
            }
            
            if (typeof MODULO_DASHBOARD_CUSTOM !== 'undefined') {
                try { 
                    MODULO_DASHBOARD_CUSTOM.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Dashboard Customizável carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Dashboard:', e); }
            }
        }, 300);

        // === FASE 4 - MÓDULOS DE IA (4 módulos) ===
        setTimeout(() => {
            if (typeof MODULO_IA_PREVISAO !== 'undefined') {
                try { 
                    MODULO_IA_PREVISAO.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo IA Previsão carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo IA Previsão:', e); }
            }
            
            if (typeof MODULO_IA_RECOMENDACAO !== 'undefined') {
                try { 
                    MODULO_IA_RECOMENDACAO.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo IA Recomendação carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo IA Recomendação:', e); }
            }
            
            if (typeof MODULO_IA_EVASAO !== 'undefined') {
                try { 
                    MODULO_IA_EVASAO.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo IA Evasão carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo IA Evasão:', e); }
            }
            
            if (typeof MODULO_CHATBOT !== 'undefined') {
                try { 
                    MODULO_CHATBOT.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Chatbot carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Chatbot:', e); }
            }
        }, 400);

        // === FASE 5 - MÓDULOS DE OTIMIZAÇÃO (4 módulos) ===
        setTimeout(() => {
            if (typeof MODULO_CACHE_AVANCADO !== 'undefined') {
                try { 
                    MODULO_CACHE_AVANCADO.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Cache Avançado carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Cache Avançado:', e); }
            }
            
            if (typeof MODULO_OTIMIZACAO !== 'undefined') {
                try { 
                    MODULO_OTIMIZACAO.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Otimização carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Otimização:', e); }
            }
            
            if (typeof MODULO_OFFLINE !== 'undefined') {
                try { 
                    MODULO_OFFLINE.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Offline carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Offline:', e); }
            }
            
            if (typeof MODULO_SINCRONIZACAO !== 'undefined') {
                try { 
                    MODULO_SINCRONIZACAO.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Sincronização carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Sincronização:', e); }
            }
        }, 500);

        // === FASE 6 - MÓDULOS DE SEGURANÇA (4 módulos) ===
        setTimeout(() => {
            if (typeof MODULO_LGPD !== 'undefined') {
                try { 
                    MODULO_LGPD.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo LGPD carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo LGPD:', e); }
            }
            
            if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                try { 
                    MODULO_AUDITORIA_AVANCADA.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Auditoria Avançada carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Auditoria Avançada:', e); }
            }
            
            if (typeof MODULO_ACESSO_GRANULAR !== 'undefined') {
                try { 
                    MODULO_ACESSO_GRANULAR.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Acesso Granular carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Acesso Granular:', e); }
            }
            
            if (typeof MODULO_BACKUP_NUVEM !== 'undefined') {
                try { 
                    MODULO_BACKUP_NUVEM.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Backup Nuvem carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Backup Nuvem:', e); }
            }
        }, 600);

        // === FASE 7 - MÓDULOS DE EXPERIÊNCIA (4 módulos) ===
        setTimeout(() => {
            if (typeof MODULO_TUTORIAL !== 'undefined') {
                try { 
                    MODULO_TUTORIAL.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Tutorial carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Tutorial:', e); }
            }
            
            if (typeof MODULO_FEEDBACK_USUARIO !== 'undefined') {
                try { 
                    MODULO_FEEDBACK_USUARIO.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Feedback Usuário carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Feedback Usuário:', e); }
            }
            
            if (typeof MODULO_GAMIFICACAO !== 'undefined') {
                try { 
                    MODULO_GAMIFICACAO.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Gamificação carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Gamificação:', e); }
            }
            
            if (typeof MODULO_NOTIFICACOES_PUSH !== 'undefined') {
                try { 
                    MODULO_NOTIFICACOES_PUSH.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Notificações Push carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Notificações Push:', e); }
            }
        }, 700);

        // === FASE 8 - MÓDULOS DE INTEGRAÇÃO (4 módulos) ===
        setTimeout(() => {
            if (typeof MODULO_API_GOVERNO !== 'undefined') {
                try { 
                    MODULO_API_GOVERNO.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo API Governo carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo API Governo:', e); }
            }
            
            if (typeof MODULO_INTEGRACOES_EXTERNAS !== 'undefined') {
                try { 
                    MODULO_INTEGRACOES_EXTERNAS.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Integrações Externas carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Integrações Externas:', e); }
            }
            
            if (typeof MODULO_IMPORTACAO_EXPORTACAO !== 'undefined') {
                try { 
                    MODULO_IMPORTACAO_EXPORTACAO.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Importação/Exportação carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Importação/Exportação:', e); }
            }
            
            if (typeof MODULO_WEBHOOKS !== 'undefined') {
                try { 
                    MODULO_WEBHOOKS.init?.();
                    CONFIG.modulosCarregados++;
                    console.log('✅ Módulo Webhooks carregado');
                } catch(e) { console.warn('⚠️ Erro no módulo Webhooks:', e); }
            }
        }, 800);
    }

    // ==================== FUNÇÕES DE AUTENTICAÇÃO ====================
    function verificarSessao() {
        try {
            const sessao = localStorage.getItem(CONFIG.storageKey);
            if (sessao) {
                const dados = JSON.parse(sessao);
                const agora = Date.now();
                
                if (dados.expira && agora < dados.expira) {
                    Estado.autenticado = true;
                    Estado.usuario = dados.usuario;
                    Estado.perfil = dados.perfil;
                    Estado.view = 'dashboard';
                    
                    console.log(`Sessão recuperada: ${dados.usuario.nome} (${dados.perfil})`);
                    
                    document.dispatchEvent(new CustomEvent('login', { detail: dados.usuario }));
                    
                    // Registrar no módulo de gamificação
                    if (typeof MODULO_GAMIFICACAO !== 'undefined') {
                        MODULO_GAMIFICACAO.registrarLogin?.(dados.usuario.id);
                    }
                } else {
                    localStorage.removeItem(CONFIG.storageKey);
                }
            }
        } catch (erro) {
            console.error('Erro ao verificar sessão:', erro);
        }
    }

    function fazerLogin(email, senha, perfil) {
        if (!email || !senha || !perfil) {
            mostrarMensagem('Preencha todos os campos!', 'error');
            return;
        }

        mostrarLoading('Autenticando...');

        setTimeout(async () => {
            try {
                const usuario = MOCK_DATA.usuarios.find(u => 
                    u.email.toLowerCase() === email.toLowerCase() && 
                    u.senha === senha && 
                    u.perfil === perfil
                );

                if (usuario) {
                    // Verificar 2FA se estiver ativo
                    if (typeof MODULO_2FA !== 'undefined' && MODULO_2FA.usuarioTem2FA?.(usuario.id)) {
                        esconderLoading();
                        
                        const resultado = await MODULO_2FA.iniciarAutenticacao2FA?.(usuario);
                        
                        if (resultado?.necessario) {
                            MODULO_2FA.mostrarModalVerificacao?.(usuario, (valido) => {
                                if (valido) {
                                    completarLogin(usuario);
                                }
                            });
                            return;
                        }
                    }
                    
                    completarLogin(usuario);
                } else {
                    esconderLoading();
                    mostrarMensagem('Email, senha ou perfil incorretos!', 'error');
                    document.getElementById('password').value = '';
                    
                    // Registrar falha de login
                    if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                        MODULO_AUDITORIA_AVANCADA.registrarLogSeguranca?.(
                            'Tentativa de login falhou',
                            { email, perfil }
                        );
                    }
                }
            } catch (erro) {
                esconderLoading();
                mostrarMensagem('Erro ao processar login', 'error');
                console.error(erro);
            }
        }, 1000);
    }

    function completarLogin(usuario) {
        Estado.autenticado = true;
        Estado.usuario = usuario;
        Estado.perfil = usuario.perfil;
        Estado.view = 'dashboard';

        const sessao = {
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil,
                escolaId: usuario.escolaId
            },
            perfil: usuario.perfil,
            expira: Date.now() + CONFIG.sessionTimeout
        };
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(sessao));

        esconderLoading();
        mostrarMensagem(`Bem-vindo(a), ${usuario.nome}!`, 'success');
        
        document.dispatchEvent(new CustomEvent('login', { detail: usuario }));
        
        // Registrar no módulo de auditoria
        if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
            MODULO_AUDITORIA_AVANCADA.registrarLog?.(
                'Login realizado com sucesso',
                MODULO_AUDITORIA_AVANCADA.categorias?.AUTENTICACAO || 'auth',
                MODULO_AUDITORIA_AVANCADA.niveis?.INFO || 'info'
            );
        }
        
        atualizarInterface();
        navegarPara('dashboard', 'home');
    }

    function fazerLogout() {
        mostrarLoading('Saindo...');

        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('logout', { detail: Estado.usuario }));
            
            // Registrar logout
            if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                MODULO_AUDITORIA_AVANCADA.registrarLog?.(
                    'Logout realizado',
                    MODULO_AUDITORIA_AVANCADA.categorias?.AUTENTICACAO || 'auth',
                    MODULO_AUDITORIA_AVANCADA.niveis?.INFO || 'info'
                );
            }
            
            Estado.autenticado = false;
            Estado.usuario = null;
            Estado.perfil = null;
            Estado.view = 'login';

            localStorage.removeItem(CONFIG.storageKey);

            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('login-type').value = '';

            esconderLoading();
            mostrarMensagem('Logout realizado com sucesso!', 'info');
            
            atualizarInterface();
        }, 500);
    }

    // ==================== FUNÇÕES DE INTERFACE ====================
    function atualizarInterface() {
        const telaLogin = document.getElementById('login-screen');
        const telaDashboard = document.getElementById('dashboard-screen');

        if (Estado.view === 'login') {
            telaLogin?.classList.add('active');
            telaDashboard?.classList.remove('active');
        } else {
            telaLogin?.classList.remove('active');
            telaDashboard?.classList.add('active');
            
            document.getElementById('current-user').textContent = Estado.usuario?.nome || 'Usuário';
            document.getElementById('current-role').textContent = getNomePerfil(Estado.perfil);
            
            carregarMenu();
        }
    }

    function getNomePerfil(perfil) {
        const nomes = {
            'secretaria': 'Secretaria da Educação',
            'diretor': 'Diretor de Escola',
            'professor': 'Professor',
            'aluno': 'Aluno'
        };
        return nomes[perfil] || perfil;
    }

    function carregarMenu() {
        const menu = document.getElementById('sidebar-menu');
        if (!menu) return;

        menu.innerHTML = '';

        const itens = getItensMenu();
        
        itens.forEach(item => {
            const li = document.createElement('li');
            li.className = 'menu-item';
            
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'menu-link';
            a.setAttribute('data-modulo', item.modulo);
            a.setAttribute('data-secao', item.secao);
            a.innerHTML = `<i class="${item.icone}"></i> <span>${item.titulo}</span>`;
            
            a.addEventListener('click', (e) => {
                e.preventDefault();
                navegarPara(item.modulo, item.secao);
            });
            
            li.appendChild(a);
            menu.appendChild(li);
        });

        document.querySelectorAll('.menu-link').forEach(link => {
            if (link.dataset.modulo === Estado.modulo && link.dataset.secao === Estado.secao) {
                link.classList.add('active');
            }
        });
    }

    function getItensMenu() {
        const base = [
            { modulo: 'dashboard', secao: 'home', icone: 'fas fa-home', titulo: 'Dashboard' }
        ];

        const menus = {
            'secretaria': [
                ...base,
                // Fase 1 - Básicos
                { modulo: 'escolas', secao: 'listar', icone: 'fas fa-school', titulo: 'Escolas' },
                { modulo: 'professores', secao: 'listar', icone: 'fas fa-chalkboard-teacher', titulo: 'Professores' },
                { modulo: 'alunos', secao: 'listar', icone: 'fas fa-graduation-cap', titulo: 'Alunos' },
                { modulo: 'turmas', secao: 'listar', icone: 'fas fa-users', titulo: 'Turmas' },
                { modulo: 'biblioteca', secao: 'listar', icone: 'fas fa-book', titulo: 'Biblioteca' },
                { modulo: 'merenda', secao: 'cardapio', icone: 'fas fa-utensils', titulo: 'Merenda' },
                { modulo: 'transporte', secao: 'rotas', icone: 'fas fa-bus', titulo: 'Transporte' },
                { modulo: 'ocorrencias', secao: 'listar', icone: 'fas fa-exclamation-triangle', titulo: 'Ocorrências' },
                { modulo: 'reunioes', secao: 'listar', icone: 'fas fa-calendar-alt', titulo: 'Reuniões' },
                { modulo: 'projetos', secao: 'listar', icone: 'fas fa-project-diagram', titulo: 'Projetos' },
                { modulo: 'saude', secao: 'listar', icone: 'fas fa-heartbeat', titulo: 'Saúde' },
                { modulo: 'bolsas', secao: 'listar', icone: 'fas fa-hand-holding-heart', titulo: 'Bolsas' },
                { modulo: 'estagio', secao: 'listar', icone: 'fas fa-briefcase', titulo: 'Estágio' },
                { modulo: 'monitoria', secao: 'listar', icone: 'fas fa-user-graduate', titulo: 'Monitoria' },
                { modulo: 'competicoes', secao: 'listar', icone: 'fas fa-trophy', titulo: 'Competições' },
                { modulo: 'horas', secao: 'listar', icone: 'fas fa-clock', titulo: 'Horas Complementares' },
                { modulo: 'pesquisas', secao: 'listar', icone: 'fas fa-poll', titulo: 'Pesquisas' },
                { modulo: 'documentos', secao: 'listar', icone: 'fas fa-file-alt', titulo: 'Documentos' },
                { modulo: 'uniforme', secao: 'listar', icone: 'fas fa-tshirt', titulo: 'Uniforme' },
                { modulo: 'cursos', secao: 'listar', icone: 'fas fa-graduation-cap', titulo: 'Cursos' },
                { modulo: 'feedback', secao: 'listar', icone: 'fas fa-star', titulo: 'Feedback' },
                { modulo: 'relatorios', secao: 'listar', icone: 'fas fa-chart-bar', titulo: 'Relatórios' },
                
                // Fase 2 - Melhorias
                { modulo: 'notificacoes', secao: 'listar', icone: 'fas fa-bell', titulo: 'Notificações' },
                { modulo: 'graficos', secao: 'painel', icone: 'fas fa-chart-pie', titulo: 'Gráficos' },
                { modulo: 'busca', secao: 'avancada', icone: 'fas fa-search', titulo: 'Busca Avançada' },
                { modulo: 'temas', secao: 'configurar', icone: 'fas fa-palette', titulo: 'Temas' },
                { modulo: 'pwa', secao: 'configurar', icone: 'fas fa-mobile-alt', titulo: 'App' },
                { modulo: 'exportacao', secao: 'relatorios', icone: 'fas fa-download', titulo: 'Exportar' },
                { modulo: 'backup', secao: 'gerenciar', icone: 'fas fa-database', titulo: 'Backup' },
                
                // Fase 3 - Avançados
                { modulo: 'auditoria', secao: 'visualizar', icone: 'fas fa-clipboard-list', titulo: 'Auditoria' },
                { modulo: '2fa', secao: 'configurar', icone: 'fas fa-shield-alt', titulo: '2FA' },
                { modulo: 'api', secao: 'documentacao', icone: 'fas fa-code', titulo: 'API' },
                { modulo: 'i18n', secao: 'idiomas', icone: 'fas fa-language', titulo: 'Idiomas' },
                { modulo: 'acessibilidade', secao: 'configurar', icone: 'fas fa-universal-access', titulo: 'Acessibilidade' },
                { modulo: 'cache', secao: 'estatisticas', icone: 'fas fa-database', titulo: 'Cache' },
                { modulo: 'dashboard-custom', secao: 'editar', icone: 'fas fa-edit', titulo: 'Dashboard' },
                
                // Fase 4 - IA
                { modulo: 'ia-previsao', secao: 'painel', icone: 'fas fa-chart-line', titulo: 'Previsão IA' },
                { modulo: 'ia-recomendacao', secao: 'painel', icone: 'fas fa-lightbulb', titulo: 'Recomendações IA' },
                { modulo: 'ia-evasao', secao: 'painel', icone: 'fas fa-exclamation-triangle', titulo: 'Risco Evasão' },
                { modulo: 'chatbot', secao: 'abrir', icone: 'fas fa-robot', titulo: 'Assistente IA' },
                
                // Fase 5 - Otimização
                { modulo: 'cache-avancado', secao: 'estatisticas', icone: 'fas fa-rocket', titulo: 'Cache Avançado' },
                { modulo: 'otimizacao', secao: 'metricas', icone: 'fas fa-tachometer-alt', titulo: 'Performance' },
                { modulo: 'offline', secao: 'status', icone: 'fas fa-wifi', titulo: 'Modo Offline' },
                { modulo: 'sincronizacao', secao: 'status', icone: 'fas fa-sync-alt', titulo: 'Sincronização' },
                
                // Fase 6 - Segurança
                { modulo: 'lgpd', secao: 'configuracoes', icone: 'fas fa-shield-alt', titulo: 'LGPD' },
                { modulo: 'auditoria-avancada', secao: 'painel', icone: 'fas fa-chart-line', titulo: 'Auditoria Avançada' },
                { modulo: 'acesso-granular', secao: 'permissoes', icone: 'fas fa-lock', titulo: 'Controle Acesso' },
                { modulo: 'backup-nuvem', secao: 'painel', icone: 'fas fa-cloud-upload-alt', titulo: 'Backup Nuvem' },
                
                // Fase 7 - Experiência
                { modulo: 'tutorial', secao: 'iniciar', icone: 'fas fa-graduation-cap', titulo: 'Tutorial' },
                { modulo: 'feedback-usuario', secao: 'enviar', icone: 'fas fa-comment', titulo: 'Feedback' },
                { modulo: 'gamificacao', secao: 'painel', icone: 'fas fa-trophy', titulo: 'Gamificação' },
                { modulo: 'notificacoes-push', secao: 'configuracoes', icone: 'fas fa-bell', titulo: 'Push' },
                
                // Fase 8 - Integrações
                { modulo: 'api-governo', secao: 'painel', icone: 'fas fa-landmark', titulo: 'API Governo' },
                { modulo: 'integracoes-externas', secao: 'painel', icone: 'fas fa-plug', titulo: 'Integrações' },
                { modulo: 'importacao-exportacao', secao: 'painel', icone: 'fas fa-exchange-alt', titulo: 'Import/Export' },
                { modulo: 'webhooks', secao: 'painel', icone: 'fas fa-link', titulo: 'Webhooks' },
                
                { modulo: 'perfil', secao: 'ver', icone: 'fas fa-user', titulo: 'Meu Perfil' }
            ],

            'diretor': [
                ...base,
                { modulo: 'escola', secao: 'ver', icone: 'fas fa-school', titulo: 'Minha Escola' },
                { modulo: 'professores', secao: 'listar', icone: 'fas fa-chalkboard-teacher', titulo: 'Professores' },
                { modulo: 'alunos', secao: 'listar', icone: 'fas fa-graduation-cap', titulo: 'Alunos' },
                { modulo: 'turmas', secao: 'listar', icone: 'fas fa-users', titulo: 'Turmas' },
                { modulo: 'ocorrencias', secao: 'listar', icone: 'fas fa-exclamation-triangle', titulo: 'Ocorrências' },
                { modulo: 'reunioes', secao: 'listar', icone: 'fas fa-calendar-alt', titulo: 'Reuniões' },
                { modulo: 'projetos', secao: 'listar', icone: 'fas fa-project-diagram', titulo: 'Projetos' },
                { modulo: 'saude', secao: 'alunos', icone: 'fas fa-heartbeat', titulo: 'Saúde' },
                { modulo: 'bolsas', secao: 'listar', icone: 'fas fa-hand-holding-heart', titulo: 'Bolsas' },
                { modulo: 'monitoria', secao: 'listar', icone: 'fas fa-user-graduate', titulo: 'Monitoria' },
                { modulo: 'competicoes', secao: 'listar', icone: 'fas fa-trophy', titulo: 'Competições' },
                { modulo: 'pesquisas', secao: 'listar', icone: 'fas fa-poll', titulo: 'Pesquisas' },
                { modulo: 'documentos', secao: 'listar', icone: 'fas fa-file-alt', titulo: 'Documentos' },
                { modulo: 'uniforme', secao: 'listar', icone: 'fas fa-tshirt', titulo: 'Uniforme' },
                { modulo: 'cursos', secao: 'listar', icone: 'fas fa-graduation-cap', titulo: 'Cursos' },
                { modulo: 'feedback', secao: 'listar', icone: 'fas fa-star', titulo: 'Feedback' },
                { modulo: 'relatorios', secao: 'listar', icone: 'fas fa-chart-bar', titulo: 'Relatórios' },
                { modulo: 'exportacao', secao: 'escola', icone: 'fas fa-download', titulo: 'Exportar' },
                { modulo: 'auditoria', secao: 'visualizar', icone: 'fas fa-clipboard-list', titulo: 'Auditoria' },
                { modulo: 'ia-previsao', secao: 'painel', icone: 'fas fa-chart-line', titulo: 'Previsão IA' },
                { modulo: 'ia-evasao', secao: 'painel', icone: 'fas fa-exclamation-triangle', titulo: 'Risco Evasão' },
                { modulo: 'chatbot', secao: 'abrir', icone: 'fas fa-robot', titulo: 'Assistente IA' },
                { modulo: 'lgpd', secao: 'configuracoes', icone: 'fas fa-shield-alt', titulo: 'LGPD' },
                { modulo: 'auditoria-avancada', secao: 'painel', icone: 'fas fa-chart-line', titulo: 'Auditoria Avançada' },
                { modulo: 'acesso-granular', secao: 'permissoes', icone: 'fas fa-lock', titulo: 'Controle Acesso' },
                { modulo: 'tutorial', secao: 'iniciar', icone: 'fas fa-graduation-cap', titulo: 'Tutorial' },
                { modulo: 'feedback-usuario', secao: 'enviar', icone: 'fas fa-comment', titulo: 'Feedback' },
                { modulo: 'gamificacao', secao: 'painel', icone: 'fas fa-trophy', titulo: 'Gamificação' },
                { modulo: 'notificacoes-push', secao: 'configuracoes', icone: 'fas fa-bell', titulo: 'Push' },
                { modulo: 'api-governo', secao: 'painel', icone: 'fas fa-landmark', titulo: 'API Governo' },
                { modulo: 'integracoes-externas', secao: 'painel', icone: 'fas fa-plug', titulo: 'Integrações' },
                { modulo: 'importacao-exportacao', secao: 'painel', icone: 'fas fa-exchange-alt', titulo: 'Import/Export' },
                { modulo: 'webhooks', secao: 'painel', icone: 'fas fa-link', titulo: 'Webhooks' },
                { modulo: 'perfil', secao: 'ver', icone: 'fas fa-user', titulo: 'Meu Perfil' }
            ],

            'professor': [
                ...base,
                { modulo: 'turmas', secao: 'minhas', icone: 'fas fa-users', titulo: 'Minhas Turmas' },
                { modulo: 'notas', secao: 'lancar', icone: 'fas fa-edit', titulo: 'Lançar Notas' },
                { modulo: 'frequencia', secao: 'registrar', icone: 'fas fa-clipboard-check', titulo: 'Frequência' },
                { modulo: 'atividades', secao: 'listar', icone: 'fas fa-tasks', titulo: 'Atividades' },
                { modulo: 'alunos', secao: 'meus', icone: 'fas fa-graduation-cap', titulo: 'Meus Alunos' },
                { modulo: 'planejamento', secao: 'listar', icone: 'fas fa-calendar-alt', titulo: 'Planejamento' },
                { modulo: 'horario', secao: 'professor', icone: 'fas fa-clock', titulo: 'Meu Horário' },
                { modulo: 'biblioteca', secao: 'consulta', icone: 'fas fa-book', titulo: 'Biblioteca' },
                { modulo: 'merenda', secao: 'cardapio', icone: 'fas fa-utensils', titulo: 'Merenda' },
                { modulo: 'transporte', secao: 'rotas', icone: 'fas fa-bus', titulo: 'Transporte' },
                { modulo: 'saude', secao: 'alunos', icone: 'fas fa-heartbeat', titulo: 'Saúde' },
                { modulo: 'monitoria', secao: 'listar', icone: 'fas fa-user-graduate', titulo: 'Monitoria' },
                { modulo: 'competicoes', secao: 'listar', icone: 'fas fa-trophy', titulo: 'Competições' },
                { modulo: 'cursos', secao: 'listar', icone: 'fas fa-graduation-cap', titulo: 'Formação' },
                { modulo: 'feedback', secao: 'listar', icone: 'fas fa-star', titulo: 'Feedback' },
                { modulo: 'relatorios', secao: 'listar', icone: 'fas fa-chart-bar', titulo: 'Relatórios' },
                { modulo: 'exportacao', secao: 'turmas', icone: 'fas fa-download', titulo: 'Exportar' },
                { modulo: 'ia-recomendacao', secao: 'painel', icone: 'fas fa-lightbulb', titulo: 'Recomendações IA' },
                { modulo: 'ia-previsao', secao: 'painel', icone: 'fas fa-chart-line', titulo: 'Previsão IA' },
                { modulo: 'chatbot', secao: 'abrir', icone: 'fas fa-robot', titulo: 'Assistente IA' },
                { modulo: 'lgpd', secao: 'configuracoes', icone: 'fas fa-shield-alt', titulo: 'LGPD' },
                { modulo: 'tutorial', secao: 'iniciar', icone: 'fas fa-graduation-cap', titulo: 'Tutorial' },
                { modulo: 'feedback-usuario', secao: 'enviar', icone: 'fas fa-comment', titulo: 'Feedback' },
                { modulo: 'gamificacao', secao: 'painel', icone: 'fas fa-trophy', titulo: 'Gamificação' },
                { modulo: 'notificacoes-push', secao: 'configuracoes', icone: 'fas fa-bell', titulo: 'Push' },
                { modulo: 'importacao-exportacao', secao: 'painel', icone: 'fas fa-exchange-alt', titulo: 'Import/Export' },
                { modulo: 'perfil', secao: 'ver', icone: 'fas fa-user', titulo: 'Meu Perfil' }
            ],

            'aluno': [
                ...base,
                { modulo: 'boletim', secao: 'ver', icone: 'fas fa-file-alt', titulo: 'Meu Boletim' },
                { modulo: 'notas', secao: 'minhas', icone: 'fas fa-chart-line', titulo: 'Minhas Notas' },
                { modulo: 'faltas', secao: 'ver', icone: 'fas fa-calendar-times', titulo: 'Minhas Faltas' },
                { modulo: 'horario', secao: 'ver', icone: 'fas fa-clock', titulo: 'Meu Horário' },
                { modulo: 'atividades', secao: 'pendentes', icone: 'fas fa-tasks', titulo: 'Atividades' },
                { modulo: 'biblioteca', secao: 'emprestimos', icone: 'fas fa-book', titulo: 'Biblioteca' },
                { modulo: 'merenda', secao: 'cardapio', icone: 'fas fa-utensils', titulo: 'Merenda' },
                { modulo: 'transporte', secao: 'meu', icone: 'fas fa-bus', titulo: 'Meu Transporte' },
                { modulo: 'eventos', secao: 'listar', icone: 'fas fa-calendar', titulo: 'Eventos' },
                { modulo: 'projetos', secao: 'participar', icone: 'fas fa-project-diagram', titulo: 'Projetos' },
                { modulo: 'saude', secao: 'meu', icone: 'fas fa-heartbeat', titulo: 'Minha Saúde' },
                { modulo: 'monitoria', secao: 'solicitar', icone: 'fas fa-user-graduate', titulo: 'Monitoria' },
                { modulo: 'competicoes', secao: 'inscricoes', icone: 'fas fa-trophy', titulo: 'Competições' },
                { modulo: 'horas', secao: 'complementares', icone: 'fas fa-clock', titulo: 'Horas Complementares' },
                { modulo: 'estagio', secao: 'ver', icone: 'fas fa-briefcase', titulo: 'Estágio' },
                { modulo: 'documentos', secao: 'meus', icone: 'fas fa-file-alt', titulo: 'Meus Documentos' },
                { modulo: 'uniforme', secao: 'solicitar', icone: 'fas fa-tshirt', titulo: 'Uniforme' },
                { modulo: 'cursos', secao: 'meus', icone: 'fas fa-graduation-cap', titulo: 'Meus Cursos' },
                { modulo: 'feedback', secao: 'meu', icone: 'fas fa-star', titulo: 'Meu Feedback' },
                { modulo: 'relatorios', secao: 'meus', icone: 'fas fa-chart-bar', titulo: 'Meus Relatórios' },
                { modulo: 'ia-recomendacao', secao: 'painel', icone: 'fas fa-lightbulb', titulo: 'Recomendações IA' },
                { modulo: 'chatbot', secao: 'abrir', icone: 'fas fa-robot', titulo: 'Assistente IA' },
                { modulo: 'tutorial', secao: 'iniciar', icone: 'fas fa-graduation-cap', titulo: 'Tutorial' },
                { modulo: 'feedback-usuario', secao: 'enviar', icone: 'fas fa-comment', titulo: 'Feedback' },
                { modulo: 'gamificacao', secao: 'painel', icone: 'fas fa-trophy', titulo: 'Gamificação' },
                { modulo: 'notificacoes-push', secao: 'configuracoes', icone: 'fas fa-bell', titulo: 'Push' },
                { modulo: 'perfil', secao: 'ver', icone: 'fas fa-user', titulo: 'Meu Perfil' }
            ]
        };

        return menus[Estado.perfil] || base;
    }

    function navegarPara(modulo, secao, parametro = null) {
        Estado.modulo = modulo;
        Estado.secao = secao;

        const titulo = document.getElementById('dashboard-title');
        const itemAtual = getItensMenu().find(i => i.modulo === modulo && i.secao === secao);
        if (titulo && itemAtual) {
            titulo.textContent = itemAtual.titulo;
        }

        carregarConteudo(modulo, secao, parametro);

        document.querySelectorAll('.menu-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.modulo === modulo && link.dataset.secao === secao) {
                link.classList.add('active');
            }
        });
    }

    function carregarConteudo(modulo, secao, parametro = null) {
        const area = document.getElementById('content-area');
        if (!area) return;

        area.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">Carregando...</div>
            </div>
        `;

        setTimeout(() => {
            let html = '';

            try {
                switch(modulo) {
                    // Dashboard
                    case 'dashboard':
                        html = renderizarDashboard();
                        break;
                        
                    // Perfil
                    case 'perfil':
                        html = renderizarPerfil();
                        break;
                        
                    // === FASE 1 - MÓDULOS BÁSICOS ===
                    case 'escolas':
                        html = MODULO_SECRETARIA?.renderizarEscolas?.(secao) || 
                               '<p>Módulo de Escolas não disponível</p>';
                        break;
                        
                    case 'professores':
                        html = MODULO_SECRETARIA?.renderizarProfessores?.(secao) || 
                               '<p>Módulo de Professores não disponível</p>';
                        break;
                        
                    case 'alunos':
                        if (Estado.perfil === 'professor') {
                            html = MODULO_PROFESSOR?.renderizarMeusAlunos?.(secao) || 
                                   '<p>Módulo de Alunos não disponível</p>';
                        } else {
                            html = MODULO_SECRETARIA?.renderizarAlunos?.(secao) || 
                                   '<p>Módulo de Alunos não disponível</p>';
                        }
                        break;
                        
                    case 'turmas':
                        if (Estado.perfil === 'professor') {
                            html = MODULO_PROFESSOR?.renderizarMinhasTurmas?.(secao) || 
                                   '<p>Módulo de Turmas não disponível</p>';
                        } else {
                            html = MODULO_SECRETARIA?.renderizarTurmas?.(secao) || 
                                   '<p>Módulo de Turmas não disponível</p>';
                        }
                        break;
                        
                    case 'escola':
                        html = MODULO_DIRETOR?.renderizarMinhaEscola?.(secao) || 
                               '<p>Módulo de Escola não disponível</p>';
                        break;
                        
                    case 'notas':
                        if (Estado.perfil === 'professor') {
                            html = MODULO_PROFESSOR?.renderizarLancarNotas?.(secao, parametro) || 
                                   '<p>Módulo de Notas não disponível</p>';
                        } else if (Estado.perfil === 'aluno') {
                            html = MODULO_ALUNO?.renderizarMinhasNotas?.(secao) || 
                                   '<p>Módulo de Notas não disponível</p>';
                        }
                        break;
                        
                    case 'frequencia':
                        if (Estado.perfil === 'professor') {
                            html = MODULO_PROFESSOR?.renderizarRegistrarFrequencia?.(secao, parametro) || 
                                   '<p>Módulo de Frequência não disponível</p>';
                        }
                        break;
                        
                    case 'boletim':
                        html = MODULO_ALUNO?.renderizarBoletim?.(secao) || 
                               '<p>Módulo de Boletim não disponível</p>';
                        break;
                        
                    case 'faltas':
                        html = MODULO_ALUNO?.renderizarMinhasFaltas?.(secao) || 
                               '<p>Módulo de Faltas não disponível</p>';
                        break;
                        
                    case 'horario':
                        if (Estado.perfil === 'professor') {
                            html = MODULO_PROFESSOR?.renderizarHorario?.(secao) || 
                                   '<p>Módulo de Horário não disponível</p>';
                        } else if (Estado.perfil === 'aluno') {
                            html = MODULO_ALUNO?.renderizarMeuHorario?.(secao) || 
                                   '<p>Módulo de Horário não disponível</p>';
                        }
                        break;
                        
                    case 'biblioteca':
                        html = MODULO_BIBLIOTECA?.renderizarLivros?.(secao) || 
                               '<p>Módulo de Biblioteca não disponível</p>';
                        break;
                        
                    case 'merenda':
                        html = MODULO_MERENDA?.renderizarCardapio?.(secao) || 
                               '<p>Módulo de Merenda não disponível</p>';
                        break;
                        
                    case 'transporte':
                        if (Estado.perfil === 'aluno') {
                            html = MODULO_TRANSPORTE?.renderizarMeuTransporte?.(secao) || 
                                   '<p>Módulo de Transporte não disponível</p>';
                        } else {
                            html = MODULO_TRANSPORTE?.renderizarRotas?.(secao) || 
                                   '<p>Módulo de Transporte não disponível</p>';
                        }
                        break;
                        
                    case 'ocorrencias':
                        html = MODULO_DIRETOR?.renderizarOcorrencias?.(secao) || 
                               '<p>Módulo de Ocorrências não disponível</p>';
                        break;
                        
                    case 'reunioes':
                        html = MODULO_REUNIOES?.renderizarReunioes?.(secao) || 
                               '<p>Módulo de Reuniões não disponível</p>';
                        break;
                        
                    case 'projetos':
                        html = MODULO_PROJETOS?.renderizarProjetos?.(secao) || 
                               '<p>Módulo de Projetos não disponível</p>';
                        break;
                        
                    case 'saude':
                        html = MODULO_SAUDE?.renderizarSaudeAlunos?.(secao) || 
                               '<p>Módulo de Saúde não disponível</p>';
                        break;
                        
                    case 'bolsas':
                        html = MODULO_BOLSAS?.renderizarBolsas?.(secao) || 
                               '<p>Módulo de Bolsas não disponível</p>';
                        break;
                        
                    case 'estagio':
                        html = MODULO_ESTAGIO?.renderizarMeuEstagio?.(secao) || 
                               '<p>Módulo de Estágio não disponível</p>';
                        break;
                        
                    case 'monitoria':
                        html = MODULO_MONITORIA?.renderizarMonitorias?.(secao) || 
                               '<p>Módulo de Monitoria não disponível</p>';
                        break;
                        
                    case 'competicoes':
                        html = MODULO_COMPETICOES?.renderizarCompeticoes?.(secao) || 
                               '<p>Módulo de Competições não disponível</p>';
                        break;
                        
                    case 'horas':
                        html = MODULO_HORAS?.renderizarHorasComplementares?.(secao) || 
                               '<p>Módulo de Horas Complementares não disponível</p>';
                        break;
                        
                    case 'pesquisas':
                        html = MODULO_PESQUISAS?.renderizarPesquisas?.(secao) || 
                               '<p>Módulo de Pesquisas não disponível</p>';
                        break;
                        
                    case 'documentos':
                        html = MODULO_DOCUMENTOS?.renderizarDocumentos?.(secao) || 
                               '<p>Módulo de Documentos não disponível</p>';
                        break;
                        
                    case 'uniforme':
                        html = MODULO_UNIFORME?.renderizarUniforme?.(secao) || 
                               '<p>Módulo de Uniforme não disponível</p>';
                        break;
                        
                    case 'cursos':
                        html = MODULO_CURSOS?.renderizarCursos?.(secao) || 
                               '<p>Módulo de Cursos não disponível</p>';
                        break;
                        
                    case 'feedback':
                        html = MODULO_FEEDBACK?.renderizarFeedbacks?.(secao) || 
                               '<p>Módulo de Feedback não disponível</p>';
                        break;
                        
                    case 'relatorios':
                        html = MODULO_RELATORIOS?.renderizarRelatorios?.(secao) || 
                               '<p>Módulo de Relatórios não disponível</p>';
                        break;
                        
                    case 'atividades':
                        if (Estado.perfil === 'professor') {
                            html = MODULO_ATIVIDADES?.renderizarAtividades?.(secao) || 
                                   '<p>Módulo de Atividades não disponível</p>';
                        } else if (Estado.perfil === 'aluno') {
                            html = MODULO_ALUNO?.renderizarAtividadesPendentes?.(secao) || 
                                   '<p>Módulo de Atividades não disponível</p>';
                        }
                        break;
                        
                    // === FASE 2 - MÓDULOS DE MELHORIAS ===
                    case 'notificacoes':
                        if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                            MODULO_NOTIFICACOES.abrirCentralNotificacoes?.();
                            return;
                        }
                        break;
                        
                    case 'graficos':
                        html = `
                            <div class="graficos-container">
                                <h2>Gráficos e Estatísticas</h2>
                                <div class="grafico-row">
                                    <div class="grafico-card">
                                        <canvas id="grafico-desempenho" style="height: 300px;"></canvas>
                                    </div>
                                    <div class="grafico-card">
                                        <canvas id="grafico-distribuicao" style="height: 300px;"></canvas>
                                    </div>
                                </div>
                            </div>
                        `;
                        setTimeout(() => {
                            if (typeof MODULO_GRAFICOS !== 'undefined') {
                                MODULO_GRAFICOS.criarGraficoDesempenhoGeral?.('grafico-desempenho', {});
                                MODULO_GRAFICOS.criarGraficoDistribuicaoAlunos?.('grafico-distribuicao', {});
                            }
                        }, 500);
                        break;
                        
                    case 'busca':
                        if (typeof MODULO_BUSCA !== 'undefined') {
                            document.getElementById('busca-global')?.focus();
                            mostrarMensagem('Digite sua busca no campo superior', 'info');
                            return;
                        }
                        break;
                        
                    case 'temas':
                        if (typeof MODULO_TEMAS !== 'undefined') {
                            MODULO_TEMAS.abrirSeletorTemas?.();
                            return;
                        }
                        break;
                        
                    case 'pwa':
                        if (typeof MODULO_PWA !== 'undefined') {
                            MODULO_PWA.mostrarInfoPWA?.();
                            return;
                        }
                        break;
                        
                    case 'exportacao':
                        if (typeof MODULO_EXPORTACAO !== 'undefined') {
                            const dados = obterDadosParaExportacao(secao);
                            MODULO_EXPORTACAO.criarModalExportacao?.(secao, dados);
                            return;
                        }
                        break;
                        
                    case 'backup':
                        if (typeof MODULO_BACKUP !== 'undefined') {
                            MODULO_BACKUP.abrirPainelBackup?.();
                            return;
                        }
                        break;
                        
                    // === FASE 3 - MÓDULOS AVANÇADOS ===
                    case 'auditoria':
                        if (typeof MODULO_AUDITORIA !== 'undefined') {
                            MODULO_AUDITORIA.abrirPainelAuditoria?.();
                            return;
                        }
                        break;
                        
                    case '2fa':
                        if (typeof MODULO_2FA !== 'undefined') {
                            MODULO_2FA.mostrarModalConfiguracao?.();
                            return;
                        }
                        break;
                        
                    case 'api':
                        if (typeof MODULO_API !== 'undefined') {
                            html = `
                                <div class="api-docs">
                                    <h2>Documentação da API</h2>
                                    <p>Endpoints disponíveis para integração.</p>
                                    <pre>${JSON.stringify(MODULO_API.getEndpoints?.() || {}, null, 2)}</pre>
                                </div>
                            `;
                        }
                        break;
                        
                    case 'i18n':
                        if (typeof MODULO_I18N !== 'undefined') {
                            MODULO_I18N.abrirConfiguracoes?.();
                            return;
                        }
                        break;
                        
                    case 'acessibilidade':
                        if (typeof MODULO_ACESSIBILIDADE !== 'undefined') {
                            document.getElementById('acessibilidade-menu')?.classList.add('aberto');
                            mostrarMensagem('Menu de acessibilidade aberto', 'info');
                            return;
                        }
                        break;
                        
                    case 'cache':
                        if (typeof MODULO_CACHE !== 'undefined') {
                            const stats = MODULO_CACHE.getEstatisticas?.() || {};
                            html = `
                                <div class="cache-panel">
                                    <h2>Estatísticas do Cache</h2>
                                    <pre>${JSON.stringify(stats, null, 2)}</pre>
                                </div>
                            `;
                        }
                        break;
                        
                    case 'dashboard-custom':
                        if (typeof MODULO_DASHBOARD_CUSTOM !== 'undefined') {
                            MODULO_DASHBOARD_CUSTOM.entrarModoEdicao?.();
                            mostrarMensagem('Modo de edição do dashboard ativado', 'success');
                            navegarPara('dashboard', 'home');
                            return;
                        }
                        break;
                        
                    // === FASE 4 - MÓDULOS DE IA ===
                    case 'ia-previsao':
                        if (typeof MODULO_IA_PREVISAO !== 'undefined') {
                            MODULO_IA_PREVISAO.mostrarPainelIA?.();
                            return;
                        }
                        break;
                        
                    case 'ia-recomendacao':
                        if (typeof MODULO_IA_RECOMENDACAO !== 'undefined') {
                            const aluno = MOCK_DATA.alunos?.find(a => a.email === Estado.usuario?.email);
                            if (aluno) {
                                MODULO_IA_RECOMENDACAO.mostrarPainelRecomendacoes?.(aluno.id);
                                return;
                            }
                        }
                        break;
                        
                    case 'ia-evasao':
                        if (typeof MODULO_IA_EVASAO !== 'undefined') {
                            MODULO_IA_EVASAO.mostrarPainelEvasao?.();
                            return;
                        }
                        break;
                        
                    case 'chatbot':
                        if (typeof MODULO_CHATBOT !== 'undefined') {
                            MODULO_CHATBOT.abrirChatbot?.();
                            return;
                        }
                        break;
                        
                    // === FASE 5 - MÓDULOS DE OTIMIZAÇÃO ===
                    case 'cache-avancado':
                        if (typeof MODULO_CACHE_AVANCADO !== 'undefined') {
                            const stats = MODULO_CACHE_AVANCADO.getEstatisticas?.() || {};
                            html = `
                                <div class="cache-avancado-panel">
                                    <h2>Cache Avançado</h2>
                                    <pre>${JSON.stringify(stats, null, 2)}</pre>
                                </div>
                            `;
                        }
                        break;
                        
                    case 'otimizacao':
                        if (typeof MODULO_OTIMIZACAO !== 'undefined') {
                            const metricas = MODULO_OTIMIZACAO.getMetricas?.() || {};
                            html = `
                                <div class="otimizacao-panel">
                                    <h2>Performance</h2>
                                    <pre>${JSON.stringify(metricas, null, 2)}</pre>
                                </div>
                            `;
                        }
                        break;
                        
                    case 'offline':
                        if (typeof MODULO_OFFLINE !== 'undefined') {
                            const status = MODULO_OFFLINE.getStatus?.() || {};
                            html = `
                                <div class="offline-panel">
                                    <h2>Status Offline</h2>
                                    <pre>${JSON.stringify(status, null, 2)}</pre>
                                </div>
                            `;
                        }
                        break;
                        
                    case 'sincronizacao':
                        if (typeof MODULO_SINCRONIZACAO !== 'undefined') {
                            const status = MODULO_SINCRONIZACAO.getStatus?.() || {};
                            html = `
                                <div class="sincronizacao-panel">
                                    <h2>Sincronização</h2>
                                    <pre>${JSON.stringify(status, null, 2)}</pre>
                                </div>
                            `;
                        }
                        break;
                        
                    // === FASE 6 - MÓDULOS DE SEGURANÇA ===
                    case 'lgpd':
                        if (typeof MODULO_LGPD !== 'undefined') {
                            MODULO_LGPD.abrirConfiguracoes?.();
                            return;
                        }
                        break;
                        
                    case 'auditoria-avancada':
                        if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                            MODULO_AUDITORIA_AVANCADA.abrirPainelAuditoriaAvancada?.();
                            return;
                        }
                        break;
                        
                    case 'acesso-granular':
                        if (typeof MODULO_ACESSO_GRANULAR !== 'undefined') {
                            MODULO_ACESSO_GRANULAR.abrirPainelPermissoes?.();
                            return;
                        }
                        break;
                        
                    case 'backup-nuvem':
                        if (typeof MODULO_BACKUP_NUVEM !== 'undefined') {
                            MODULO_BACKUP_NUVEM.abrirPainelBackupNuvem?.();
                            return;
                        }
                        break;
                        
                    // === FASE 7 - MÓDULOS DE EXPERIÊNCIA ===
                    case 'tutorial':
                        if (typeof MODULO_TUTORIAL !== 'undefined') {
                            MODULO_TUTORIAL.mostrarMenuTutoriais?.();
                            return;
                        }
                        break;
                        
                    case 'feedback-usuario':
                        if (typeof MODULO_FEEDBACK_USUARIO !== 'undefined') {
                            MODULO_FEEDBACK_USUARIO.abrirModalFeedback?.();
                            return;
                        }
                        break;
                        
                    case 'gamificacao':
                        if (typeof MODULO_GAMIFICACAO !== 'undefined') {
                            MODULO_GAMIFICACAO.abrirPainelGamificacao?.();
                            return;
                        }
                        break;
                        
                    case 'notificacoes-push':
                        if (typeof MODULO_NOTIFICACOES_PUSH !== 'undefined') {
                            MODULO_NOTIFICACOES_PUSH.abrirCentralNotificacoes?.();
                            return;
                        }
                        break;
                        
                    // === FASE 8 - MÓDULOS DE INTEGRAÇÃO ===
                    case 'api-governo':
                        if (typeof MODULO_API_GOVERNO !== 'undefined') {
                            const relatorio = MODULO_API_GOVERNO.gerarRelatorioGovernamental?.() || {};
                            html = `
                                <div class="api-governo-panel">
                                    <h2>Dados Governamentais</h2>
                                    <pre>${JSON.stringify(relatorio, null, 2)}</pre>
                                </div>
                            `;
                        }
                        break;
                        
                    case 'integracoes-externas':
                        if (typeof MODULO_INTEGRACOES_EXTERNAS !== 'undefined') {
                            MODULO_INTEGRACOES_EXTERNAS.abrirPainelIntegracoes?.();
                            return;
                        }
                        break;
                        
                    case 'importacao-exportacao':
                        if (typeof MODULO_IMPORTACAO_EXPORTACAO !== 'undefined') {
                            MODULO_IMPORTACAO_EXPORTACAO.abrirPainelImportacaoExportacao?.();
                            return;
                        }
                        break;
                        
                    case 'webhooks':
                        if (typeof MODULO_WEBHOOKS !== 'undefined') {
                            MODULO_WEBHOOKS.abrirPainelWebhooks?.();
                            return;
                        }
                        break;
                        
                    default:
                        html = `
                            <div class="content-placeholder">
                                <h2>${modulo}</h2>
                                <p>Módulo em desenvolvimento</p>
                                <i class="fas fa-code" style="font-size: 48px; color: #ccc; margin: 20px;"></i>
                            </div>
                        `;
                }

                if (!html) {
                    html = `
                        <div class="modulo-fallback">
                            <i class="fas fa-info-circle" style="font-size: 48px; color: #3498db; margin-bottom: 20px;"></i>
                            <h3>Conteúdo não disponível</h3>
                            <p>O conteúdo solicitado não pôde ser carregado.</p>
                        </div>
                    `;
                }

                area.innerHTML = html;

            } catch (erro) {
                console.error('Erro ao carregar conteúdo:', erro);
                area.innerHTML = `
                    <div class="erro-funcao">
                        <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #e74c3c; margin-bottom: 20px;"></i>
                        <h3>Erro ao carregar</h3>
                        <p>${erro.message}</p>
                    </div>
                `;
            }
        }, 500);
    }

    function obterDadosParaExportacao(tipo) {
        switch(tipo) {
            case 'alunos': return MOCK_DATA.alunos || [];
            case 'professores': return MOCK_DATA.professores || [];
            case 'escolas': return MOCK_DATA.escolas || [];
            case 'turmas': return MOCK_DATA.turmas || [];
            default: return [];
        }
    }

    // ==================== RENDERIZADORES ====================
    function renderizarDashboard() {
        if (typeof MODULO_DASHBOARD_CUSTOM !== 'undefined' && Estado.autenticado) {
            const container = MODULO_DASHBOARD_CUSTOM.renderizarDashboardCustom?.();
            if (container) {
                setTimeout(() => {
                    const area = document.getElementById('content-area');
                    if (area) {
                        area.innerHTML = '';
                        area.appendChild(container);
                        
                        const btnEditar = document.createElement('button');
                        btnEditar.className = 'btn-editar-dashboard';
                        btnEditar.innerHTML = '<i class="fas fa-edit"></i> Editar Dashboard';
                        btnEditar.onclick = () => MODULO_DASHBOARD_CUSTOM.entrarModoEdicao?.();
                        area.appendChild(btnEditar);
                    }
                }, 100);
                return '';
            }
        }

        switch(Estado.perfil) {
            case 'secretaria': return renderizarDashboardSecretaria();
            case 'diretor': return renderizarDashboardDiretor();
            case 'professor': return renderizarDashboardProfessor();
            case 'aluno': return renderizarDashboardAluno();
            default: return renderizarDashboardGenerico();
        }
    }

    function renderizarDashboardSecretaria() {
        const totalEscolas = MOCK_DATA.escolas?.length || 0;
        const totalProfessores = MOCK_DATA.professores?.length || 0;
        const totalAlunos = MOCK_DATA.alunos?.length || 0;
        const totalTurmas = MOCK_DATA.turmas?.length || 0;

        return `
            <div class="dashboard-content">
                <div class="welcome-header">
                    <h1>Painel da Secretaria</h1>
                    <p class="welcome-subtitle">Bem-vindo(a), ${Estado.usuario?.nome || 'Usuário'}</p>
                </div>
                
                <div class="dashboard-stats">
                    <div class="stat-card" onclick="navegarPara('escolas', 'listar')">
                        <div class="stat-icon bg-primary">
                            <i class="fas fa-school"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Escolas</h3>
                            <p class="stat-number">${totalEscolas}</p>
                            <p class="stat-change">${MOCK_DATA.escolas?.filter(e => e.status === 'ativa').length || 0} ativas</p>
                        </div>
                    </div>
                    
                    <div class="stat-card" onclick="navegarPara('professores', 'listar')">
                        <div class="stat-icon bg-success">
                            <i class="fas fa-chalkboard-teacher"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Professores</h3>
                            <p class="stat-number">${totalProfessores}</p>
                            <p class="stat-change">${MOCK_DATA.professores?.filter(p => p.status === 'ativo').length || 0} ativos</p>
                        </div>
                    </div>
                    
                    <div class="stat-card" onclick="navegarPara('alunos', 'listar')">
                        <div class="stat-icon bg-warning">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Alunos</h3>
                            <p class="stat-number">${totalAlunos}</p>
                            <p class="stat-change">${MOCK_DATA.alunos?.filter(a => a.status === 'ativo').length || 0} ativos</p>
                        </div>
                    </div>
                    
                    <div class="stat-card" onclick="navegarPara('turmas', 'listar')">
                        <div class="stat-icon bg-info">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Turmas</h3>
                            <p class="stat-number">${totalTurmas}</p>
                            <p class="stat-change">${Math.round(totalAlunos/(totalTurmas || 1))} alunos/turma</p>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-graficos">
                    <div class="grafico-row">
                        <div class="grafico-card">
                            <canvas id="grafico-desempenho" style="height: 300px;"></canvas>
                        </div>
                        <div class="grafico-card">
                            <canvas id="grafico-distribuicao" style="height: 300px;"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-sections">
                    <div class="quick-actions">
                        <h2><i class="fas fa-bolt"></i> Ações Rápidas</h2>
                        <div class="action-buttons">
                            <button class="action-btn" onclick="navegarPara('escolas', 'listar')">
                                <i class="fas fa-school"></i> Gerenciar Escolas
                            </button>
                            <button class="action-btn" onclick="navegarPara('professores', 'listar')">
                                <i class="fas fa-chalkboard-teacher"></i> Gerenciar Professores
                            </button>
                            <button class="action-btn" onclick="navegarPara('alunos', 'listar')">
                                <i class="fas fa-graduation-cap"></i> Gerenciar Alunos
                            </button>
                            <button class="action-btn" onclick="navegarPara('relatorios', 'listar')">
                                <i class="fas fa-chart-bar"></i> Relatórios
                            </button>
                        </div>
                    </div>
                    
                    <div class="recent-activity">
                        <h2><i class="fas fa-chart-line"></i> Visão Geral</h2>
                        <div class="stats-mini">
                            <div class="stat-mini-item">
                                <span class="stat-mini-label">Rede Municipal</span>
                                <span class="stat-mini-value">${totalEscolas} escolas</span>
                            </div>
                            <div class="stat-mini-item">
                                <span class="stat-mini-label">Corpo Docente</span>
                                <span class="stat-mini-value">${totalProfessores} professores</span>
                            </div>
                            <div class="stat-mini-item">
                                <span class="stat-mini-label">Corpo Discente</span>
                                <span class="stat-mini-value">${totalAlunos} alunos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderizarDashboardDiretor() {
        const escola = MOCK_DATA.escolas?.find(e => e.id === Estado.usuario?.escolaId) || MOCK_DATA.escolas?.[0] || { nome: 'Escola não encontrada' };
        const professores = MOCK_DATA.professores?.filter(p => p.escolaId === escola.id) || [];
        const alunos = MOCK_DATA.alunos?.filter(a => a.escolaId === escola.id) || [];
        const turmas = MOCK_DATA.turmas?.filter(t => t.escolaId === escola.id) || [];

        return `
            <div class="dashboard-content">
                <div class="welcome-header">
                    <h1>Painel do Diretor</h1>
                    <p class="welcome-subtitle">${escola.nome}</p>
                </div>
                
                <div class="dashboard-stats">
                    <div class="stat-card" onclick="navegarPara('professores', 'listar')">
                        <div class="stat-icon bg-primary">
                            <i class="fas fa-chalkboard-teacher"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Professores</h3>
                            <p class="stat-number">${professores.length}</p>
                            <p class="stat-change">${professores.filter(p => p.status === 'ativo').length} ativos</p>
                        </div>
                    </div>
                    
                    <div class="stat-card" onclick="navegarPara('alunos', 'listar')">
                        <div class="stat-icon bg-success">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Alunos</h3>
                            <p class="stat-number">${alunos.length}</p>
                            <p class="stat-change">${alunos.filter(a => a.status === 'ativo').length} ativos</p>
                        </div>
                    </div>
                    
                    <div class="stat-card" onclick="navegarPara('turmas', 'listar')">
                        <div class="stat-icon bg-warning">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Turmas</h3>
                            <p class="stat-number">${turmas.length}</p>
                            <p class="stat-change">${turmas.length} ativas</p>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-sections">
                    <div class="quick-actions">
                        <h2><i class="fas fa-bolt"></i> Ações Rápidas</h2>
                        <div class="action-buttons">
                            <button class="action-btn" onclick="navegarPara('professores', 'listar')">
                                <i class="fas fa-chalkboard-teacher"></i> Ver Professores
                            </button>
                            <button class="action-btn" onclick="navegarPara('alunos', 'listar')">
                                <i class="fas fa-graduation-cap"></i> Ver Alunos
                            </button>
                            <button class="action-btn" onclick="navegarPara('turmas', 'listar')">
                                <i class="fas fa-users"></i> Ver Turmas
                            </button>
                        </div>
                    </div>
                    
                    <div class="recent-activity">
                        <h2><i class="fas fa-calendar-alt"></i> Próximos Eventos</h2>
                        <div class="event-list">
                            <p>Carregando eventos...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderizarDashboardProfessor() {
        const professor = MOCK_DATA.professores?.find(p => p.email === Estado.usuario?.email);
        if (!professor) return '<div class="error-message">Professor não encontrado</div>';

        const turmas = MOCK_DATA.turmas?.filter(t => t.professorId === professor.id) || [];
        const totalAlunos = turmas.reduce((acc, t) => acc + (t.totalAlunos || 0), 0);

        return `
            <div class="dashboard-content">
                <div class="welcome-header">
                    <h1>Painel do Professor</h1>
                    <p class="welcome-subtitle">${professor.disciplina} - ${totalAlunos} alunos</p>
                </div>
                
                <div class="dashboard-stats">
                    <div class="stat-card" onclick="navegarPara('turmas', 'minhas')">
                        <div class="stat-icon bg-primary">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Minhas Turmas</h3>
                            <p class="stat-number">${turmas.length}</p>
                            <p class="stat-change">${totalAlunos} alunos</p>
                        </div>
                    </div>
                    
                    <div class="stat-card" onclick="navegarPara('notas', 'lancar')">
                        <div class="stat-icon bg-warning">
                            <i class="fas fa-edit"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Notas a Lançar</h3>
                            <p class="stat-number">12</p>
                            <p class="stat-change">a lançar</p>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-sections">
                    <div class="quick-actions">
                        <h2><i class="fas fa-bolt"></i> Ações Rápidas</h2>
                        <div class="action-buttons">
                            <button class="action-btn" onclick="navegarPara('notas', 'lancar')">
                                <i class="fas fa-edit"></i> Lançar Notas
                            </button>
                            <button class="action-btn" onclick="navegarPara('frequencia', 'registrar')">
                                <i class="fas fa-clipboard-check"></i> Registrar Frequência
                            </button>
                        </div>
                    </div>
                    
                    <div class="recent-activity">
                        <h2><i class="fas fa-clock"></i> Próximas Aulas</h2>
                        <div class="schedule-list">
                            <p>Carregando horários...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderizarDashboardAluno() {
        const aluno = MOCK_DATA.alunos?.find(a => a.email === Estado.usuario?.email);
        if (!aluno) return '<div class="error-message">Aluno não encontrado</div>';

        return `
            <div class="dashboard-content">
                <div class="welcome-header">
                    <h1>Olá, ${aluno.nome}!</h1>
                    <p class="welcome-subtitle">Turma ${aluno.turma} • Matrícula ${aluno.matricula}</p>
                </div>
                
                <div class="dashboard-stats">
                    <div class="stat-card" onclick="navegarPara('boletim', 'ver')">
                        <div class="stat-icon bg-primary">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Média Geral</h3>
                            <p class="stat-number">${aluno.mediaGeral}</p>
                        </div>
                    </div>
                    
                    <div class="stat-card" onclick="navegarPara('faltas', 'ver')">
                        <div class="stat-icon bg-success">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Frequência</h3>
                            <p class="stat-number">${Math.round((1 - (aluno.faltas || 0)/80)*100)}%</p>
                        </div>
                    </div>
                    
                    <div class="stat-card" onclick="navegarPara('atividades', 'pendentes')">
                        <div class="stat-icon bg-warning">
                            <i class="fas fa-tasks"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Atividades</h3>
                            <p class="stat-number">3</p>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-sections">
                    <div class="quick-actions">
                        <h2><i class="fas fa-bolt"></i> Ações Rápidas</h2>
                        <div class="action-buttons">
                            <button class="action-btn" onclick="navegarPara('boletim', 'ver')">
                                <i class="fas fa-file-alt"></i> Ver Boletim
                            </button>
                            <button class="action-btn" onclick="navegarPara('horario', 'ver')">
                                <i class="fas fa-clock"></i> Ver Horário
                            </button>
                        </div>
                    </div>
                    
                    <div class="recent-activity">
                        <h2><i class="fas fa-clock"></i> Próxima Aula</h2>
                        <div class="schedule-list">
                            <p>Carregando horários...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderizarDashboardGenerico() {
        return `
            <div class="dashboard-content">
                <div class="welcome-header">
                    <h1>Bem-vindo(a), ${Estado.usuario?.nome || 'Usuário'}!</h1>
                    <p class="welcome-subtitle">${getNomePerfil(Estado.perfil)}</p>
                </div>
                
                <div class="content-placeholder">
                    <h2>Dashboard em desenvolvimento</h2>
                    <p>Em breve você terá estatísticas personalizadas.</p>
                </div>
            </div>
        `;
    }

    function renderizarPerfil() {
        const user = Estado.usuario;
        if (!user) return '<div class="error-message">Usuário não encontrado</div>';

        const tem2FA = typeof MODULO_2FA !== 'undefined' && MODULO_2FA.usuarioTem2FA?.(user.id);

        return `
            <div class="profile-content">
                <div class="content-header">
                    <h1><i class="fas fa-user"></i> Meu Perfil</h1>
                </div>
                
                <div class="profile-card">
                    <div class="profile-avatar">
                        <img src="${user.avatar || 'https://i.pravatar.cc/150'}" alt="${user.nome}">
                    </div>
                    
                    <div class="profile-details">
                        <div class="detail-row">
                            <label>Nome Completo:</label>
                            <span>${user.nome}</span>
                        </div>
                        <div class="detail-row">
                            <label>E-mail:</label>
                            <span>${user.email}</span>
                        </div>
                        <div class="detail-row">
                            <label>Telefone:</label>
                            <span>${user.telefone || 'Não informado'}</span>
                        </div>
                        <div class="detail-row">
                            <label>Perfil:</label>
                            <span class="role-badge">${getNomePerfil(user.perfil)}</span>
                        </div>
                        <div class="detail-row">
                            <label>2FA:</label>
                            <span class="${tem2FA ? 'text-success' : 'text-warning'}">
                                ${tem2FA ? 'Ativado' : 'Desativado'}
                            </span>
                        </div>
                        <div class="detail-row">
                            <label>Último Acesso:</label>
                            <span>${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</span>
                        </div>
                    </div>
                    
                    <div class="profile-actions">
                        <button class="btn btn-primary" onclick="abrirModal('Editar Perfil', getFormEditarPerfil())">
                            <i class="fas fa-edit"></i> Editar Perfil
                        </button>
                        <button class="btn btn-secondary" onclick="abrirModal('Alterar Senha', getFormAlterarSenha())">
                            <i class="fas fa-key"></i> Alterar Senha
                        </button>
                        <button class="btn btn-info" onclick="MODULO_2FA?.mostrarModalConfiguracao?.()">
                            <i class="fas fa-shield-alt"></i> Configurar 2FA
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== FUNÇÕES AUXILIARES ====================
    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        const footer = document.querySelector('.footer');

        Estado.sidebar = !Estado.sidebar;
        
        if (sidebar) sidebar.classList.toggle('collapsed');
        if (mainContent) mainContent.classList.toggle('expanded');
        if (footer) footer.classList.toggle('expanded');
    }

    function mostrarMensagem(texto, tipo = 'info') {
        if (typeof MODULO_NOTIFICACOES_PUSH !== 'undefined') {
            MODULO_NOTIFICACOES_PUSH.enviarNotificacao?.(texto, { tipo });
            return;
        }

        if (typeof MODULO_NOTIFICACOES !== 'undefined') {
            try {
                const tipos = {
                    success: 'sucesso',
                    error: 'erro',
                    warning: 'aviso',
                    info: 'info'
                };
                MODULO_NOTIFICACOES.adicionarNotificacao?.(texto, tipos[tipo] || 'info');
                return;
            } catch (e) {}
        }

        const msg = document.createElement('div');
        msg.className = `global-message message-${tipo}`;
        msg.innerHTML = `
            <div class="message-content">
                <i class="fas ${getIconeMensagem(tipo)}"></i>
                <span>${texto}</span>
            </div>
            <button class="message-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 5000);
    }

    function getIconeMensagem(tipo) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[tipo] || 'fa-info-circle';
    }

    function mostrarLoading(texto = 'Carregando...') {
        const loading = document.createElement('div');
        loading.className = 'global-loading';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">${texto}</div>
            </div>
        `;
        document.body.appendChild(loading);
    }

    function esconderLoading() {
        document.querySelectorAll('.global-loading').forEach(el => el.remove());
    }

    function abrirModal(titulo, conteudo, onConfirm = null) {
        const modal = document.getElementById('modal');
        const modalTitulo = document.getElementById('modal-title');
        const modalCorpo = document.getElementById('modal-body');
        const modalConfirmar = document.getElementById('modal-confirm');

        if (!modal || !modalTitulo || !modalCorpo) return;

        modalTitulo.textContent = titulo;
        modalCorpo.innerHTML = conteudo;
        modal.classList.add('active');

        if (onConfirm && modalConfirmar) {
            modalConfirmar.onclick = () => {
                onConfirm();
                fecharModal();
            };
            modalConfirmar.style.display = 'block';
        } else if (modalConfirmar) {
            modalConfirmar.style.display = 'none';
        }
    }

    function fecharModal() {
        const modal = document.getElementById('modal');
        if (modal) modal.classList.remove('active');
    }

    function getFormEditarPerfil() {
        if (!Estado.usuario) return '<p>Usuário não encontrado</p>';
        
        return `
            <form id="form-editar-perfil">
                <div class="form-group">
                    <label>Nome Completo</label>
                    <input type="text" class="form-control" value="${Estado.usuario.nome}">
                </div>
                <div class="form-group">
                    <label>E-mail</label>
                    <input type="email" class="form-control" value="${Estado.usuario.email}">
                </div>
                <div class="form-group">
                    <label>Telefone</label>
                    <input type="tel" class="form-control" value="${Estado.usuario.telefone || ''}">
                </div>
            </form>
        `;
    }

    function getFormAlterarSenha() {
        return `
            <form id="form-alterar-senha">
                <div class="form-group">
                    <label>Senha Atual</label>
                    <input type="password" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Nova Senha</label>
                    <input type="password" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Confirmar Nova Senha</label>
                    <input type="password" class="form-control" required>
                </div>
            </form>
        `;
    }

    function configurarEventos() {
        document.getElementById('login-btn')?.addEventListener('click', () => {
            const perfil = document.getElementById('login-type').value;
            const email = document.getElementById('username').value;
            const senha = document.getElementById('password').value;
            fazerLogin(email, senha, perfil);
        });

        document.getElementById('password')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const perfil = document.getElementById('login-type').value;
                const email = document.getElementById('username').value;
                const senha = document.getElementById('password').value;
                fazerLogin(email, senha, perfil);
            }
        });

        document.getElementById('logout-btn')?.addEventListener('click', fazerLogout);
        document.getElementById('menu-toggle')?.addEventListener('click', toggleSidebar);
    }

    function configurarModal() {
        const modal = document.getElementById('modal');
        const fechar = document.getElementById('modal-close');
        const cancelar = document.getElementById('modal-cancel');

        modal?.addEventListener('click', (e) => {
            if (e.target === modal) fecharModal();
        });

        fechar?.addEventListener('click', fecharModal);
        cancelar?.addEventListener('click', fecharModal);
    }

    function carregarEstilos() {
        // Estilos são carregados via CSS externo
    }

    window.SISTEMA = {
        fazerLogin,
        fazerLogout,
        navegarPara,
        toggleSidebar,
        abrirModal,
        fecharModal,
        mostrarMensagem,
        getEstado: () => ({ ...Estado })
    };

    window.navegarPara = navegarPara;
    window.abrirModal = abrirModal;
    window.mostrarMensagem = mostrarMensagem;

    console.log('✅ Sistema v8.0 carregado com sucesso!');
    console.log(`📊 Total de módulos disponíveis: ${CONFIG.modulosCarregados}/${CONFIG.totalModulos}`);
}
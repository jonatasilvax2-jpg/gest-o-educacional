// modulos/lgpd.js - Proteção de Dados (LGPD)
// Sistema de Gestão Educacional Municipal - FASE 6

if (typeof MODULO_LGPD === 'undefined') {
    const MODULO_LGPD = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            versao: '1.0.0',
            consentimentoVersion: '1.0',
            dadosSensiveis: ['cpf', 'rg', 'endereco', 'telefone', 'email', 'dataNascimento'],
            politicas: {
                cookies: true,
                analytics: true,
                marketing: false,
                terceiros: false
            },
            retencaoDias: {
                logs: 90,
                backups: 365,
                dadosUsuario: 730,
                dadosSensiveis: 365
            },
            anonimizacao: {
                substituirPor: '*** ANONIMIZADO ***',
                manterIds: true
            }
        };

        // ==================== ESTADO ====================
        let consentimentos = {};
        let solicitacoesDados = [];
        let politicasAceitas = false;
        let ultimaRevisao = null;

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('🔒 Módulo LGPD - Proteção de Dados inicializado');
            
            carregarConsentimentos();
            verificarConsentimento();
            configurarCookies();
            adicionarBannerConsentimento();
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    'Módulo LGPD inicializado',
                    MODULO_AUDITORIA.categorias?.SEGURANCA || 'seguranca',
                    MODULO_AUDITORIA.niveis?.INFO || 'info'
                );
            }
        }

        // ==================== CONSENTIMENTO ====================
        function verificarConsentimento() {
            const consentimento = localStorage.getItem('sme_lgpd_consentimento');
            
            if (consentimento) {
                try {
                    const dados = JSON.parse(consentimento);
                    if (dados.versao === CONFIG.consentimentoVersion && dados.aceito) {
                        politicasAceitas = true;
                        consentimentos = dados.politicas || {};
                        ultimaRevisao = dados.data;
                    }
                } catch (e) {
                    console.error('Erro ao carregar consentimento:', e);
                }
            }
        }

        function registrarConsentimento(politicas) {
            const consentimento = {
                versao: CONFIG.consentimentoVersion,
                aceito: true,
                politicas,
                data: new Date().toISOString(),
                ip: obterIpCliente(),
                userAgent: navigator.userAgent
            };

            localStorage.setItem('sme_lgpd_consentimento', JSON.stringify(consentimento));
            
            politicasAceitas = true;
            consentimentos = politicas;
            ultimaRevisao = consentimento.data;

            // Registrar no auditório
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    'Consentimento LGPD registrado',
                    MODULO_AUDITORIA.categorias?.SEGURANCA || 'seguranca',
                    MODULO_AUDITORIA.niveis?.INFO || 'info',
                    { politicas }
                );
            }

            removerBannerConsentimento();
        }

        function revogarConsentimento() {
            localStorage.removeItem('sme_lgpd_consentimento');
            
            politicasAceitas = false;
            consentimentos = {};
            
            // Limpar cookies não essenciais
            limparCookiesNaoEssenciais();

            // Registrar no auditório
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    'Consentimento LGPD revogado',
                    MODULO_AUDITORIA.categorias?.SEGURANCA || 'seguranca',
                    MODULO_AUDITORIA.niveis?.INFO || 'info'
                );
            }
        }

        // ==================== PROTEÇÃO DE DADOS ====================
        function anonimizarDados(dados, camposSensiveis = CONFIG.dadosSensiveis) {
            if (!dados || typeof dados !== 'object') return dados;

            const anonimizado = Array.isArray(dados) ? [] : {};

            for (let [chave, valor] of Object.entries(dados)) {
                if (camposSensiveis.includes(chave.toLowerCase())) {
                    // Anonimizar campo sensível
                    anonimizado[chave] = CONFIG.anonimizacao.substituirPor;
                } else if (typeof valor === 'object' && valor !== null) {
                    // Recursão para objetos aninhados
                    anonimizado[chave] = anonimizarDados(valor, camposSensiveis);
                } else {
                    anonimizado[chave] = valor;
                }
            }

            return anonimizado;
        }

        function mascararDados(valor, tipo) {
            if (!valor) return valor;

            switch(tipo) {
                case 'cpf':
                    return valor.replace(/(\d{3})\d{6}(\d{2})/, '$1******$2');
                case 'rg':
                    return valor.replace(/(\d{2})\d{5}(\d{2})/, '$1*****$2');
                case 'telefone':
                    return valor.replace(/(\d{2})\d{4}(\d{4})/, '($1) ****-$2');
                case 'email':
                    const [usuario, dominio] = valor.split('@');
                    return usuario.substring(0, 2) + '****@' + dominio;
                case 'endereco':
                    return valor.substring(0, 10) + '...';
                default:
                    return valor;
            }
        }

        function exportarDadosUsuario(usuarioId) {
            // Coletar todos os dados do usuário
            const dados = {
                usuario: MOCK_DATA.usuarios?.find(u => u.id === usuarioId) || null,
                aluno: MOCK_DATA.alunos?.find(a => a.id === usuarioId) || null,
                professor: MOCK_DATA.professores?.find(p => p.id === usuarioId) || null,
                notas: MOCK_DATA.notas?.filter(n => n.alunoId === usuarioId) || [],
                frequencias: MOCK_DATA.frequencias?.filter(f => f.alunoId === usuarioId) || [],
                ocorrencias: MOCK_DATA.ocorrencias?.filter(o => o.alunoId === usuarioId) || [],
                comunicacao: MOCK_DATA.comunicacao?.mensagens?.filter(m => 
                    m.remetenteId === usuarioId || m.destinatarioId === usuarioId
                ) || [],
                solicitacoes: MOCK_DATA.documentos?.filter(d => d.alunoId === usuarioId) || []
            };

            // Gerar arquivo JSON
            const jsonString = JSON.stringify(dados, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `dados_usuario_${usuarioId}_${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            // Registrar solicitação
            registrarSolicitacaoDados(usuarioId, 'exportacao');

            return dados;
        }

        function excluirDadosUsuario(usuarioId, confirmacao = false) {
            if (!confirmacao) {
                throw new Error('Confirmação necessária para exclusão de dados');
            }

            // Anonimizar dados em vez de excluir completamente
            anonimizarDadosUsuario(usuarioId);

            // Registrar exclusão
            registrarSolicitacaoDados(usuarioId, 'exclusao');

            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    `Dados do usuário ${usuarioId} anonimizados`,
                    MODULO_AUDITORIA.categorias?.SEGURANCA || 'seguranca',
                    MODULO_AUDITORIA.niveis?.INFO || 'info'
                );
            }

            return true;
        }

        function anonimizarDadosUsuario(usuarioId) {
            // Anonimizar dados em todas as coleções
            if (MOCK_DATA.usuarios) {
                const usuario = MOCK_DATA.usuarios.find(u => u.id === usuarioId);
                if (usuario) {
                    usuario.nome = 'USUÁRIO ANONIMIZADO';
                    usuario.email = 'anonimo@exemplo.com';
                    usuario.telefone = '**********';
                    usuario.senha = '********';
                }
            }

            if (MOCK_DATA.alunos) {
                const aluno = MOCK_DATA.alunos.find(a => a.id === usuarioId);
                if (aluno) {
                    aluno.nome = 'ALUNO ANONIMIZADO';
                    aluno.email = 'anonimo@exemplo.com';
                    aluno.telefone = '**********';
                    aluno.responsavel = 'RESPONSÁVEL ANONIMIZADO';
                    aluno.endereco = 'ENDEREÇO ANONIMIZADO';
                }
            }

            // Anonimizar referências em outras coleções
            anonimizarReferencias(usuarioId);
        }

        function anonimizarReferencias(usuarioId) {
            // Notas
            if (MOCK_DATA.notas) {
                MOCK_DATA.notas.forEach(nota => {
                    if (nota.alunoId === usuarioId) {
                        nota.alunoId = 'ANONIMIZADO';
                    }
                });
            }

            // Frequências
            if (MOCK_DATA.frequencias) {
                MOCK_DATA.frequencias.forEach(freq => {
                    if (freq.alunoId === usuarioId) {
                        freq.alunoId = 'ANONIMIZADO';
                    }
                });
            }

            // Ocorrências
            if (MOCK_DATA.ocorrencias) {
                MOCK_DATA.ocorrencias.forEach(occ => {
                    if (occ.alunoId === usuarioId) {
                        occ.alunoId = 'ANONIMIZADO';
                    }
                });
            }
        }

        // ==================== COOKIES ====================
        function configurarCookies() {
            // Verificar cookies essenciais
            if (!getCookie('sme_session')) {
                setCookie('sme_session', gerarIdSessao(), 1);
            }
        }

        function setCookie(nome, valor, dias) {
            const data = new Date();
            data.setTime(data.getTime() + (dias * 24 * 60 * 60 * 1000));
            document.cookie = `${nome}=${valor};expires=${data.toUTCString()};path=/;SameSite=Strict`;
        }

        function getCookie(nome) {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                const [chave, valor] = cookie.trim().split('=');
                if (chave === nome) return valor;
            }
            return null;
        }

        function limparCookiesNaoEssenciais() {
            const cookies = document.cookie.split(';');
            const cookiesEssenciais = ['sme_session', 'sme_lgpd_consentimento'];
            
            cookies.forEach(cookie => {
                const [nome] = cookie.trim().split('=');
                if (!cookiesEssenciais.includes(nome)) {
                    document.cookie = `${nome}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
                }
            });
        }

        // ==================== BANNER DE CONSENTIMENTO ====================
        function adicionarBannerConsentimento() {
            if (politicasAceitas) return;

            const banner = document.createElement('div');
            banner.id = 'lgpd-banner';
            banner.className = 'lgpd-banner';
            banner.innerHTML = `
                <div class="lgpd-conteudo">
                    <i class="fas fa-shield-alt"></i>
                    <div class="lgpd-texto">
                        <h3>Proteção de Dados (LGPD)</h3>
                        <p>Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência. 
                           Ao continuar navegando, você concorda com nossa <a href="/politica-privacidade">Política de Privacidade</a>.</p>
                    </div>
                    <div class="lgpd-botoes">
                        <button class="btn btn-outline" onclick="MODULO_LGPD.abrirConfiguracoes()">
                            Configurações
                        </button>
                        <button class="btn btn-primary" onclick="MODULO_LGPD.aceitarTodasPoliticas()">
                            Aceitar Todos
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(banner);

            // Adicionar estilos
            adicionarEstilosLGPD();
        }

        function adicionarEstilosLGPD() {
            if (document.getElementById('style-lgpd')) return;

            const style = document.createElement('style');
            style.id = 'style-lgpd';
            style.textContent = `
                .lgpd-banner {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: white;
                    box-shadow: 0 -5px 20px rgba(0,0,0,0.15);
                    z-index: 9999;
                    padding: 20px;
                    animation: slideUp 0.3s ease;
                }
                
                .lgpd-conteudo {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    flex-wrap: wrap;
                }
                
                .lgpd-conteudo i {
                    font-size: 2rem;
                    color: #3498db;
                }
                
                .lgpd-texto {
                    flex: 1;
                }
                
                .lgpd-texto h3 {
                    margin: 0 0 5px 0;
                    color: #2c3e50;
                }
                
                .lgpd-texto p {
                    margin: 0;
                    color: #7f8c8d;
                }
                
                .lgpd-texto a {
                    color: #3498db;
                    text-decoration: none;
                }
                
                .lgpd-texto a:hover {
                    text-decoration: underline;
                }
                
                .lgpd-botoes {
                    display: flex;
                    gap: 10px;
                }
                
                .btn-outline {
                    background: transparent;
                    border: 2px solid #3498db;
                    color: #3498db;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .btn-outline:hover {
                    background: #3498db;
                    color: white;
                }
                
                /* Modal de configurações */
                .lgpd-config-modal {
                    max-height: 600px;
                    overflow-y: auto;
                }
                
                .politica-item {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 15px;
                }
                
                .politica-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .politica-header h4 {
                    margin: 0;
                }
                
                .politica-descricao {
                    color: #7f8c8d;
                    font-size: 0.9rem;
                    margin-bottom: 10px;
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
                
                input:disabled + .toggle-slider {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .lgpd-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    margin-top: 20px;
                }
                
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                
                @media (max-width: 768px) {
                    .lgpd-conteudo {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .lgpd-botoes {
                        width: 100%;
                    }
                    
                    .btn-outline, .btn-primary {
                        flex: 1;
                    }
                }
            `;

            document.head.appendChild(style);
        }

        function removerBannerConsentimento() {
            const banner = document.getElementById('lgpd-banner');
            if (banner) {
                banner.remove();
            }
        }

        function aceitarTodasPoliticas() {
            registrarConsentimento(CONFIG.politicas);
        }

        function abrirConfiguracoes() {
            const politicas = consentimentos.aceito ? consentimentos : CONFIG.politicas;

            const modalHTML = `
                <div class="lgpd-config-modal">
                    <h3>Configurações de Privacidade</h3>
                    <p>Escolha quais cookies e tecnologias deseja permitir:</p>
                    
                    <div class="politica-item">
                        <div class="politica-header">
                            <h4>Cookies Essenciais</h4>
                            <label class="toggle-switch">
                                <input type="checkbox" checked disabled>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="politica-descricao">
                            Necessários para o funcionamento básico do sistema. Não podem ser desativados.
                        </div>
                    </div>
                    
                    <div class="politica-item">
                        <div class="politica-header">
                            <h4>Cookies de Analytics</h4>
                            <label class="toggle-switch">
                                <input type="checkbox" id="politica-analytics" 
                                       ${politicas.analytics ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="politica-descricao">
                            Nos ajudam a entender como você usa o sistema para melhorar sua experiência.
                        </div>
                    </div>
                    
                    <div class="politica-item">
                        <div class="politica-header">
                            <h4>Cookies de Marketing</h4>
                            <label class="toggle-switch">
                                <input type="checkbox" id="politica-marketing" 
                                       ${politicas.marketing ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="politica-descricao">
                            Utilizados para personalizar anúncios e conteúdo de marketing.
                        </div>
                    </div>
                    
                    <div class="politica-item">
                        <div class="politica-header">
                            <h4>Cookies de Terceiros</h4>
                            <label class="toggle-switch">
                                <input type="checkbox" id="politica-terceiros" 
                                       ${politicas.terceiros ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="politica-descricao">
                            Permitir integrações com serviços externos.
                        </div>
                    </div>
                    
                    <div class="lgpd-actions">
                        <button class="btn btn-secondary" onclick="SISTEMA.fecharModal()">
                            Cancelar
                        </button>
                        <button class="btn btn-primary" onclick="MODULO_LGPD.salvarConfiguracoes()">
                            Salvar Preferências
                        </button>
                    </div>
                </div>
            `;

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Configurações de Privacidade', modalHTML);
            }
        }

        function salvarConfiguracoes() {
            const politicas = {
                cookies: true,
                analytics: document.getElementById('politica-analytics')?.checked || false,
                marketing: document.getElementById('politica-marketing')?.checked || false,
                terceiros: document.getElementById('politica-terceiros')?.checked || false
            };

            registrarConsentimento(politicas);
            
            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.fecharModal();
            }
            
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                    'Configurações salvas',
                    'Suas preferências de privacidade foram atualizadas'
                );
            }
        }

        // ==================== SOLICITAÇÕES DE DADOS ====================
        function registrarSolicitacaoDados(usuarioId, tipo) {
            const solicitacao = {
                id: gerarId(),
                usuarioId,
                tipo,
                data: new Date().toISOString(),
                status: 'concluido'
            };

            solicitacoesDados.push(solicitacao);
            salvarSolicitacoes();
        }

        function getSolicitacoesPendentes() {
            return solicitacoesDados.filter(s => s.status === 'pendente');
        }

        // ==================== RETENÇÃO DE DADOS ====================
        function verificarRetencaoDados() {
            const agora = Date.now();
            const removidos = [];

            // Verificar logs antigos
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                const logs = MODULO_AUDITORIA.buscarLogs?.({}) || [];
                const logsAntigos = logs.filter(l => {
                    const dataLog = new Date(l.timestamp).getTime();
                    return (agora - dataLog) > (CONFIG.retencaoDias.logs * 24 * 60 * 60 * 1000);
                });

                // Anonimizar logs antigos
                logsAntigos.forEach(log => {
                    anonimizarLog(log);
                    removidos.push(`log_${log.id}`);
                });
            }

            return removidos;
        }

        function anonimizarLog(log) {
            if (log.usuario) {
                log.usuario.nome = 'ANONIMIZADO';
                log.usuario.email = 'anonimo@exemplo.com';
            }
            log.ip = '0.0.0.0';
            log.userAgent = 'ANONIMIZADO';
        }

        // ==================== UTILITÁRIOS ====================
        function gerarId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        function obterIpCliente() {
            // Em produção, viria do servidor
            return '127.0.0.1';
        }

        function gerarIdSessao() {
            return 'sessao_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        function salvarSolicitacoes() {
            try {
                localStorage.setItem('sme_solicitacoes_lgpd', JSON.stringify(solicitacoesDados));
            } catch (e) {
                console.error('Erro ao salvar solicitações:', e);
            }
        }

        function carregarSolicitacoes() {
            try {
                const saved = localStorage.getItem('sme_solicitacoes_lgpd');
                if (saved) {
                    solicitacoesDados = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar solicitações:', e);
            }
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            anonimizarDados,
            mascararDados,
            exportarDadosUsuario,
            excluirDadosUsuario,
            aceitarTodasPoliticas,
            abrirConfiguracoes,
            salvarConfiguracoes,
            revogarConsentimento,
            verificarRetencaoDados,
            getSolicitacoesPendentes,
            politicasAceitas: () => politicasAceitas
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_LGPD.init();
        }, 4000);
    });

    window.MODULO_LGPD = MODULO_LGPD;
    console.log('✅ Módulo LGPD - Proteção de Dados carregado');
}
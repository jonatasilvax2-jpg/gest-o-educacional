// modulos/autenticacao2fa.js - Autenticação de Dois Fatores
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_2FA === 'undefined') {
    const MODULO_2FA = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            tempoExpiracao: 5 * 60 * 1000, // 5 minutos
            tentativasMaximas: 3,
            tempoBloqueio: 15 * 60 * 1000, // 15 minutos
            digitos: 6,
            metodos: {
                APP: 'app',
                SMS: 'sms',
                EMAIL: 'email'
            }
        };

        // ==================== ESTADO ====================
        let usuario2FA = {};
        let tentativas = 0;
        let bloqueadoAte = null;
        let codigoAtual = null;
        let timerExpiracao = null;

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('🔐 Sistema de Autenticação 2FA inicializado');
            
            // Verificar se usuário já configurou 2FA
            carregarConfiguracoes();
        }

        // ==================== GERAÇÃO DE CÓDIGOS ====================
        function gerarCodigo() {
            const codigo = Math.floor(100000 + Math.random() * 900000).toString();
            const expiracao = Date.now() + CONFIG.tempoExpiracao;
            
            codigoAtual = {
                codigo: codigo,
                expiracao: expiracao
            };

            // Iniciar timer de expiração
            if (timerExpiracao) clearTimeout(timerExpiracao);
            timerExpiracao = setTimeout(() => {
                codigoAtual = null;
            }, CONFIG.tempoExpiracao);

            return codigo;
        }

        function validarCodigo(codigo) {
            // Verificar bloqueio
            if (bloqueadoAte && Date.now() < bloqueadoAte) {
                const minutosRestantes = Math.ceil((bloqueadoAte - Date.now()) / 60000);
                return {
                    valido: false,
                    mensagem: `Muitas tentativas. Tente novamente em ${minutosRestantes} minutos.`
                };
            }

            // Verificar se código existe
            if (!codigoAtual) {
                return {
                    valido: false,
                    mensagem: 'Código expirado. Solicite um novo.'
                };
            }

            // Verificar expiração
            if (Date.now() > codigoAtual.expiracao) {
                codigoAtual = null;
                return {
                    valido: false,
                    mensagem: 'Código expirado. Solicite um novo.'
                };
            }

            // Verificar código
            if (codigo === codigoAtual.codigo) {
                tentativas = 0;
                codigoAtual = null;
                return {
                    valido: true,
                    mensagem: 'Código válido'
                };
            }

            // Código inválido
            tentativas++;
            
            if (tentativas >= CONFIG.tentativasMaximas) {
                bloqueadoAte = Date.now() + CONFIG.tempoBloqueio;
                
                if (typeof MODULO_AUDITORIA !== 'undefined') {
                    MODULO_AUDITORIA.registrarEventoSeguranca(
                        'Múltiplas tentativas inválidas de 2FA',
                        { tentativas }
                    );
                }
                
                return {
                    valido: false,
                    mensagem: `Muitas tentativas. Bloqueado por 15 minutos.`
                };
            }

            return {
                valido: false,
                mensagem: `Código inválido. ${CONFIG.tentativasMaximas - tentativas} tentativa(s) restante(s).`
            };
        }

        // ==================== ENVIO DE CÓDIGOS ====================
        async function enviarCodigoPorEmail(email) {
            const codigo = gerarCodigo();
            
            // Simular envio de email
            console.log(`📧 Código 2FA enviado para ${email}: ${codigo}`);
            
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    `Código 2FA enviado para ${email}`,
                    MODULO_AUDITORIA.categorias.SEGURANCA,
                    MODULO_AUDITORIA.niveis.INFO
                );
            }

            return {
                sucesso: true,
                mensagem: 'Código enviado para seu email'
            };
        }

        async function enviarCodigoPorSMS(telefone) {
            const codigo = gerarCodigo();
            
            // Simular envio de SMS
            console.log(`📱 Código 2FA enviado para ${telefone}: ${codigo}`);
            
            return {
                sucesso: true,
                mensagem: 'Código enviado para seu telefone'
            };
        }

        // ==================== CONFIGURAÇÃO DO USUÁRIO ====================
        function configurar2FA(usuarioId, metodo, dados = {}) {
            usuario2FA[usuarioId] = {
                ativo: true,
                metodo: metodo,
                dados: dados,
                configuradoEm: new Date().toISOString()
            };

            salvarConfiguracoes();

            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarEventoSeguranca(
                    `2FA configurado para usuário ${usuarioId}`,
                    { metodo }
                );
            }

            return true;
        }

        function desativar2FA(usuarioId) {
            if (usuario2FA[usuarioId]) {
                usuario2FA[usuarioId].ativo = false;
                salvarConfiguracoes();

                if (typeof MODULO_AUDITORIA !== 'undefined') {
                    MODULO_AUDITORIA.registrarEventoSeguranca(
                        `2FA desativado para usuário ${usuarioId}`
                    );
                }
            }
        }

        function usuarioTem2FA(usuarioId) {
            return usuario2FA[usuarioId]?.ativo === true;
        }

        function getMetodo2FA(usuarioId) {
            return usuario2FA[usuarioId]?.metodo;
        }

        // ==================== FLUXO DE AUTENTICAÇÃO ====================
        async function iniciarAutenticacao2FA(usuario) {
            if (!usuarioTem2FA(usuario.id)) {
                return {
                    necessario: false
                };
            }

            const metodo = getMetodo2FA(usuario.id);
            let resultado;

            switch (metodo) {
                case CONFIG.metodos.EMAIL:
                    resultado = await enviarCodigoPorEmail(usuario.email);
                    break;
                case CONFIG.metodos.SMS:
                    resultado = await enviarCodigoPorSMS(usuario.telefone);
                    break;
                case CONFIG.metodos.APP:
                    // Para autenticador, o código é gerado pelo app
                    gerarCodigo(); // Apenas para referência
                    resultado = {
                        sucesso: true,
                        mensagem: 'Use seu aplicativo autenticador'
                    };
                    break;
                default:
                    return {
                        necessario: false
                    };
            }

            return {
                necessario: true,
                metodo: metodo,
                mensagem: resultado.mensagem
            };
        }

        function verificarCodigo2FA(codigo) {
            return validarCodigo(codigo);
        }

        // ==================== INTERFACE DO USUÁRIO ====================
        function mostrarModalConfiguracao() {
            const usuario = SISTEMA.getEstado().usuario;
            const tem2FA = usuarioTem2FA(usuario.id);
            const metodo = getMetodo2FA(usuario.id);

            const modalHTML = `
                <div class="config2fa-modal">
                    <h3>Autenticação de Dois Fatores</h3>
                    
                    <div class="status-2fa">
                        <i class="fas ${tem2FA ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'}"></i>
                        <span>Status: ${tem2FA ? 'Ativado' : 'Desativado'}</span>
                    </div>
                    
                    ${!tem2FA ? `
                        <div class="form-group">
                            <label>Escolha o método de autenticação:</label>
                            <select class="form-control" id="metodo-2fa">
                                <option value="email">Email</option>
                                <option value="sms">SMS</option>
                                <option value="app">Aplicativo Autenticador</option>
                            </select>
                        </div>
                        
                        <div class="config-email" id="config-email">
                            <p>O código será enviado para: <strong>${usuario.email}</strong></p>
                        </div>
                        
                        <div class="config-sms" id="config-sms" style="display: none;">
                            <div class="form-group">
                                <label>Número de telefone</label>
                                <input type="tel" class="form-control" value="${usuario.telefone || ''}">
                            </div>
                        </div>
                        
                        <div class="config-app" id="config-app" style="display: none;">
                            <p>Escaneie o QR Code com seu aplicativo autenticador:</p>
                            <div class="qrcode-placeholder">
                                <i class="fas fa-qrcode"></i>
                            </div>
                            <p>Ou insira manualmente a chave:</p>
                            <code class="chave-secreta">JBSWY3DPEHPK3PXP</code>
                        </div>
                        
                        <button class="btn btn-primary btn-block" onclick="MODULO_2FA.ativar2FA()">
                            Ativar 2FA
                        </button>
                    ` : `
                        <div class="info-2fa">
                            <p><strong>Método atual:</strong> ${metodo}</p>
                            <p><strong>Configurado em:</strong> ${new Date(usuario2FA[usuario.id]?.configuradoEm).toLocaleDateString('pt-BR')}</p>
                        </div>
                        
                        <button class="btn btn-danger btn-block" onclick="MODULO_2FA.desativar2FAPrompt()">
                            Desativar 2FA
                        </button>
                    `}
                </div>
            `;

            // Adicionar estilos
            adicionarEstilos2FA();

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Configurar 2FA', modalHTML);
            }

            // Configurar mudança de método
            document.getElementById('metodo-2fa')?.addEventListener('change', (e) => {
                document.querySelectorAll('[id^="config-"]').forEach(el => el.style.display = 'none');
                document.getElementById(`config-${e.target.value}`).style.display = 'block';
            });
        }

        function adicionarEstilos2FA() {
            if (document.getElementById('style-2fa')) return;

            const style = document.createElement('style');
            style.id = 'style-2fa';
            style.textContent = `
                .config2fa-modal {
                    padding: 10px;
                }
                
                .status-2fa {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                
                .status-2fa i {
                    font-size: 1.5rem;
                }
                
                .qrcode-placeholder {
                    width: 200px;
                    height: 200px;
                    background: #f0f0f0;
                    margin: 20px auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                }
                
                .qrcode-placeholder i {
                    font-size: 5rem;
                    color: #999;
                }
                
                .chave-secreta {
                    display: block;
                    padding: 10px;
                    background: #f8f9fa;
                    border-radius: 5px;
                    font-family: monospace;
                    margin: 10px 0;
                }
                
                .info-2fa {
                    background: #d4edda;
                    color: #155724;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
            `;

            document.head.appendChild(style);
        }

        function ativar2FA() {
            const usuario = SISTEMA.getEstado().usuario;
            const metodo = document.getElementById('metodo-2fa')?.value;

            let dados = {};
            if (metodo === 'sms') {
                const telefone = document.querySelector('#config-sms input')?.value;
                dados.telefone = telefone;
            }

            configurar2FA(usuario.id, metodo, dados);
            SISTEMA.fecharModal();
            
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                    '2FA Ativado',
                    'Autenticação de dois fatores ativada com sucesso'
                );
            }
        }

        function desativar2FAPrompt() {
            if (confirm('Deseja realmente desativar a autenticação de dois fatores?')) {
                const usuario = SISTEMA.getEstado().usuario;
                desativar2FA(usuario.id);
                SISTEMA.fecharModal();
                
                if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                    MODULO_NOTIFICACOES.adicionarNotificacaoInfo(
                        '2FA Desativado',
                        'Autenticação de dois fatores desativada'
                    );
                }
            }
        }

        function mostrarModalVerificacao(usuario, callback) {
            const modalHTML = `
                <div class="verificacao-2fa">
                    <h3>Verificação em duas etapas</h3>
                    
                    <p>Digite o código enviado para seu ${getMetodo2FA(usuario.id)}:</p>
                    
                    <div class="codigo-inputs">
                        <input type="text" class="codigo-digit" maxlength="1" pattern="[0-9]">
                        <input type="text" class="codigo-digit" maxlength="1" pattern="[0-9]">
                        <input type="text" class="codigo-digit" maxlength="1" pattern="[0-9]">
                        <input type="text" class="codigo-digit" maxlength="1" pattern="[0-9]">
                        <input type="text" class="codigo-digit" maxlength="1" pattern="[0-9]">
                        <input type="text" class="codigo-digit" maxlength="1" pattern="[0-9]">
                    </div>
                    
                    <p id="mensagem-erro-2fa" class="text-danger"></p>
                    
                    <button class="btn btn-primary btn-block" onclick="MODULO_2FA.verificarCodigoModal()">
                        Verificar
                    </button>
                    
                    <button class="btn btn-link btn-block" onclick="MODULO_2FA.reenviarCodigoModal()">
                        Reenviar código
                    </button>
                </div>
            `;

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Verificação 2FA', modalHTML);
            }

            // Configurar inputs
            const inputs = document.querySelectorAll('.codigo-digit');
            inputs.forEach((input, index) => {
                input.addEventListener('keyup', (e) => {
                    if (e.key >= '0' && e.key <= '9') {
                        if (index < inputs.length - 1) {
                            inputs[index + 1].focus();
                        }
                    }
                });
            });

            window.callbackVerificacao2FA = callback;
        }

        function verificarCodigoModal() {
            const inputs = document.querySelectorAll('.codigo-digit');
            const codigo = Array.from(inputs).map(i => i.value).join('');

            if (codigo.length !== 6) {
                document.getElementById('mensagem-erro-2fa').textContent = 'Digite o código completo';
                return;
            }

            const resultado = verificarCodigo2FA(codigo);

            if (resultado.valido) {
                SISTEMA.fecharModal();
                if (window.callbackVerificacao2FA) {
                    window.callbackVerificacao2FA(true);
                }
            } else {
                document.getElementById('mensagem-erro-2fa').textContent = resultado.mensagem;
                // Limpar inputs
                document.querySelectorAll('.codigo-digit').forEach(i => i.value = '');
            }
        }

        function reenviarCodigoModal() {
            const usuario = SISTEMA.getEstado().usuario;
            iniciarAutenticacao2FA(usuario);
            
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoInfo(
                    'Código reenviado',
                    'Um novo código foi enviado'
                );
            }
        }

        // ==================== PERSISTÊNCIA ====================
        function salvarConfiguracoes() {
            try {
                localStorage.setItem('sme_2fa_config', JSON.stringify(usuario2FA));
            } catch (e) {
                console.error('Erro ao salvar configurações 2FA:', e);
            }
        }

        function carregarConfiguracoes() {
            try {
                const saved = localStorage.getItem('sme_2fa_config');
                if (saved) {
                    usuario2FA = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar configurações 2FA:', e);
            }
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            iniciarAutenticacao2FA,
            verificarCodigo2FA,
            configurar2FA,
            desativar2FA,
            usuarioTem2FA,
            getMetodo2FA,
            mostrarModalConfiguracao,
            mostrarModalVerificacao,
            ativar2FA,
            desativar2FAPrompt,
            verificarCodigoModal,
            reenviarCodigoModal
        };
    })();

    window.MODULO_2FA = MODULO_2FA;
    console.log('✅ Módulo de Autenticação 2FA carregado');
}
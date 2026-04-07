// modulos/acesso-granular.js - Controle de Acesso Granular (RBAC)
// Sistema de Gestão Educacional Municipal - FASE 6

if (typeof MODULO_ACESSO_GRANULAR === 'undefined') {
    const MODULO_ACESSO_GRANULAR = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            versao: '1.0.0',
            permissoes: {
                // Permissões de visualização
                VER_ESCOLAS: 'escolas:ver',
                VER_PROFESSORES: 'professores:ver',
                VER_ALUNOS: 'alunos:ver',
                VER_TURMAS: 'turmas:ver',
                VER_RELATORIOS: 'relatorios:ver',
                VER_AUDITORIA: 'auditoria:ver',
                
                // Permissões de criação
                CRIAR_ESCOLAS: 'escolas:criar',
                CRIAR_PROFESSORES: 'professores:criar',
                CRIAR_ALUNOS: 'alunos:criar',
                CRIAR_TURMAS: 'turmas:criar',
                
                // Permissões de edição
                EDITAR_ESCOLAS: 'escolas:editar',
                EDITAR_PROFESSORES: 'professores:editar',
                EDITAR_ALUNOS: 'alunos:editar',
                EDITAR_TURMAS: 'turmas:editar',
                
                // Permissões de exclusão
                EXCLUIR_ESCOLAS: 'escolas:excluir',
                EXCLUIR_PROFESSORES: 'professores:excluir',
                EXCLUIR_ALUNOS: 'alunos:excluir',
                EXCLUIR_TURMAS: 'turmas:excluir',
                
                // Permissões administrativas
                GERENCIAR_USUARIOS: 'admin:usuarios',
                GERENCIAR_PERFIS: 'admin:perfis',
                GERENCIAR_PERMISSOES: 'admin:permissoes',
                VER_LOGS: 'admin:logs',
                FAZER_BACKUP: 'admin:backup',
                
                // Permissões especiais
                EXPORTAR_DADOS: 'dados:exportar',
                IMPORTAR_DADOS: 'dados:importar',
                ACESSO_API: 'api:acessar',
                MODO_OFFLINE: 'sistema:offline'
            },
            perfis: {
                ADMIN: 'admin',
                SECRETARIA: 'secretaria',
                DIRETOR: 'diretor',
                COORDENADOR: 'coordenador',
                PROFESSOR: 'professor',
                ALUNO: 'aluno',
                RESPONSAVEL: 'responsavel',
                VISITANTE: 'visitante'
            },
            hierarquia: {
                admin: 100,
                secretaria: 90,
                diretor: 80,
                coordenador: 70,
                professor: 60,
                aluno: 50,
                responsavel: 40,
                visitante: 10
            }
        };

        // ==================== MATRIZ DE PERMISSÕES ====================
        const matrizPermissoes = {
            [CONFIG.perfis.ADMIN]: Object.values(CONFIG.permissoes),
            
            [CONFIG.perfis.SECRETARIA]: [
                CONFIG.permissoes.VER_ESCOLAS,
                CONFIG.permissoes.VER_PROFESSORES,
                CONFIG.permissoes.VER_ALUNOS,
                CONFIG.permissoes.VER_TURMAS,
                CONFIG.permissoes.VER_RELATORIOS,
                CONFIG.permissoes.CRIAR_ESCOLAS,
                CONFIG.permissoes.CRIAR_PROFESSORES,
                CONFIG.permissoes.CRIAR_ALUNOS,
                CONFIG.permissoes.CRIAR_TURMAS,
                CONFIG.permissoes.EDITAR_ESCOLAS,
                CONFIG.permissoes.EDITAR_PROFESSORES,
                CONFIG.permissoes.EDITAR_ALUNOS,
                CONFIG.permissoes.EDITAR_TURMAS,
                CONFIG.permissoes.EXPORTAR_DADOS,
                CONFIG.permissoes.VER_AUDITORIA
            ],
            
            [CONFIG.perfis.DIRETOR]: [
                CONFIG.permissoes.VER_ESCOLAS,
                CONFIG.permissoes.VER_PROFESSORES,
                CONFIG.permissoes.VER_ALUNOS,
                CONFIG.permissoes.VER_TURMAS,
                CONFIG.permissoes.VER_RELATORIOS,
                CONFIG.permissoes.EDITAR_ESCOLAS,
                CONFIG.permissoes.EDITAR_PROFESSORES,
                CONFIG.permissoes.EDITAR_ALUNOS,
                CONFIG.permissoes.EDITAR_TURMAS,
                CONFIG.permissoes.EXPORTAR_DADOS
            ],
            
            [CONFIG.perfis.COORDENADOR]: [
                CONFIG.permissoes.VER_PROFESSORES,
                CONFIG.permissoes.VER_ALUNOS,
                CONFIG.permissoes.VER_TURMAS,
                CONFIG.permissoes.VER_RELATORIOS,
                CONFIG.permissoes.EDITAR_PROFESSORES,
                CONFIG.permissoes.EDITAR_ALUNOS,
                CONFIG.permissoes.EDITAR_TURMAS
            ],
            
            [CONFIG.perfis.PROFESSOR]: [
                CONFIG.permissoes.VER_ALUNOS,
                CONFIG.permissoes.VER_TURMAS,
                CONFIG.permissoes.EDITAR_ALUNOS
            ],
            
            [CONFIG.perfis.ALUNO]: [
                CONFIG.permissoes.VER_ALUNOS
            ],
            
            [CONFIG.perfis.RESPONSAVEL]: [
                CONFIG.permissoes.VER_ALUNOS
            ],
            
            [CONFIG.perfis.VISITANTE]: []
        };

        // ==================== ESTADO ====================
        let permissoesCustomizadas = {};
        let usuarios = {};
        let sessoesAtivas = new Map();
        let auditAcessos = [];

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('🔐 Módulo de Controle de Acesso Granular inicializado');
            
            carregarPermissoes();
            carregarUsuarios();
            configurarMiddleware();
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                MODULO_AUDITORIA_AVANCADA.registrarLogSeguranca(
                    'Módulo de controle de acesso granular inicializado'
                );
            }
        }

        // ==================== VERIFICAÇÃO DE PERMISSÕES ====================
        function temPermissao(usuario, permissao, contexto = {}) {
            if (!usuario) return false;

            // Admin tem todas as permissões
            if (usuario.perfil === CONFIG.perfis.ADMIN) return true;

            // Verificar permissões base do perfil
            const permissoesBase = matrizPermissoes[usuario.perfil] || [];
            if (permissoesBase.includes(permissao)) {
                return verificarContexto(usuario, permissao, contexto);
            }

            // Verificar permissões customizadas
            const permissoesCustom = permissoesCustomizadas[usuario.id] || [];
            if (permissoesCustom.includes(permissao)) {
                return verificarContexto(usuario, permissao, contexto);
            }

            return false;
        }

        function verificarContexto(usuario, permissao, contexto) {
            // Verificar restrições baseadas em contexto
            switch(permissao) {
                case CONFIG.permissoes.VER_ALUNOS:
                    // Diretor só vê alunos da sua escola
                    if (usuario.perfil === CONFIG.perfis.DIRETOR && contexto.escolaId) {
                        return usuario.escolaId === contexto.escolaId;
                    }
                    // Professor só vê alunos das suas turmas
                    if (usuario.perfil === CONFIG.perfis.PROFESSOR && contexto.turmaId) {
                        return verificarTurmaProfessor(usuario.id, contexto.turmaId);
                    }
                    break;

                case CONFIG.permissoes.EDITAR_ALUNOS:
                    // Diretor só edita alunos da sua escola
                    if (usuario.perfil === CONFIG.perfis.DIRETOR && contexto.escolaId) {
                        return usuario.escolaId === contexto.escolaId;
                    }
                    break;
            }

            return true;
        }

        function verificarMultiplasPermissoes(usuario, permissoes, contexto = {}) {
            return permissoes.every(permissao => temPermissao(usuario, permissao, contexto));
        }

        function verificarQualquerPermissao(usuario, permissoes, contexto = {}) {
            return permissoes.some(permissao => temPermissao(usuario, permissao, contexto));
        }

        // ==================== GERENCIAMENTO DE PERMISSÕES ====================
        function adicionarPermissao(usuarioId, permissao) {
            if (!permissoesCustomizadas[usuarioId]) {
                permissoesCustomizadas[usuarioId] = [];
            }

            if (!permissoesCustomizadas[usuarioId].includes(permissao)) {
                permissoesCustomizadas[usuarioId].push(permissao);
                salvarPermissoes();

                if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                    MODULO_AUDITORIA_AVANCADA.registrarLogSeguranca(
                        `Permissão adicionada: ${permissao} para usuário ${usuarioId}`
                    );
                }
            }
        }

        function removerPermissao(usuarioId, permissao) {
            if (permissoesCustomizadas[usuarioId]) {
                permissoesCustomizadas[usuarioId] = permissoesCustomizadas[usuarioId]
                    .filter(p => p !== permissao);
                salvarPermissoes();

                if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                    MODULO_AUDITORIA_AVANCADA.registrarLogSeguranca(
                        `Permissão removida: ${permissao} para usuário ${usuarioId}`
                    );
                }
            }
        }

        function getPermissoesUsuario(usuarioId) {
            const usuario = usuarios[usuarioId] || buscarUsuario(usuarioId);
            if (!usuario) return [];

            const permissoesBase = matrizPermissoes[usuario.perfil] || [];
            const permissoesCustom = permissoesCustomizadas[usuarioId] || [];

            return [...new Set([...permissoesBase, ...permissoesCustom])];
        }

        // ==================== GERENCIAMENTO DE PERFIS ====================
        function criarPerfil(nome, permissoes, perfilPai = null) {
            const novoPerfil = {
                id: `perfil_${Date.now()}`,
                nome,
                permissoes,
                perfilPai,
                criadoEm: new Date().toISOString()
            };

            // Adicionar à matriz de permissões
            matrizPermissoes[nome] = permissoes;

            if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                MODULO_AUDITORIA_AVANCADA.registrarLogSeguranca(
                    `Novo perfil criado: ${nome}`
                );
            }

            return novoPerfil;
        }

        function editarPerfil(perfil, novasPermissoes) {
            matrizPermissoes[perfil] = novasPermissoes;

            if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                MODULO_AUDITORIA_AVANCADA.registrarLogSeguranca(
                    `Perfil editado: ${perfil}`
                );
            }
        }

        function getPerfisDisponiveis() {
            return Object.keys(matrizPermissoes).map(perfil => ({
                id: perfil,
                nome: perfil.charAt(0).toUpperCase() + perfil.slice(1),
                permissoes: matrizPermissoes[perfil]
            }));
        }

        // ==================== CONTROLE DE SESSÃO ====================
        function registrarSessao(usuarioId, token) {
            const sessao = {
                id: gerarIdSessao(),
                usuarioId,
                token,
                inicio: new Date().toISOString(),
                ultimaAtividade: new Date().toISOString(),
                ip: obterIpCliente(),
                userAgent: navigator.userAgent
            };

            sessoesAtivas.set(sessao.id, sessao);

            if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                MODULO_AUDITORIA_AVANCADA.registrarLogSeguranca(
                    `Nova sessão iniciada para usuário ${usuarioId}`
                );
            }

            return sessao.id;
        }

        function validarSessao(sessaoId) {
            const sessao = sessoesAtivas.get(sessaoId);
            if (!sessao) return false;

            // Verificar timeout (30 minutos)
            const agora = new Date();
            const ultimaAtividade = new Date(sessao.ultimaAtividade);
            const diff = agora - ultimaAtividade;

            if (diff > 30 * 60 * 1000) {
                sessoesAtivas.delete(sessaoId);
                return false;
            }

            // Atualizar última atividade
            sessao.ultimaAtividade = agora.toISOString();
            return true;
        }

        function encerrarSessao(sessaoId) {
            const sessao = sessoesAtivas.get(sessaoId);
            if (sessao) {
                sessoesAtivas.delete(sessaoId);

                if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                    MODULO_AUDITORIA_AVANCADA.registrarLogSeguranca(
                        `Sessão encerrada para usuário ${sessao.usuarioId}`
                    );
                }
            }
        }

        // ==================== MIDDLEWARE DE AUTORIZAÇÃO ====================
        function configurarMiddleware() {
            // Interceptar chamadas de função
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
                return verificarPermissaoFetch(args[0], args[1])
                    .then(() => originalFetch.apply(this, args));
            };

            // Interceptar navegação
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[data-permissao]');
                if (link) {
                    const permissao = link.dataset.permissao;
                    if (!verificarPermissaoAtual(permissao)) {
                        e.preventDefault();
                        mostrarAcessoNegado();
                    }
                }
            });
        }

        function verificarPermissaoFetch(url, options) {
            return new Promise((resolve, reject) => {
                const usuario = obterUsuarioAtual();
                if (!usuario) {
                    reject(new Error('Usuário não autenticado'));
                    return;
                }

                // Verificar permissão baseada na URL
                const permissao = mapearUrlParaPermissao(url);
                if (permissao && !temPermissao(usuario, permissao)) {
                    registrarAcessoNegado(url, usuario);
                    reject(new Error('Acesso negado'));
                    return;
                }

                resolve();
            });
        }

        function mapearUrlParaPermissao(url) {
            const urlStr = url.toString();
            
            if (urlStr.includes('/api/alunos')) return CONFIG.permissoes.VER_ALUNOS;
            if (urlStr.includes('/api/professores')) return CONFIG.permissoes.VER_PROFESSORES;
            if (urlStr.includes('/api/escolas')) return CONFIG.permissoes.VER_ESCOLAS;
            if (urlStr.includes('/api/turmas')) return CONFIG.permissoes.VER_TURMAS;
            if (urlStr.includes('/api/exportar')) return CONFIG.permissoes.EXPORTAR_DADOS;
            
            return null;
        }

        // ==================== AUDITORIA DE ACESSO ====================
        function registrarAcesso(usuarioId, recurso, acao, resultado) {
            const acesso = {
                id: gerarId(),
                timestamp: new Date().toISOString(),
                usuarioId,
                recurso,
                acao,
                resultado,
                ip: obterIpCliente()
            };

            auditAcessos.push(acesso);

            // Manter apenas últimos 1000 registros
            if (auditAcessos.length > 1000) {
                auditAcessos = auditAcessos.slice(-1000);
            }

            if (resultado === 'negado' && typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                MODULO_AUDITORIA_AVANCADA.registrarLogSeguranca(
                    `Acesso negado: ${usuarioId} tentou ${acao} em ${recurso}`
                );
            }
        }

        function registrarAcessoNegado(url, usuario) {
            registrarAcesso(usuario.id, url, 'acessar', 'negado');
        }

        function getAuditAcessos(filtros = {}) {
            let resultados = [...auditAcessos];

            if (filtros.usuarioId) {
                resultados = resultados.filter(a => a.usuarioId === filtros.usuarioId);
            }

            if (filtros.resultado) {
                resultados = resultados.filter(a => a.resultado === filtros.resultado);
            }

            if (filtros.dataInicio) {
                resultados = resultados.filter(a => a.timestamp >= filtros.dataInicio);
            }

            return resultados;
        }

        // ==================== INTERFACE DO USUÁRIO ====================
        function mostrarAcessoNegado() {
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoErro(
                    'Acesso Negado',
                    'Você não tem permissão para acessar este recurso'
                );
            }
        }

        function abrirPainelPermissoes() {
            const perfis = getPerfisDisponiveis();
            const permissoes = Object.values(CONFIG.permissoes);

            const modalHTML = `
                <div class="permissoes-painel">
                    <h3><i class="fas fa-lock"></i> Gerenciar Permissões</h3>
                    
                    <div class="permissoes-tabs">
                        <button class="tab-btn active" onclick="mostrarAbaPermissoes('perfis')">
                            <i class="fas fa-users-cog"></i> Perfis
                        </button>
                        <button class="tab-btn" onclick="mostrarAbaPermissoes('usuarios')">
                            <i class="fas fa-user-tag"></i> Usuários
                        </button>
                        <button class="tab-btn" onclick="mostrarAbaPermissoes('auditoria')">
                            <i class="fas fa-history"></i> Auditoria
                        </button>
                    </div>
                    
                    <div id="perfis-aba" class="permissoes-aba active">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Perfil</th>
                                    <th>Permissões</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${perfis.map(perfil => `
                                    <tr>
                                        <td><strong>${perfil.nome}</strong></td>
                                        <td>
                                            <span class="badge badge-info">${perfil.permissoes.length}</span>
                                            permissões
                                        </td>
                                        <td>
                                            <button class="btn-icon" onclick="editarPerfil('${perfil.id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn-icon" onclick="verPermissoesPerfil('${perfil.id}')">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div id="usuarios-aba" class="permissoes-aba">
                        <p>Carregando usuários...</p>
                    </div>
                    
                    <div id="auditoria-aba" class="permissoes-aba">
                        <p>Carregando auditoria...</p>
                    </div>
                </div>
            `;

            // Adicionar estilos
            adicionarEstilosPermissoes();

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Gerenciar Permissões', modalHTML);
            }
        }

        function adicionarEstilosPermissoes() {
            if (document.getElementById('style-permissoes')) return;

            const style = document.createElement('style');
            style.id = 'style-permissoes';
            style.textContent = `
                .permissoes-painel {
                    max-height: 600px;
                    overflow-y: auto;
                }
                
                .permissoes-tabs {
                    display: flex;
                    gap: 10px;
                    margin: 20px 0;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 10px;
                }
                
                .permissoes-aba {
                    display: none;
                }
                
                .permissoes-aba.active {
                    display: block;
                }
                
                .permissoes-matrix {
                    max-height: 400px;
                    overflow-y: auto;
                }
                
                .permissao-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .permissao-item:last-child {
                    border-bottom: none;
                }
                
                .permissao-checkbox {
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                }
            `;

            document.head.appendChild(style);
        }

        // ==================== UTILITÁRIOS ====================
        function gerarId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        function gerarIdSessao() {
            return 'sessao_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        function obterIpCliente() {
            return '127.0.0.1';
        }

        function obterUsuarioAtual() {
            if (typeof SISTEMA !== 'undefined') {
                return SISTEMA.getEstado().usuario;
            }
            return null;
        }

        function buscarUsuario(usuarioId) {
            return MOCK_DATA.usuarios?.find(u => u.id === usuarioId);
        }

        function verificarTurmaProfessor(professorId, turmaId) {
            const turma = MOCK_DATA.turmas?.find(t => t.id === turmaId);
            return turma?.professorId === professorId;
        }

        function salvarPermissoes() {
            try {
                localStorage.setItem('sme_permissoes_custom', JSON.stringify(permissoesCustomizadas));
            } catch (e) {
                console.error('Erro ao salvar permissões:', e);
            }
        }

        function carregarPermissoes() {
            try {
                const saved = localStorage.getItem('sme_permissoes_custom');
                if (saved) {
                    permissoesCustomizadas = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar permissões:', e);
            }
        }

        function carregarUsuarios() {
            if (MOCK_DATA.usuarios) {
                MOCK_DATA.usuarios.forEach(u => {
                    usuarios[u.id] = u;
                });
            }
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            temPermissao,
            temMultiplasPermissoes: verificarMultiplasPermissoes,
            temQualquerPermissao: verificarQualquerPermissao,
            adicionarPermissao,
            removerPermissao,
            getPermissoesUsuario,
            criarPerfil,
            editarPerfil,
            getPerfisDisponiveis,
            registrarSessao,
            validarSessao,
            encerrarSessao,
            getAuditAcessos,
            abrirPainelPermissoes,
            permissoes: CONFIG.permissoes,
            perfis: CONFIG.perfis
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_ACESSO_GRANULAR.init();
        }, 5000);
    });

    window.MODULO_ACESSO_GRANULAR = MODULO_ACESSO_GRANULAR;
    console.log('✅ Módulo de Controle de Acesso Granular carregado');
}
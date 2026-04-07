// modulos/auth.js - Módulo de Autenticação
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_AUTH === 'undefined') {
    const MODULO_AUTH = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            tentativasMaximas: 5,
            tempoBloqueio: 15 * 60 * 1000, // 15 minutos
            sessionTimeout: 24 * 60 * 60 * 1000 // 24 horas
        };

        // ==================== ESTADO ====================
        let estado = {
            tentativas: 0,
            bloqueadoAte: null,
            usuariosLogados: [],
            sessoesAtivas: []
        };

        // ==================== FUNÇÕES PRINCIPAIS ====================
        function autenticar(email, senha, perfil) {
            // Verificar bloqueio
            if (estaBloqueado()) {
                const tempoRestante = Math.ceil((estado.bloqueadoAte - Date.now()) / 60000);
                return {
                    success: false,
                    message: `Muitas tentativas. Tente novamente em ${tempoRestante} minutos.`,
                    bloqueado: true
                };
            }

            // Validar campos
            if (!email || !senha || !perfil) {
                return {
                    success: false,
                    message: 'Preencha todos os campos!'
                };
            }

            // Validar email
            if (!validarEmail(email)) {
                return {
                    success: false,
                    message: 'Formato de email inválido!'
                };
            }

            // Buscar usuário
            const usuario = MOCK_DATA.usuarios.find(u => 
                u.email.toLowerCase() === email.toLowerCase()
            );

            if (!usuario) {
                registrarTentativaFalha();
                return {
                    success: false,
                    message: 'Usuário não encontrado!'
                };
            }

            // Verificar senha
            if (usuario.senha !== senha) {
                registrarTentativaFalha();
                return {
                    success: false,
                    message: 'Senha incorreta!'
                };
            }

            // Verificar perfil
            if (usuario.perfil !== perfil) {
                registrarTentativaFalha();
                return {
                    success: false,
                    message: `Perfil incorreto. Este usuário é ${getNomePerfil(usuario.perfil)}.`
                };
            }

            // Verificar se usuário está ativo
            if (usuario.status === 'inativo') {
                return {
                    success: false,
                    message: 'Usuário desativado. Contate o administrador.'
                };
            }

            // Login bem-sucedido
            estado.tentativas = 0;
            registrarSessao(usuario);

            // Atualizar último acesso
            usuario.ultimoAcesso = new Date().toISOString();

            return {
                success: true,
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    perfil: usuario.perfil,
                    escolaId: usuario.escolaId,
                    avatar: usuario.avatar,
                    ultimoAcesso: usuario.ultimoAcesso
                }
            };
        }

        function registrarTentativaFalha() {
            estado.tentativas++;
            
            if (estado.tentativas >= CONFIG.tentativasMaximas) {
                estado.bloqueadoAte = Date.now() + CONFIG.tempoBloqueio;
                
                // Registrar log de segurança
                registrarLogSeguranca('bloqueio', {
                    motivo: 'muitas_tentativas',
                    tentativas: estado.tentativas,
                    data: new Date().toISOString()
                });
            }
        }

        function estaBloqueado() {
            return estado.bloqueadoAte && Date.now() < estado.bloqueadoAte;
        }

        function registrarSessao(usuario) {
            const sessao = {
                id: gerarIdSessao(),
                usuarioId: usuario.id,
                usuarioNome: usuario.nome,
                perfil: usuario.perfil,
                dataInicio: new Date().toISOString(),
                expira: Date.now() + CONFIG.sessionTimeout,
                ip: obterIpCliente(),
                userAgent: navigator.userAgent
            };

            estado.sessoesAtivas.push(sessao);
            estado.usuariosLogados.push(usuario.id);

            // Manter apenas últimas 100 sessões
            if (estado.sessoesAtivas.length > 100) {
                estado.sessoesAtivas.shift();
            }

            return sessao;
        }

        function encerrarSessao(usuarioId) {
            estado.usuariosLogados = estado.usuariosLogados.filter(id => id !== usuarioId);
            
            const sessao = estado.sessoesAtivas.find(s => s.usuarioId === usuarioId && !s.dataFim);
            if (sessao) {
                sessao.dataFim = new Date().toISOString();
            }
        }

        function validarSessao(sessaoId) {
            const sessao = estado.sessoesAtivas.find(s => s.id === sessaoId);
            
            if (!sessao) return false;
            if (sessao.dataFim) return false;
            if (Date.now() > sessao.expira) {
                sessao.dataFim = new Date().toISOString();
                return false;
            }
            
            return true;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function validarEmail(email) {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
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

        function gerarIdSessao() {
            return 'sessao_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        function obterIpCliente() {
            // Em produção, viria do servidor
            return '127.0.0.1';
        }

        function registrarLogSeguranca(tipo, dados) {
            const log = {
                id: Date.now(),
                tipo: tipo,
                dados: dados,
                timestamp: new Date().toISOString()
            };

            // Salvar no localStorage ou enviar para servidor
            const logs = JSON.parse(localStorage.getItem('sme_logs_seguranca') || '[]');
            logs.push(log);
            
            // Manter apenas últimos 1000 logs
            if (logs.length > 1000) logs.shift();
            
            localStorage.setItem('sme_logs_seguranca', JSON.stringify(logs));
            
            console.log('[SEGURANÇA]', tipo, dados);
        }

        // ==================== FUNÇÕES DE RECUPERAÇÃO ====================
        function recuperarSenha(email) {
            const usuario = MOCK_DATA.usuarios.find(u => u.email === email);
            
            if (!usuario) {
                return {
                    success: false,
                    message: 'Email não encontrado!'
                };
            }

            // Gerar token de recuperação
            const token = gerarTokenRecuperacao();
            
            // Salvar token
            const recuperacoes = JSON.parse(localStorage.getItem('sme_recuperacoes') || '[]');
            recuperacoes.push({
                email: usuario.email,
                token: token,
                expira: Date.now() + 60 * 60 * 1000, // 1 hora
                usado: false
            });
            localStorage.setItem('sme_recuperacoes', JSON.stringify(recuperacoes));

            // Simular envio de email
            console.log(`[RECUPERAÇÃO] Token para ${email}: ${token}`);

            return {
                success: true,
                message: 'Instruções de recuperação enviadas para seu email.'
            };
        }

        function gerarTokenRecuperacao() {
            return Math.random().toString(36).substr(2, 6).toUpperCase();
        }

        function redefinirSenha(email, token, novaSenha) {
            const recuperacoes = JSON.parse(localStorage.getItem('sme_recuperacoes') || '[]');
            const recuperacao = recuperacoes.find(r => 
                r.email === email && 
                r.token === token && 
                !r.usado &&
                Date.now() < r.expira
            );

            if (!recuperacao) {
                return {
                    success: false,
                    message: 'Token inválido ou expirado!'
                };
            }

            // Validar nova senha
            if (novaSenha.length < 6) {
                return {
                    success: false,
                    message: 'A senha deve ter pelo menos 6 caracteres!'
                };
            }

            // Atualizar senha
            const usuario = MOCK_DATA.usuarios.find(u => u.email === email);
            if (usuario) {
                usuario.senha = novaSenha;
                
                // Marcar token como usado
                recuperacao.usado = true;
                localStorage.setItem('sme_recuperacoes', JSON.stringify(recuperacoes));

                // Registrar log
                registrarLogSeguranca('senha_alterada', {
                    usuario: usuario.id,
                    email: usuario.email
                });

                return {
                    success: true,
                    message: 'Senha alterada com sucesso!'
                };
            }

            return {
                success: false,
                message: 'Erro ao alterar senha!'
            };
        }

        // ==================== FUNÇÕES DE PERMISSÃO ====================
        function temPermissao(usuario, recurso, acao) {
            // Matriz de permissões
            const permissoes = {
                'secretaria': {
                    'escolas': ['ver', 'criar', 'editar', 'excluir'],
                    'professores': ['ver', 'criar', 'editar', 'excluir'],
                    'alunos': ['ver', 'criar', 'editar', 'excluir'],
                    'turmas': ['ver', 'criar', 'editar', 'excluir'],
                    'relatorios': ['ver', 'criar'],
                    'usuarios': ['ver', 'criar', 'editar', 'excluir']
                },
                'diretor': {
                    'escolas': ['ver'],
                    'professores': ['ver'],
                    'alunos': ['ver'],
                    'turmas': ['ver'],
                    'relatorios': ['ver', 'criar'],
                    'ocorrencias': ['ver', 'criar', 'editar']
                },
                'professor': {
                    'turmas': ['ver'],
                    'alunos': ['ver'],
                    'notas': ['ver', 'criar', 'editar'],
                    'frequencia': ['ver', 'criar', 'editar'],
                    'atividades': ['ver', 'criar', 'editar']
                },
                'aluno': {
                    'boletim': ['ver'],
                    'notas': ['ver'],
                    'faltas': ['ver'],
                    'horario': ['ver'],
                    'atividades': ['ver']
                }
            };

            const perfil = usuario.perfil;
            const recursoPerm = permissoes[perfil]?.[recurso];
            
            return recursoPerm ? recursoPerm.includes(acao) : false;
        }

        // ==================== FUNÇÕES DE AUDITORIA ====================
        function registrarAcao(usuario, acao, detalhes) {
            const auditoria = {
                id: Date.now(),
                usuarioId: usuario.id,
                usuarioNome: usuario.nome,
                acao: acao,
                detalhes: detalhes,
                data: new Date().toISOString(),
                ip: obterIpCliente()
            };

            const logs = JSON.parse(localStorage.getItem('sme_auditoria') || '[]');
            logs.push(auditoria);
            
            if (logs.length > 1000) logs.shift();
            
            localStorage.setItem('sme_auditoria', JSON.stringify(logs));
        }

        // ==================== API PÚBLICA ====================
        return {
            autenticar,
            recuperarSenha,
            redefinirSenha,
            validarSessao,
            encerrarSessao,
            temPermissao,
            registrarAcao,
            getNomePerfil,
            estaBloqueado: () => estado.bloqueadoAte ? Date.now() < estado.bloqueadoAte : false,
            getTentativasRestantes: () => CONFIG.tentativasMaximas - estado.tentativas,
            getTempoBloqueio: () => estado.bloqueadoAte ? Math.ceil((estado.bloqueadoAte - Date.now()) / 1000) : 0
        };
    })();

    // Exportar módulo
    window.MODULO_AUTH = MODULO_AUTH;
    console.log('✅ Módulo de Autenticação carregado');
}
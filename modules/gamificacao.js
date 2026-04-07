// modulos/gamificacao.js - Sistema de Gamificação
// Sistema de Gestão Educacional Municipal - FASE 7

if (typeof MODULO_GAMIFICACAO === 'undefined') {
    const MODULO_GAMIFICACAO = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            versao: '1.0.0',
            niveis: [
                { nivel: 1, pontos: 0, titulo: 'Iniciante', icone: '🌱' },
                { nivel: 2, pontos: 100, titulo: 'Aprendiz', icone: '🌿' },
                { nivel: 3, pontos: 250, titulo: 'Dedicado', icone: '🍃' },
                { nivel: 4, pontos: 500, titulo: 'Experiente', icone: '🌳' },
                { nivel: 5, pontos: 1000, titulo: 'Mestre', icone: '🏆' },
                { nivel: 6, pontos: 2000, titulo: 'Lenda', icone: '👑' },
                { nivel: 7, pontos: 5000, titulo: 'Divindade', icone: '⭐' }
            ],
            conquistas: {
                PRIMEIRO_ACESSO: { id: 'primeiro_acesso', nome: 'Primeiro Acesso', pontos: 10, icone: 'fa-door-open' },
                LOGIN_SEMANA: { id: 'login_semana', nome: 'Login da Semana', pontos: 5, icone: 'fa-calendar-week' },
                LOGIN_MES: { id: 'login_mes', nome: 'Login do Mês', pontos: 20, icone: 'fa-calendar-alt' },
                PERFIL_COMPLETO: { id: 'perfil_completo', nome: 'Perfil Completo', pontos: 15, icone: 'fa-user-check' },
                PRIMEIRO_ALUNO: { id: 'primeiro_aluno', nome: 'Primeiro Aluno', pontos: 30, icone: 'fa-user-graduate' },
                PRIMEIRO_PROFESSOR: { id: 'primeiro_professor', nome: 'Primeiro Professor', pontos: 30, icone: 'fa-chalkboard-teacher' },
                PRIMEIRA_TURMA: { id: 'primeira_turma', nome: 'Primeira Turma', pontos: 25, icone: 'fa-users' },
                NOTAS_LANCADAS: { id: 'notas_lancadas', nome: 'Notas Lançadas', pontos: 40, icone: 'fa-edit' },
                FREQUENCIA_REGISTRADA: { id: 'frequencia_registrada', nome: 'Frequência Registrada', pontos: 35, icone: 'fa-clipboard-check' },
                RELATORIO_GERADO: { id: 'relatorio_gerado', nome: 'Relatório Gerado', pontos: 20, icone: 'fa-chart-bar' },
                BIBLIOTECA_USO: { id: 'biblioteca_uso', nome: 'Biblioteca Ativa', pontos: 15, icone: 'fa-book' },
                TRANSPORTE_USO: { id: 'transporte_uso', nome: 'Transporte Escolar', pontos: 10, icone: 'fa-bus' },
                MERENDA_USO: { id: 'merenda_uso', nome: 'Merenda Escolar', pontos: 10, icone: 'fa-utensils' },
                FEEDBACK_ENVIADO: { id: 'feedback_enviado', nome: 'Feedback Enviado', pontos: 15, icone: 'fa-comment' },
                TUTORIAL_COMPLETO: { id: 'tutorial_completo', nome: 'Tutorial Completo', pontos: 25, icone: 'fa-graduation-cap' }
            },
            missoesDiarias: [
                { id: 'diaria_login', nome: 'Login Diário', descricao: 'Faça login no sistema', pontos: 5, progresso: 0, total: 1 },
                { id: 'diaria_perfil', nome: 'Atualize seu Perfil', descricao: 'Mantenha seu perfil atualizado', pontos: 10, progresso: 0, total: 1 },
                { id: 'diaria_notas', nome: 'Lançar Notas', descricao: 'Lance notas para seus alunos', pontos: 15, progresso: 0, total: 5, porPerfil: ['professor'] },
                { id: 'diaria_frequencia', nome: 'Registrar Frequência', descricao: 'Registre a frequência dos alunos', pontos: 15, progresso: 0, total: 1, porPerfil: ['professor'] },
                { id: 'diaria_alunos', nome: 'Gerenciar Alunos', descricao: 'Acesse o módulo de alunos', pontos: 10, progresso: 0, total: 1 },
                { id: 'diaria_relatorios', nome: 'Gerar Relatório', descricao: 'Gere um relatório', pontos: 20, progresso: 0, total: 1 }
            ],
            recompensas: {
                MEDALHA_OURO: '🥇',
                MEDALHA_PRATA: '🥈',
                MEDALHA_BRONZE: '🥉',
                TROFEU: '🏆',
                ESTRELA: '⭐',
                CORACAO: '❤️'
            }
        };

        // ==================== ESTADO ====================
        let usuarios = {};
        let missoes = [];
        let ranking = [];
        let eventos = [];

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('🎮 Módulo de Gamificação inicializado');
            
            carregarDados();
            carregarMissoesDiarias();
            iniciarEventos();
            adicionarBadgeGamificacao();
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                MODULO_AUDITORIA_AVANCADA.registrarLog(
                    'Módulo de gamificação inicializado',
                    MODULO_AUDITORIA_AVANCADA.categorias?.SISTEMA || 'sistema',
                    MODULO_AUDITORIA_AVANCADA.niveis?.INFO || 'info'
                );
            }
        }

        // ==================== GERENCIAMENTO DE USUÁRIOS ====================
        function inicializarUsuario(usuarioId) {
            if (!usuarios[usuarioId]) {
                usuarios[usuarioId] = {
                    id: usuarioId,
                    pontos: 0,
                    nivel: 1,
                    conquistas: [],
                    missoes: [],
                    estatisticas: {
                        logins: 0,
                        diasConsecutivos: 0,
                        ultimoLogin: null,
                        acoes: {}
                    },
                    historico: []
                };
                salvarDados();
            }
            return usuarios[usuarioId];
        }

        function adicionarPontos(usuarioId, pontos, motivo) {
            const usuario = usuarios[usuarioId] || inicializarUsuario(usuarioId);
            
            usuario.pontos += pontos;
            usuario.historico.push({
                data: new Date().toISOString(),
                tipo: 'pontos',
                pontos,
                motivo
            });

            // Verificar mudança de nível
            const novoNivel = calcularNivel(usuario.pontos);
            if (novoNivel > usuario.nivel) {
                usuario.nivel = novoNivel;
                notificarNovoNivel(usuarioId, novoNivel);
            }

            salvarDados();
            atualizarRanking();
        }

        function calcularNivel(pontos) {
            for (let i = CONFIG.niveis.length - 1; i >= 0; i--) {
                if (pontos >= CONFIG.niveis[i].pontos) {
                    return CONFIG.niveis[i].nivel;
                }
            }
            return 1;
        }

        function getInfoNivel(nivel) {
            return CONFIG.niveis.find(n => n.nivel === nivel) || CONFIG.niveis[0];
        }

        // ==================== CONQUISTAS ====================
        function desbloquearConquista(usuarioId, conquistaId) {
            const usuario = usuarios[usuarioId] || inicializarUsuario(usuarioId);
            const conquista = CONFIG.conquistas[conquistaId];

            if (!conquista || usuario.conquistas.includes(conquistaId)) {
                return false;
            }

            usuario.conquistas.push(conquistaId);
            adicionarPontos(usuarioId, conquista.pontos, `Conquista: ${conquista.nome}`);

            notificarConquista(usuarioId, conquista);

            return true;
        }

        function verificarConquistas(usuarioId, tipo, dados = {}) {
            const usuario = usuarios[usuarioId] || inicializarUsuario(usuarioId);

            switch(tipo) {
                case 'login':
                    if (usuario.estatisticas.logins === 1) {
                        desbloquearConquista(usuarioId, 'PRIMEIRO_ACESSO');
                    }
                    break;
                    
                case 'perfil':
                    if (dados.completo) {
                        desbloquearConquista(usuarioId, 'PERFIL_COMPLETO');
                    }
                    break;
                    
                case 'aluno':
                    desbloquearConquista(usuarioId, 'PRIMEIRO_ALUNO');
                    break;
                    
                case 'professor':
                    desbloquearConquista(usuarioId, 'PRIMEIRO_PROFESSOR');
                    break;
                    
                case 'turma':
                    desbloquearConquista(usuarioId, 'PRIMEIRA_TURMA');
                    break;
                    
                case 'notas':
                    if (dados.quantidade >= 10) {
                        desbloquearConquista(usuarioId, 'NOTAS_LANCADAS');
                    }
                    break;
                    
                case 'feedback':
                    desbloquearConquista(usuarioId, 'FEEDBACK_ENVIADO');
                    break;
                    
                case 'tutorial':
                    desbloquearConquista(usuarioId, 'TUTORIAL_COMPLETO');
                    break;
            }
        }

        // ==================== MISSÕES DIÁRIAS ====================
        function carregarMissoesDiarias() {
            const hoje = new Date().toDateString();
            const missoesSalvas = localStorage.getItem('sme_missoes_' + hoje);

            if (missoesSalvas) {
                missoes = JSON.parse(missoesSalvas);
            } else {
                // Gerar novas missões
                missoes = CONFIG.missoesDiarias.map(m => ({
                    ...m,
                    progresso: 0,
                    concluida: false
                }));
                localStorage.setItem('sme_missoes_' + hoje, JSON.stringify(missoes));
            }
        }

        function atualizarMissao(usuarioId, missaoId, progresso) {
            const usuario = usuarios[usuarioId] || inicializarUsuario(usuarioId);
            const missao = missoes.find(m => m.id === missaoId);

            if (!missao || missao.concluida) return;

            // Verificar perfil
            if (missao.porPerfil) {
                const perfil = obterPerfilUsuario(usuarioId);
                if (!missao.porPerfil.includes(perfil)) return;
            }

            missao.progresso = Math.min(missao.progresso + progresso, missao.total);

            if (missao.progresso >= missao.total && !missao.concluida) {
                missao.concluida = true;
                adicionarPontos(usuarioId, missao.pontos, `Missão: ${missao.nome}`);
                notificarMissaoConcluida(usuarioId, missao);
            }

            salvarMissoes();
        }

        // ==================== RANKING ====================
        function atualizarRanking() {
            ranking = Object.values(usuarios)
                .map(u => ({
                    id: u.id,
                    nome: obterNomeUsuario(u.id),
                    pontos: u.pontos,
                    nivel: u.nivel,
                    conquistas: u.conquistas.length
                }))
                .sort((a, b) => b.pontos - a.pontos)
                .slice(0, 100);
        }

        function getRanking(limite = 10) {
            return ranking.slice(0, limite);
        }

        function getPosicaoUsuario(usuarioId) {
            const index = ranking.findIndex(u => u.id === usuarioId);
            return index >= 0 ? index + 1 : null;
        }

        // ==================== EVENTOS ESPECIAIS ====================
        function iniciarEventos() {
            // Evento de login diário
            setInterval(() => {
                verificarLoginDiario();
            }, 60 * 60 * 1000); // 1 hora

            // Evento de semana de ouro
            verificarEventoSemanal();
        }

        function verificarLoginDiario() {
            const hoje = new Date().toDateString();

            Object.entries(usuarios).forEach(([id, usuario]) => {
                if (usuario.estatisticas.ultimoLogin !== hoje) {
                    usuario.estatisticas.diasConsecutivos = 0;
                }
            });
        }

        function registrarLogin(usuarioId) {
            const usuario = usuarios[usuarioId] || inicializarUsuario(usuarioId);
            const hoje = new Date().toDateString();
            const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

            usuario.estatisticas.logins++;

            if (usuario.estatisticas.ultimoLogin === ontem) {
                usuario.estatisticas.diasConsecutivos++;
                
                // Bônus por sequência
                if (usuario.estatisticas.diasConsecutivos === 7) {
                    adicionarPontos(usuarioId, 50, '7 dias consecutivos!');
                }
            } else if (usuario.estatisticas.ultimoLogin !== hoje) {
                usuario.estatisticas.diasConsecutivos = 1;
            }

            usuario.estatisticas.ultimoLogin = hoje;
            adicionarPontos(usuarioId, 5, 'Login diário');
            
            atualizarMissao(usuarioId, 'diaria_login', 1);
            verificarConquistas(usuarioId, 'login');

            salvarDados();
        }

        function verificarEventoSemanal() {
            const hoje = new Date();
            const diaSemana = hoje.getDay();
            
            // Evento de quarta-feira (dobro de pontos)
            if (diaSemana === 3) {
                eventos.push({
                    tipo: 'dobro_pontos',
                    descricao: 'Quarta-feira em Dobro!',
                    multiplicador: 2,
                    inicio: hoje.toISOString(),
                    fim: new Date(hoje.setHours(23, 59, 59)).toISOString()
                });
            }

            // Evento de fim de semana (missões especiais)
            if (diaSemana === 0 || diaSemana === 6) {
                eventos.push({
                    tipo: 'fim_de_semana',
                    descricao: 'Missões de Fim de Semana',
                    missoes: [
                        { id: 'fds_especial', nome: 'Missão Especial', pontos: 100 }
                    ]
                });
            }
        }

        // ==================== INTERFACE DO USUÁRIO ====================
        function adicionarBadgeGamificacao() {
            const headerRight = document.querySelector('.header-right');
            if (!headerRight) return;

            const badge = document.createElement('div');
            badge.className = 'gamificacao-badge';
            badge.id = 'gamificacao-badge';
            badge.innerHTML = `
                <i class="fas fa-trophy"></i>
                <span class="badge-pontos">0</span>
            `;

            badge.addEventListener('click', () => {
                abrirPainelGamificacao();
            });

            headerRight.appendChild(badge);

            // Adicionar estilos
            adicionarEstilosGamificacao();
        }

        function adicionarEstilosGamificacao() {
            if (document.getElementById('style-gamificacao')) return;

            const style = document.createElement('style');
            style.id = 'style-gamificacao';
            style.textContent = `
                .gamificacao-badge {
                    position: relative;
                    cursor: pointer;
                    padding: 5px;
                    border-radius: 50%;
                    transition: all 0.3s;
                }
                
                .gamificacao-badge:hover {
                    background: #f0f0f0;
                }
                
                .gamificacao-badge i {
                    font-size: 1.2rem;
                    color: #f39c12;
                }
                
                .badge-pontos {
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
                
                .gamificacao-painel {
                    max-height: 600px;
                    overflow-y: auto;
                }
                
                .perfil-gamificacao {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                }
                
                .nivel-info {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                
                .nivel-icono {
                    font-size: 3rem;
                }
                
                .nivel-progresso {
                    flex: 1;
                }
                
                .progress-bar {
                    height: 10px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 5px;
                    overflow: hidden;
                }
                
                .progress-bar-fill {
                    height: 100%;
                    background: white;
                    transition: width 0.3s;
                }
                
                .conquistas-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 15px;
                    margin: 20px 0;
                }
                
                .conquista-card {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 15px;
                    text-align: center;
                    transition: all 0.3s;
                }
                
                .conquista-card.concluida {
                    background: #d4edda;
                    border-color: #c3e6cb;
                }
                
                .conquista-card i {
                    font-size: 2rem;
                    color: #f39c12;
                    margin-bottom: 10px;
                }
                
                .conquista-card h4 {
                    margin: 0 0 5px 0;
                    font-size: 1rem;
                }
                
                .conquista-card p {
                    color: #7f8c8d;
                    font-size: 0.8rem;
                    margin: 0;
                }
                
                .missoes-lista {
                    margin: 20px 0;
                }
                
                .missao-item {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 10px;
                }
                
                .missao-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .missao-nome {
                    font-weight: 600;
                }
                
                .missao-pontos {
                    background: #27ae60;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                }
                
                .missao-progresso {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .progress-bar-container {
                    flex: 1;
                    height: 8px;
                    background: #f0f0f0;
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .progress-bar-fill {
                    height: 100%;
                    background: #3498db;
                    transition: width 0.3s;
                }
                
                .missao-concluida {
                    color: #27ae60;
                    font-size: 1.2rem;
                }
                
                .ranking-lista {
                    max-height: 300px;
                    overflow-y: auto;
                }
                
                .ranking-item {
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    border-bottom: 1px solid #dee2e6;
                }
                
                .ranking-item.destacado {
                    background: #fff3cd;
                }
                
                .ranking-posicao {
                    width: 30px;
                    font-weight: bold;
                }
                
                .ranking-info {
                    flex: 1;
                }
                
                .ranking-nome {
                    font-weight: 500;
                }
                
                .ranking-pontos {
                    color: #7f8c8d;
                    font-size: 0.8rem;
                }
                
                .ranking-nivel {
                    background: #9b59b6;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                }
                
                .evento-especial {
                    background: linear-gradient(135deg, #f39c12, #e67e22);
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                    text-align: center;
                }
            `;

            document.head.appendChild(style);
        }

        function abrirPainelGamificacao() {
            const usuarioId = obterUsuarioAtual()?.id;
            if (!usuarioId) return;

            const usuario = usuarios[usuarioId] || inicializarUsuario(usuarioId);
            const nivelInfo = getInfoNivel(usuario.nivel);
            const proximoNivel = CONFIG.niveis.find(n => n.nivel === usuario.nivel + 1);
            const progressoProximoNivel = proximoNivel 
                ? (usuario.pontos - nivelInfo.pontos) / (proximoNivel.pontos - nivelInfo.pontos) * 100
                : 100;

            const conquistasUsuario = Object.entries(CONFIG.conquistas).map(([key, value]) => ({
                ...value,
                concluida: usuario.conquistas.includes(value.id)
            }));

            const missoesUsuario = missoes.map(m => ({
                ...m,
                progresso: m.progresso,
                concluida: m.concluida
            }));

            const rankingTop = getRanking(10);
            const posicaoUsuario = getPosicaoUsuario(usuarioId);

            const modalHTML = `
                <div class="gamificacao-painel">
                    <div class="perfil-gamificacao">
                        <div class="nivel-info">
                            <div class="nivel-icono">${nivelInfo.icone}</div>
                            <div class="nivel-texto">
                                <h3>Nível ${usuario.nivel} - ${nivelInfo.titulo}</h3>
                                <p>${usuario.pontos} pontos</p>
                            </div>
                        </div>
                        
                        <div class="nivel-progresso">
                            <div class="progress-bar">
                                <div class="progress-bar-fill" style="width: ${progressoProximoNivel}%"></div>
                            </div>
                            <p class="text-center">
                                ${proximoNivel ? `${usuario.pontos}/${proximoNivel.pontos} para o próximo nível` : 'Nível máximo alcançado!'}
                            </p>
                        </div>
                    </div>
                    
                    <div class="evento-especial">
                        <i class="fas fa-star"></i>
                        <h4>Evento Especial!</h4>
                        <p>${eventos.length > 0 ? eventos[0].descricao : 'Nenhum evento ativo no momento'}</p>
                    </div>
                    
                    <h3><i class="fas fa-trophy"></i> Conquistas</h3>
                    <div class="conquistas-grid">
                        ${conquistasUsuario.map(c => `
                            <div class="conquista-card ${c.concluida ? 'concluida' : ''}">
                                <i class="fas ${c.icone}"></i>
                                <h4>${c.nome}</h4>
                                <p>${c.pontos} pontos</p>
                                ${c.concluida ? '<span class="badge-success">✓</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                    
                    <h3><i class="fas fa-tasks"></i> Missões Diárias</h3>
                    <div class="missoes-lista">
                        ${missoesUsuario.map(m => `
                            <div class="missao-item">
                                <div class="missao-header">
                                    <span class="missao-nome">${m.nome}</span>
                                    <span class="missao-pontos">+${m.pontos}</span>
                                </div>
                                <p>${m.descricao}</p>
                                <div class="missao-progresso">
                                    <span>${m.progresso}/${m.total}</span>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar-fill" style="width: ${(m.progresso/m.total)*100}%"></div>
                                    </div>
                                    ${m.concluida ? '<span class="missao-concluida"><i class="fas fa-check-circle"></i></span>' : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <h3><i class="fas fa-chart-line"></i> Ranking</h3>
                    <div class="ranking-lista">
                        ${rankingTop.map((r, index) => `
                            <div class="ranking-item ${r.id === usuarioId ? 'destacado' : ''}">
                                <span class="ranking-posicao">#${index + 1}</span>
                                <div class="ranking-info">
                                    <div class="ranking-nome">${r.nome}</div>
                                    <div class="ranking-pontos">${r.pontos} pontos • ${r.conquistas} conquistas</div>
                                </div>
                                <span class="ranking-nivel">Nível ${r.nivel}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="text-center mt-20">
                        <p>Sua posição: <strong>#${posicaoUsuario || '?'}</strong></p>
                    </div>
                </div>
            `;

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Gamificação', modalHTML);
            }
        }

        // ==================== NOTIFICAÇÕES ====================
        function notificarNovoNivel(usuarioId, nivel) {
            const nivelInfo = getInfoNivel(nivel);
            
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                    '🎉 Novo Nível!',
                    `Parabéns! Você alcançou o nível ${nivel} - ${nivelInfo.titulo}`,
                    { prioridade: 2 }
                );
            }
        }

        function notificarConquista(usuarioId, conquista) {
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                    '🏆 Nova Conquista!',
                    `Você desbloqueou: ${conquista.nome} (+${conquista.pontos} pontos)`,
                    { prioridade: 2 }
                );
            }
        }

        function notificarMissaoConcluida(usuarioId, missao) {
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                    '✅ Missão Concluída!',
                    `${missao.nome} - +${missao.pontos} pontos`,
                    { prioridade: 1 }
                );
            }
        }

        // ==================== UTILITÁRIOS ====================
        function obterUsuarioAtual() {
            if (typeof SISTEMA !== 'undefined') {
                return SISTEMA.getEstado().usuario;
            }
            return null;
        }

        function obterPerfilUsuario(usuarioId) {
            const usuario = MOCK_DATA.usuarios?.find(u => u.id === usuarioId);
            return usuario?.perfil;
        }

        function obterNomeUsuario(usuarioId) {
            const usuario = MOCK_DATA.usuarios?.find(u => u.id === usuarioId);
            return usuario?.nome || 'Usuário';
        }

        function salvarDados() {
            try {
                localStorage.setItem('sme_gamificacao', JSON.stringify(usuarios));
            } catch (e) {
                console.error('Erro ao salvar dados:', e);
            }
        }

        function carregarDados() {
            try {
                const saved = localStorage.getItem('sme_gamificacao');
                if (saved) {
                    usuarios = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar dados:', e);
            }
        }

        function salvarMissoes() {
            const hoje = new Date().toDateString();
            localStorage.setItem('sme_missoes_' + hoje, JSON.stringify(missoes));
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            registrarLogin,
            adicionarPontos,
            desbloquearConquista,
            verificarConquistas,
            atualizarMissao,
            getRanking,
            getPosicaoUsuario,
            abrirPainelGamificacao,
            niveis: CONFIG.niveis,
            conquistas: CONFIG.conquistas
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_GAMIFICACAO.init();
        }, 7000);
    });

    window.MODULO_GAMIFICACAO = MODULO_GAMIFICACAO;
    console.log('✅ Módulo de Gamificação carregado');
}
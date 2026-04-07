// modulos/ia-recomendacao.js - Sistema de Recomendação de Estudos com IA
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0 - FASE 4

if (typeof MODULO_IA_RECOMENDACAO === 'undefined') {
    const MODULO_IA_RECOMENDACAO = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            tiposRecurso: {
                VIDEO: 'video',
                EXERCICIO: 'exercicio',
                LEITURA: 'leitura',
                JOGO: 'jogo',
                RESUMO: 'resumo',
                MAPA_MENTAL: 'mapa_mental'
            },
            niveisDificuldade: {
                FACIL: 'facil',
                MEDIO: 'medio',
                DIFICIL: 'dificil',
                AVANCADO: 'avancado'
            },
            maxRecomendacoes: 10,
            similaridadeMinima: 0.3
        };

        // ==================== BANCO DE RECURSOS EDUCACIONAIS ====================
        const recursosEducacionais = [
            // Matemática
            {
                id: 1,
                titulo: 'Frações - Introdução',
                descricao: 'Aprenda o básico sobre frações de forma simples',
                disciplina: 'Matemática',
                tipo: CONFIG.tiposRecurso.VIDEO,
                dificuldade: CONFIG.niveisDificuldade.FACIL,
                url: 'https://youtube.com/watch?v=123',
                duracao: 15,
                tags: ['fracoes', 'basico', 'matematica'],
                avaliacao: 4.5,
                recomendadoParaAnos: [5, 6]
            },
            {
                id: 2,
                titulo: 'Equações do Primeiro Grau',
                descricao: 'Resolução passo a passo de equações',
                disciplina: 'Matemática',
                tipo: CONFIG.tiposRecurso.EXERCICIO,
                dificuldade: CONFIG.niveisDificuldade.MEDIO,
                questoes: 20,
                tags: ['equacoes', 'algebra'],
                avaliacao: 4.2,
                recomendadoParaAnos: [7, 8]
            },
            {
                id: 3,
                titulo: 'Geometria - Áreas e Perímetros',
                descricao: 'Calcule áreas de figuras planas',
                disciplina: 'Matemática',
                tipo: CONFIG.tiposRecurso.JOGO,
                dificuldade: CONFIG.niveisDificuldade.MEDIO,
                url: 'https://jogo.com/geometria',
                tags: ['geometria', 'areas', 'perimetros'],
                avaliacao: 4.8,
                recomendadoParaAnos: [6, 7, 8]
            },
            
            // Português
            {
                id: 4,
                titulo: 'Classes Gramaticais',
                descricao: 'Substantivo, adjetivo, verbo e muito mais',
                disciplina: 'Português',
                tipo: CONFIG.tiposRecurso.RESUMO,
                dificuldade: CONFIG.niveisDificuldade.FACIL,
                paginas: 25,
                tags: ['gramatica', 'classes'],
                avaliacao: 4.3,
                recomendadoParaAnos: [5, 6, 7]
            },
            {
                id: 5,
                titulo: 'Interpretação de Texto',
                descricao: 'Exercícios para melhorar a compreensão',
                disciplina: 'Português',
                tipo: CONFIG.tiposRecurso.EXERCICIO,
                dificuldade: CONFIG.niveisDificuldade.MEDIO,
                questoes: 30,
                tags: ['interpretacao', 'leitura'],
                avaliacao: 4.6,
                recomendadoParaAnos: [6, 7, 8, 9]
            },
            
            // Ciências
            {
                id: 6,
                titulo: 'Sistema Solar',
                descricao: 'Explore os planetas do nosso sistema solar',
                disciplina: 'Ciências',
                tipo: CONFIG.tiposRecurso.VIDEO,
                dificuldade: CONFIG.niveisDificuldade.FACIL,
                url: 'https://youtube.com/watch?v=456',
                duracao: 20,
                tags: ['astronomia', 'planetas'],
                avaliacao: 4.9,
                recomendadoParaAnos: [5, 6]
            },
            {
                id: 7,
                titulo: 'Corpo Humano - Sistemas',
                descricao: 'Mapa mental dos sistemas do corpo humano',
                disciplina: 'Ciências',
                tipo: CONFIG.tiposRecurso.MAPA_MENTAL,
                dificuldade: CONFIG.niveisDificuldade.MEDIO,
                imagem: 'mapa_corpo_humano.jpg',
                tags: ['corpo_humano', 'sistemas'],
                avaliacao: 4.4,
                recomendadoParaAnos: [7, 8]
            },
            
            // História
            {
                id: 8,
                titulo: 'Brasil Colônia',
                descricao: 'Período colonial brasileiro',
                disciplina: 'História',
                tipo: CONFIG.tiposRecurso.LEITURA,
                dificuldade: CONFIG.niveisDificuldade.MEDIO,
                paginas: 50,
                tags: ['brasil', 'colonia', 'historia'],
                avaliacao: 4.1,
                recomendadoParaAnos: [7, 8]
            },
            
            // Geografia
            {
                id: 9,
                titulo: 'Regiões do Brasil',
                descricao: 'Características de cada região',
                disciplina: 'Geografia',
                tipo: CONFIG.tiposRecurso.VIDEO,
                dificuldade: CONFIG.niveisDificuldade.FACIL,
                url: 'https://youtube.com/watch?v=789',
                duracao: 18,
                tags: ['regioes', 'brasil'],
                avaliacao: 4.7,
                recomendadoParaAnos: [6, 7]
            }
        ];

        // ==================== ESTADO ====================
        let historicoRecomendacoes = [];
        let perfilAlunos = {};

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('🎯 Módulo de Recomendação de Estudos inicializado');
            
            // Carregar perfis salvos
            carregarPerfis();
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    'Módulo de recomendação de estudos inicializado',
                    MODULO_AUDITORIA.categorias.IA,
                    MODULO_AUDITORIA.niveis.INFO
                );
            }
        }

        // ==================== ANÁLISE DE PERFIL ====================
        function analisarPerfilAluno(alunoId) {
            const aluno = MOCK_DATA.alunos?.find(a => a.id === alunoId);
            if (!aluno) return null;

            const notas = MOCK_DATA.notas?.filter(n => n.alunoId === alunoId) || [];
            const frequencias = MOCK_DATA.frequencias?.filter(f => f.alunoId === alunoId) || [];

            // Identificar pontos fortes e fracos
            const desempenhoPorDisciplina = {};
            notas.forEach(nota => {
                if (!desempenhoPorDisciplina[nota.disciplina]) {
                    desempenhoPorDisciplina[nota.disciplina] = {
                        soma: 0,
                        count: 0,
                        medias: []
                    };
                }
                desempenhoPorDisciplina[nota.disciplina].soma += nota.media;
                desempenhoPorDisciplina[nota.disciplina].count++;
                desempenhoPorDisciplina[nota.disciplina].medias.push(nota.media);
            });

            const pontosFortes = [];
            const pontosFracos = [];

            Object.entries(desempenhoPorDisciplina).forEach(([disciplina, dados]) => {
                const media = dados.soma / dados.count;
                const tendencia = dados.medias.length >= 3 
                    ? dados.medias[dados.medias.length - 1] - dados.medias[0]
                    : 0;

                if (media >= 8) {
                    pontosFortes.push({ disciplina, media, tendencia });
                } else if (media <= 6) {
                    pontosFracos.push({ disciplina, media, tendencia });
                }
            });

            // Identificar estilo de aprendizado (simulado)
            const estiloAprendizado = identificarEstiloAprendizado(alunoId);

            const perfil = {
                alunoId,
                alunoNome: aluno.nome,
                turma: aluno.turma,
                anoEscolar: extrairAnoEscolar(aluno.turma),
                pontosFortes,
                pontosFracos,
                estiloAprendizado,
                disciplinasPreferidas: pontosFortes.map(p => p.disciplina),
                disciplinasDificuldade: pontosFracos.map(p => p.disciplina),
                ultimaAnalise: new Date().toISOString()
            };

            perfilAlunos[alunoId] = perfil;
            salvarPerfis();

            return perfil;
        }

        function identificarEstiloAprendizado(alunoId) {
            // Simulação de identificação de estilo de aprendizado
            const estilos = [
                { nome: 'Visual', pontuacao: 0 },
                { nome: 'Auditivo', pontuacao: 0 },
                { nome: 'Cinestésico', pontuacao: 0 },
                { nome: 'Leitura/Escrita', pontuacao: 0 }
            ];

            // Baseado em interações passadas (simulado)
            estilos[0].pontuacao = Math.random() * 10;
            estilos[1].pontuacao = Math.random() * 10;
            estilos[2].pontuacao = Math.random() * 10;
            estilos[3].pontuacao = Math.random() * 10;

            const estiloPrincipal = estilos.reduce((max, est) => 
                est.pontuacao > max.pontuacao ? est : max
            );

            return {
                principal: estiloPrincipal.nome,
                pontuacoes: estilos
            };
        }

        // ==================== SISTEMA DE RECOMENDAÇÃO ====================
        function recomendarRecursos(alunoId, limite = 5) {
            const perfil = perfilAlunos[alunoId] || analisarPerfilAluno(alunoId);
            if (!perfil) return [];

            const recomendacoes = [];
            const recursos = recursosEducacionais.filter(r => 
                r.recomendadoParaAnos.includes(perfil.anoEscolar)
            );

            recursos.forEach(recurso => {
                const score = calcularScoreRecomendacao(recurso, perfil);
                
                if (score >= CONFIG.similaridadeMinima) {
                    recomendacoes.push({
                        ...recurso,
                        score,
                        razaoRecomendacao: gerarRazaoRecomendacao(recurso, perfil, score)
                    });
                }
            });

            // Ordenar por score e limitar
            recomendacoes.sort((a, b) => b.score - a.score);
            const selecionadas = recomendacoes.slice(0, limite);

            // Registrar recomendação
            historicoRecomendacoes.push({
                alunoId,
                data: new Date().toISOString(),
                recomendacoes: selecionadas.map(r => r.id),
                totalRecomendacoes: selecionadas.length
            });

            return selecionadas;
        }

        function calcularScoreRecomendacao(recurso, perfil) {
            let score = 0;

            // Pontos fracos têm prioridade
            if (perfil.disciplinasDificuldade.includes(recurso.disciplina)) {
                score += 0.4;
            } else if (perfil.disciplinasPreferidas.includes(recurso.disciplina)) {
                score += 0.2;
            }

            // Compatibilidade com estilo de aprendizado
            switch(perfil.estiloAprendizado.principal) {
                case 'Visual':
                    if ([CONFIG.tiposRecurso.VIDEO, CONFIG.tiposRecurso.MAPA_MENTAL].includes(recurso.tipo)) {
                        score += 0.3;
                    }
                    break;
                case 'Auditivo':
                    if ([CONFIG.tiposRecurso.VIDEO].includes(recurso.tipo)) {
                        score += 0.3;
                    }
                    break;
                case 'Cinestésico':
                    if ([CONFIG.tiposRecurso.JOGO, CONFIG.tiposRecurso.EXERCICIO].includes(recurso.tipo)) {
                        score += 0.3;
                    }
                    break;
                case 'Leitura/Escrita':
                    if ([CONFIG.tiposRecurso.LEITURA, CONFIG.tiposRecurso.RESUMO].includes(recurso.tipo)) {
                        score += 0.3;
                    }
                    break;
            }

            // Popularidade (avaliação)
            score += (recurso.avaliacao / 10) * 0.2;

            // Novidade (não visto recentemente)
            if (!foiRecomendadoRecentemente(alunoId, recurso.id)) {
                score += 0.1;
            }

            return Math.min(1, score);
        }

        function gerarRazaoRecomendacao(recurso, perfil, score) {
            const razoes = [];

            if (perfil.disciplinasDificuldade.includes(recurso.disciplina)) {
                razoes.push(`Para melhorar em ${recurso.disciplina}`);
            }

            if (recurso.tipo === perfil.estiloAprendizado.principal.toLowerCase()) {
                razoes.push(`Formato ideal para seu estilo de aprendizado`);
            }

            if (recurso.avaliacao >= 4.5) {
                razoes.push(`Altamente recomendado por outros alunos`);
            }

            if (recurso.dificuldade === CONFIG.niveisDificuldade.FACIL && 
                perfil.disciplinasDificuldade.includes(recurso.disciplina)) {
                razoes.push(`Comece pelo básico para construir confiança`);
            }

            return razoes.length > 0 ? razoes.join(' • ') : 'Recomendado para você';
        }

        function foiRecomendadoRecentemente(alunoId, recursoId) {
            const recentes = historicoRecomendacoes
                .filter(h => h.alunoId === alunoId)
                .slice(-5);
            
            return recentes.some(h => h.recomendacoes.includes(recursoId));
        }

        // ==================== RECOMENDAÇÕES PERSONALIZADAS ====================
        function recomendarCronogramaEstudo(alunoId) {
            const perfil = perfilAlunos[alunoId] || analisarPerfilAluno(alunoId);
            if (!perfil) return null;

            const recomendacoes = recomendarRecursos(alunoId, 20);
            
            // Agrupar por disciplina
            const porDisciplina = {};
            recomendacoes.forEach(rec => {
                if (!porDisciplina[rec.disciplina]) {
                    porDisciplina[rec.disciplina] = [];
                }
                porDisciplina[rec.disciplina].push(rec);
            });

            // Criar cronograma semanal
            const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            const cronograma = [];

            dias.forEach((dia, index) => {
                const diaCronograma = {
                    dia,
                    atividades: []
                };

                // Priorizar disciplinas com dificuldade nos primeiros dias
                if (index < 3) {
                    perfil.disciplinasDificuldade.forEach(disciplina => {
                        if (porDisciplina[disciplina] && porDisciplina[disciplina].length > 0) {
                            diaCronograma.atividades.push({
                                disciplina,
                                recurso: porDisciplina[disciplina][0],
                                duracao: 60,
                                periodo: 'manhã'
                            });
                            porDisciplina[disciplina].shift();
                        }
                    });
                }

                // Complementar com outras disciplinas
                Object.entries(porDisciplina).forEach(([disciplina, recursos]) => {
                    if (recursos.length > 0 && diaCronograma.atividades.length < 3) {
                        diaCronograma.atividades.push({
                            disciplina,
                            recurso: recursos[0],
                            duracao: 45,
                            periodo: index % 2 === 0 ? 'tarde' : 'manhã'
                        });
                        porDisciplina[disciplina].shift();
                    }
                });

                cronograma.push(diaCronograma);
            });

            return cronograma;
        }

        // ==================== INTERFACE DO USUÁRIO ====================
        function mostrarPainelRecomendacoes(alunoId) {
            const perfil = analisarPerfilAluno(alunoId);
            const recomendacoes = recomendarRecursos(alunoId, 10);
            const cronograma = recomendarCronogramaEstudo(alunoId);

            const modalHTML = `
                <div class="ia-recomendacoes-painel">
                    <div class="recomendacoes-header">
                        <h3><i class="fas fa-lightbulb"></i> Recomendações Personalizadas</h3>
                    </div>
                    
                    <div class="perfil-aluno">
                        <h4>Perfil de ${perfil.alunoNome}</h4>
                        <div class="perfil-grid">
                            <div class="pontos-fortes">
                                <strong>✅ Pontos Fortes</strong>
                                ${perfil.pontosFortes.map(p => `
                                    <div class="item-perfil">
                                        ${p.disciplina}: média ${p.media}
                                    </div>
                                `).join('')}
                                ${perfil.pontosFortes.length === 0 ? 
                                    '<p>Ainda identificando...</p>' : ''}
                            </div>
                            
                            <div class="pontos-fracos">
                                <strong>⚠️ Pontos de Melhoria</strong>
                                ${perfil.pontosFracos.map(p => `
                                    <div class="item-perfil">
                                        ${p.disciplina}: média ${p.media}
                                    </div>
                                `).join('')}
                                ${perfil.pontosFracos.length === 0 ? 
                                    '<p>Nenhum ponto crítico identificado</p>' : ''}
                            </div>
                            
                            <div class="estilo-aprendizado">
                                <strong>🎯 Estilo de Aprendizado</strong>
                                <div class="estilo-principal">
                                    ${perfil.estiloAprendizado.principal}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="recomendacoes-lista">
                        <h4>📚 Recursos Recomendados</h4>
                        <div class="recursos-grid">
                            ${recomendacoes.map(rec => `
                                <div class="recurso-card">
                                    <div class="recurso-tipo">
                                        <i class="fas ${getIconeTipo(rec.tipo)}"></i>
                                        <span class="dificuldade ${rec.dificuldade}">${rec.dificuldade}</span>
                                    </div>
                                    <h5>${rec.titulo}</h5>
                                    <p>${rec.descricao}</p>
                                    <div class="recurso-meta">
                                        <span>⭐ ${rec.avaliacao}</span>
                                        <span>⏱️ ${rec.duracao || '?'} min</span>
                                    </div>
                                    <div class="recurso-score">
                                        Compatibilidade: ${Math.round(rec.score * 100)}%
                                    </div>
                                    <p class="razao">${rec.razaoRecomendacao}</p>
                                    <button class="btn btn-sm btn-primary" onclick="acessarRecurso(${rec.id})">
                                        Acessar
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="cronograma-estudo">
                        <h4>📅 Cronograma de Estudos Sugerido</h4>
                        <div class="cronograma-grid">
                            ${cronograma.map(dia => `
                                <div class="dia-cronograma">
                                    <h5>${dia.dia}</h5>
                                    ${dia.atividades.map(ativ => `
                                        <div class="atividade-item">
                                            <strong>${ativ.disciplina}</strong>
                                            <span>${ativ.duracao}min</span>
                                            <small>${ativ.periodo}</small>
                                        </div>
                                    `).join('')}
                                    ${dia.atividades.length === 0 ? 
                                        '<p class="sem-atividade">Descanso</p>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

            // Adicionar estilos
            adicionarEstilosRecomendacoes();

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Recomendações de Estudo', modalHTML);
            }
        }

        function adicionarEstilosRecomendacoes() {
            if (document.getElementById('style-recomendacoes')) return;

            const style = document.createElement('style');
            style.id = 'style-recomendacoes';
            style.textContent = `
                .ia-recomendacoes-painel {
                    max-height: 600px;
                    overflow-y: auto;
                }
                
                .perfil-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 15px;
                    margin: 15px 0;
                    padding: 15px;
                    background: var(--tema-cardHover);
                    border-radius: var(--radius);
                }
                
                .item-perfil {
                    padding: 5px 0;
                    font-size: 0.9rem;
                }
                
                .estilo-principal {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: var(--tema-primary);
                    margin-top: 5px;
                }
                
                .recursos-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                    margin: 20px 0;
                }
                
                .recurso-card {
                    background: var(--tema-card);
                    padding: 20px;
                    border-radius: var(--radius);
                    border: 1px solid var(--tema-border);
                    transition: var(--transition);
                }
                
                .recurso-card:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-hover);
                }
                
                .recurso-tipo {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .recurso-tipo i {
                    font-size: 1.5rem;
                    color: var(--tema-primary);
                }
                
                .dificuldade {
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                
                .dificuldade.facil { background: #d4edda; color: #155724; }
                .dificuldade.medio { background: #fff3cd; color: #856404; }
                .dificuldade.dificil { background: #f8d7da; color: #721c24; }
                .dificuldade.avancado { background: #cce5ff; color: #004085; }
                
                .recurso-meta {
                    display: flex;
                    justify-content: space-between;
                    margin: 10px 0;
                    color: var(--tema-textSecondary);
                    font-size: 0.9rem;
                }
                
                .recurso-score {
                    height: 5px;
                    background: var(--tema-cardHover);
                    border-radius: 5px;
                    margin: 10px 0;
                    position: relative;
                }
                
                .recurso-score::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    height: 100%;
                    width: ${(score) => score * 100}%;
                    background: var(--tema-success);
                    border-radius: 5px;
                }
                
                .razao {
                    font-size: 0.85rem;
                    color: var(--tema-textSecondary);
                    font-style: italic;
                    margin: 10px 0;
                }
                
                .cronograma-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 10px;
                    margin-top: 15px;
                }
                
                .dia-cronograma {
                    background: var(--tema-cardHover);
                    padding: 15px;
                    border-radius: var(--radius);
                }
                
                .dia-cronograma h5 {
                    color: var(--tema-primary);
                    margin-bottom: 10px;
                    text-align: center;
                }
                
                .atividade-item {
                    background: white;
                    padding: 8px;
                    border-radius: var(--radius-sm);
                    margin-bottom: 5px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.85rem;
                }
                
                .sem-atividade {
                    text-align: center;
                    color: var(--tema-textSecondary);
                    font-style: italic;
                    padding: 10px;
                }
                
                @media (max-width: 768px) {
                    .perfil-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .recursos-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `;

            document.head.appendChild(style);
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function getIconeTipo(tipo) {
            const icones = {
                video: 'fa-video',
                exercicio: 'fa-pencil-alt',
                leitura: 'fa-book',
                jogo: 'fa-gamepad',
                resumo: 'fa-file-alt',
                mapa_mental: 'fa-sitemap'
            };
            return icones[tipo] || 'fa-file';
        }

        function extrairAnoEscolar(turma) {
            const match = turma?.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
        }

        function carregarPerfis() {
            try {
                const saved = localStorage.getItem('sme_perfis_alunos');
                if (saved) {
                    perfilAlunos = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar perfis:', e);
            }
        }

        function salvarPerfis() {
            try {
                localStorage.setItem('sme_perfis_alunos', JSON.stringify(perfilAlunos));
            } catch (e) {
                console.error('Erro ao salvar perfis:', e);
            }
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            analisarPerfilAluno,
            recomendarRecursos,
            recomendarCronogramaEstudo,
            mostrarPainelRecomendacoes
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_IA_RECOMENDACAO.init();
        }, 7000);
    });

    window.MODULO_IA_RECOMENDACAO = MODULO_IA_RECOMENDACAO;
    console.log('✅ Módulo de Recomendação de Estudos carregado');
}
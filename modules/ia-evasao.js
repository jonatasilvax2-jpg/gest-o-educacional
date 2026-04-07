// modulos/ia-evasao.js - Análise de Risco de Evasão Escolar com IA
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0 - FASE 4

if (typeof MODULO_IA_EVASAO === 'undefined') {
    const MODULO_IA_EVASAO = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            niveisRisco: {
                BAIXO: 'baixo',
                MEDIO: 'médio',
                ALTO: 'alto',
                CRITICO: 'crítico'
            },
            pesos: {
                frequencia: 0.30,
                desempenho: 0.25,
                socioeconomico: 0.20,
                comportamento: 0.15,
                engajamento: 0.10
            },
            limiares: {
                riscoBaixo: 0.3,
                riscoMedio: 0.5,
                riscoAlto: 0.7,
                riscoCritico: 0.85
            },
            fatoresRisco: [
                'frequencia_baixa',
                'notas_baixas',
                'reprovacoes',
                'problemas_disciplinares',
                'dificuldades_financeiras',
                'falta_engajamento_familiar',
                'distanciamento_escola',
                'mudanca_frequente'
            ]
        };

        // ==================== ESTADO ====================
        let analisesRisco = {};
        let metricasEvasao = {
            totalAnalises: 0,
            riscoBaixo: 0,
            riscoMedio: 0,
            riscoAlto: 0,
            riscoCritico: 0,
            previsaoEvasao: 0
        };

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('⚠️ Módulo de Análise de Risco de Evasão inicializado');
            
            // Carregar análises salvas
            carregarAnalises();
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    'Módulo de análise de evasão inicializado',
                    MODULO_AUDITORIA.categorias.IA,
                    MODULO_AUDITORIA.niveis.INFO
                );
            }
        }

        // ==================== ANÁLISE DE RISCO INDIVIDUAL ====================
        function analisarRiscoAluno(alunoId) {
            const aluno = MOCK_DATA.alunos?.find(a => a.id === alunoId);
            if (!aluno) return null;

            // Coletar dados do aluno
            const frequencias = MOCK_DATA.frequencias?.filter(f => f.alunoId === alunoId) || [];
            const notas = MOCK_DATA.notas?.filter(n => n.alunoId === alunoId) || [];
            const ocorrencias = MOCK_DATA.ocorrencias?.filter(o => o.alunoId === alunoId) || [];

            // Calcular indicadores de risco
            const indicadores = {
                frequencia: calcularIndicadorFrequencia(aluno, frequencias),
                desempenho: calcularIndicadorDesempenho(notas),
                socioeconomico: calcularIndicadorSocioeconomico(aluno),
                comportamento: calcularIndicadorComportamento(ocorrencias),
                engajamento: calcularIndicadorEngajamento(aluno, notas)
            };

            // Calcular score de risco
            const score = calcularScoreRisco(indicadores);
            
            // Determinar nível de risco
            const nivelRisco = determinarNivelRisco(score);
            
            // Identificar fatores críticos
            const fatoresCriticos = identificarFatoresCriticos(indicadores);
            
            // Gerar recomendações
            const recomendacoes = gerarRecomendacoesPreventivas(fatoresCriticos, nivelRisco);

            const analise = {
                alunoId,
                alunoNome: aluno.nome,
                dataAnalise: new Date().toISOString(),
                indicadores,
                score,
                nivelRisco,
                fatoresCriticos,
                recomendacoes,
                probabilidadeEvasao: calcularProbabilidadeEvasao(score)
            };

            analisesRisco[alunoId] = analise;
            atualizarMetricas(analise);
            salvarAnalises();

            // Se risco alto, gerar alerta
            if (nivelRisco === CONFIG.niveisRisco.ALTO || nivelRisco === CONFIG.niveisRisco.CRITICO) {
                gerarAlertaEvasao(analise);
            }

            return analise;
        }

        function calcularIndicadorFrequencia(aluno, frequencias) {
            if (frequencias.length === 0) {
                return aluno.faltas ? aluno.faltas / 40 : 0; // 40 é o máximo aproximado
            }

            const mediaFrequencia = frequencias.reduce((acc, f) => acc + f.percentual, 0) / frequencias.length;
            
            // Quanto menor a frequência, maior o risco
            const risco = Math.max(0, (100 - mediaFrequencia) / 100);
            
            // Ajustar por faltas consecutivas
            const faltasRecentes = aluno.faltas || 0;
            if (faltasRecentes > 10) {
                return Math.min(1, risco * 1.3);
            }
            
            return risco;
        }

        function calcularIndicadorDesempenho(notas) {
            if (notas.length === 0) return 0.5; // Valor médio para casos sem dados

            const medias = notas.map(n => n.media);
            const mediaGeral = medias.reduce((a, b) => a + b, 0) / medias.length;
            
            // Quanto menor a média, maior o risco
            const risco = Math.max(0, (10 - mediaGeral) / 10);

            // Analisar tendência (últimas 3 notas)
            if (medias.length >= 3) {
                const tendencia = medias[medias.length - 1] - medias[medias.length - 3];
                if (tendencia < -1) { // Queda significativa
                    return Math.min(1, risco * 1.2);
                }
            }

            return risco;
        }

        function calcularIndicadorSocioeconomico(aluno) {
            let risco = 0.3; // Risco base

            // Simulação baseada em dados demográficos (em produção, seriam dados reais)
            if (aluno.responsavel && aluno.responsavel.includes('Único')) {
                risco += 0.2; // Família monoparental
            }

            if (!aluno.telefone) {
                risco += 0.1; // Falta de contato
            }

            // Verificar se recebe auxílios (pode indicar vulnerabilidade)
            const auxilios = MOCK_DATA.auxilios?.filter(a => a.alunoId === aluno.id) || [];
            if (auxilios.length > 0) {
                risco += 0.15;
            }

            return Math.min(1, risco);
        }

        function calcularIndicadorComportamento(ocorrencias) {
            if (ocorrencias.length === 0) return 0.2; // Risco baixo para alunos sem ocorrências

            const ocorrenciasGraves = ocorrencias.filter(o => 
                o.tipo === 'indisciplina' || o.tipo === 'grave'
            ).length;

            const ocorrenciasRecentes = ocorrencias.filter(o => {
                const dataOcorrencia = new Date(o.data);
                const hoje = new Date();
                const diffDias = (hoje - dataOcorrencia) / (1000 * 60 * 60 * 24);
                return diffDias <= 30; // Últimos 30 dias
            }).length;

            let risco = 0.3 + (ocorrencias.length * 0.1);
            
            if (ocorrenciasGraves > 0) {
                risco += ocorrenciasGraves * 0.2;
            }
            
            if (ocorrenciasRecentes > 2) {
                risco += 0.2; // Comportamento recente problemático
            }

            return Math.min(1, risco);
        }

        function calcularIndicadorEngajamento(aluno, notas) {
            let risco = 0.3; // Risco base

            // Verificar participação em atividades
            const atividades = MOCK_DATA.atividades?.filter(a => 
                notas.some(n => n.alunoId === a.alunoId)
            ) || [];

            if (atividades.length < 3) {
                risco += 0.2; // Baixa participação
            }

            // Verificar entregas de atividades
            const entregas = MOCK_DATA.entregas?.filter(e => e.alunoId === aluno.id) || [];
            if (entregas.length < atividades.length * 0.7) {
                risco += 0.15; // Baixa taxa de entrega
            }

            // Verificar uso da biblioteca
            const emprestimos = MOCK_DATA.biblioteca?.emprestimos?.filter(e => e.alunoId === aluno.id) || [];
            if (emprestimos.length === 0) {
                risco += 0.1; // Não utiliza recursos da biblioteca
            }

            return Math.min(1, risco);
        }

        function calcularScoreRisco(indicadores) {
            let score = 0;
            
            score += indicadores.frequencia * CONFIG.pesos.frequencia;
            score += indicadores.desempenho * CONFIG.pesos.desempenho;
            score += indicadores.socioeconomico * CONFIG.pesos.socioeconomico;
            score += indicadores.comportamento * CONFIG.pesos.comportamento;
            score += indicadores.engajamento * CONFIG.pesos.engajamento;

            return Math.min(1, score);
        }

        function determinarNivelRisco(score) {
            if (score >= CONFIG.limiares.riscoCritico) return CONFIG.niveisRisco.CRITICO;
            if (score >= CONFIG.limiares.riscoAlto) return CONFIG.niveisRisco.ALTO;
            if (score >= CONFIG.limiares.riscoMedio) return CONFIG.niveisRisco.MEDIO;
            return CONFIG.niveisRisco.BAIXO;
        }

        function identificarFatoresCriticos(indicadores) {
            const fatores = [];

            if (indicadores.frequencia > 0.7) {
                fatores.push({
                    fator: 'frequencia_baixa',
                    intensidade: indicadores.frequencia,
                    descricao: 'Frequência muito baixa'
                });
            }

            if (indicadores.desempenho > 0.7) {
                fatores.push({
                    fator: 'notas_baixas',
                    intensidade: indicadores.desempenho,
                    descricao: 'Desempenho acadêmico crítico'
                });
            }

            if (indicadores.socioeconomico > 0.6) {
                fatores.push({
                    fator: 'dificuldades_financeiras',
                    intensidade: indicadores.socioeconomico,
                    descricao: 'Vulnerabilidade socioeconômica'
                });
            }

            if (indicadores.comportamento > 0.6) {
                fatores.push({
                    fator: 'problemas_disciplinares',
                    intensidade: indicadores.comportamento,
                    descricao: 'Problemas disciplinares recorrentes'
                });
            }

            if (indicadores.engajamento > 0.6) {
                fatores.push({
                    fator: 'falta_engajamento',
                    intensidade: indicadores.engajamento,
                    descricao: 'Baixo engajamento escolar'
                });
            }

            return fatores;
        }

        function calcularProbabilidadeEvasao(score) {
            // Simulação de cálculo de probabilidade baseado no score
            const probabilidade = score * 100;
            
            // Ajuste baseado em histórico (simulado)
            const ajusteHistorico = 0.9; // 90% de precisão histórica
            
            return Math.min(100, Math.round(probabilidade * ajusteHistorico));
        }

        function gerarRecomendacoesPreventivas(fatores, nivelRisco) {
            const recomendacoes = [];

            fatores.forEach(fator => {
                switch(fator.fator) {
                    case 'frequencia_baixa':
                        recomendacoes.push({
                            area: 'frequência',
                            acao: 'Contato imediato com responsáveis para investigar causas das faltas',
                            prioridade: 'alta',
                            prazo: '7 dias'
                        });
                        recomendacoes.push({
                            area: 'frequência',
                            acao: 'Oferecer transporte escolar se necessário',
                            prioridade: 'média',
                            prazo: '15 dias'
                        });
                        break;

                    case 'notas_baixas':
                        recomendacoes.push({
                            area: 'pedagógico',
                            acao: 'Encaminhar para aulas de reforço',
                            prioridade: 'alta',
                            prazo: 'imediato'
                        });
                        recomendacoes.push({
                            area: 'pedagógico',
                            acao: 'Avaliação psicopedagógica',
                            prioridade: 'média',
                            prazo: '30 dias'
                        });
                        break;

                    case 'dificuldades_financeiras':
                        recomendacoes.push({
                            area: 'assistência',
                            acao: 'Avaliar elegibilidade para programas de auxílio',
                            prioridade: 'alta',
                            prazo: '15 dias'
                        });
                        recomendacoes.push({
                            area: 'assistência',
                            acao: 'Encaminhar para serviço social',
                            prioridade: 'média',
                            prazo: '30 dias'
                        });
                        break;

                    case 'problemas_disciplinares':
                        recomendacoes.push({
                            area: 'disciplinar',
                            acao: 'Acompanhamento com orientação educacional',
                            prioridade: 'alta',
                            prazo: 'imediato'
                        });
                        recomendacoes.push({
                            area: 'disciplinar',
                            acao: 'Desenvolver plano de mediação de conflitos',
                            prioridade: 'média',
                            prazo: '15 dias'
                        });
                        break;

                    case 'falta_engajamento':
                        recomendacoes.push({
                            area: 'engajamento',
                            acao: 'Convidar para atividades extracurriculares',
                            prioridade: 'média',
                            prazo: '7 dias'
                        });
                        recomendacoes.push({
                            area: 'engajamento',
                            acao: 'Atribuir tutor ou mentor',
                            prioridade: 'baixa',
                            prazo: '30 dias'
                        });
                        break;
                }
            });

            // Recomendações adicionais baseadas no nível de risco
            if (nivelRisco === CONFIG.niveisRisco.CRITICO) {
                recomendacoes.push({
                    area: 'geral',
                    acao: 'REUNIÃO DE CRISE - Convocar equipe multidisciplinar',
                    prioridade: 'urgente',
                    prazo: '24 horas'
                });
                recomendacoes.push({
                    area: 'geral',
                    acao: 'Notificar Conselho Tutelar',
                    prioridade: 'urgente',
                    prazo: '48 horas'
                });
            }

            return recomendacoes;
        }

        function gerarAlertaEvasao(analise) {
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoErro(
                    '🚨 ALERTA DE EVASÃO',
                    `Aluno ${analise.alunoNome} apresenta risco ${analise.nivelRisco} de evasão (${analise.probabilidadeEvasao}%)`,
                    {
                        prioridade: analise.nivelRisco === CONFIG.niveisRisco.CRITICO ? 3 : 2,
                        acao: () => mostrarDetalhesRisco(analise.alunoId)
                    }
                );
            }
        }

        // ==================== ANÁLISE COLETIVA ====================
        function analisarRiscoTurma(turmaId) {
            const alunos = MOCK_DATA.alunos?.filter(a => a.turmaId === turmaId) || [];
            const analises = [];

            alunos.forEach(aluno => {
                const analise = analisarRiscoAluno(aluno.id);
                if (analise) analises.push(analise);
            });

            const estatisticas = {
                turmaId,
                totalAlunos: alunos.length,
                analisesRealizadas: analises.length,
                distribuicaoRisco: {
                    baixo: analises.filter(a => a.nivelRisco === CONFIG.niveisRisco.BAIXO).length,
                    medio: analises.filter(a => a.nivelRisco === CONFIG.niveisRisco.MEDIO).length,
                    alto: analises.filter(a => a.nivelRisco === CONFIG.niveisRisco.ALTO).length,
                    critico: analises.filter(a => a.nivelRisco === CONFIG.niveisRisco.CRITICO).length
                },
                mediaRisco: analises.reduce((acc, a) => acc + a.score, 0) / analises.length,
                alunosCriticos: analises
                    .filter(a => a.nivelRisco === CONFIG.niveisRisco.ALTO || a.nivelRisco === CONFIG.niveisRisco.CRITICO)
                    .map(a => ({
                        nome: a.alunoNome,
                        risco: a.nivelRisco,
                        probabilidade: a.probabilidadeEvasao
                    }))
            };

            return estatisticas;
        }

        function analisarRiscoEscola(escolaId) {
            const alunos = MOCK_DATA.alunos?.filter(a => a.escolaId === escolaId) || [];
            const analises = [];

            alunos.forEach(aluno => {
                const analise = analisarRiscoAluno(aluno.id);
                if (analise) analises.push(analise);
            });

            return {
                escolaId,
                totalAlunos: alunos.length,
                alunosEmRisco: analises.filter(a => 
                    a.nivelRisco === CONFIG.niveisRisco.ALTO || 
                    a.nivelRisco === CONFIG.niveisRisco.CRITICO
                ).length,
                percentualRisco: (analises.filter(a => a.score > 0.5).length / analises.length * 100).toFixed(1),
                distribuicao: {
                    baixo: analises.filter(a => a.nivelRisco === CONFIG.niveisRisco.BAIXO).length,
                    medio: analises.filter(a => a.nivelRisco === CONFIG.niveisRisco.MEDIO).length,
                    alto: analises.filter(a => a.nivelRisco === CONFIG.niveisRisco.ALTO).length,
                    critico: analises.filter(a => a.nivelRisco === CONFIG.niveisRisco.CRITICO).length
                }
            };
        }

        // ==================== INTERFACE DO USUÁRIO ====================
        function mostrarPainelEvasao() {
            const alunosRisco = Object.values(analisesRisco)
                .filter(a => a.nivelRisco === CONFIG.niveisRisco.ALTO || a.nivelRisco === CONFIG.niveisRisco.CRITICO)
                .sort((a, b) => b.score - a.score);

            const estatisticasEscola = analisarRiscoEscola(1); // Assumindo escola 1

            const modalHTML = `
                <div class="ia-evasao-painel">
                    <div class="evasao-header">
                        <h3><i class="fas fa-exclamation-triangle"></i> Análise de Risco de Evasão</h3>
                    </div>
                    
                    <div class="evasao-stats">
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>Total Alunos</h3>
                                <p class="stat-number">${estatisticasEscola.totalAlunos}</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>Em Risco</h3>
                                <p class="stat-number text-danger">${estatisticasEscola.alunosEmRisco}</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>Percentual</h3>
                                <p class="stat-number text-warning">${estatisticasEscola.percentualRisco}%</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>Risco Crítico</h3>
                                <p class="stat-number text-danger">${estatisticasEscola.distribuicao.critico}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="evasao-grafico">
                        <h4>Distribuição de Risco</h4>
                        <div class="barras-risco">
                            <div class="barra-item">
                                <span>Baixo</span>
                                <div class="progress-bar-container">
                                    <div class="progress-bar bg-success" 
                                         style="width: ${(estatisticasEscola.distribuicao.baixo/estatisticasEscola.totalAlunos*100)}%">
                                    </div>
                                </div>
                                <span>${estatisticasEscola.distribuicao.baixo}</span>
                            </div>
                            <div class="barra-item">
                                <span>Médio</span>
                                <div class="progress-bar-container">
                                    <div class="progress-bar bg-warning" 
                                         style="width: ${(estatisticasEscola.distribuicao.medio/estatisticasEscola.totalAlunos*100)}%">
                                    </div>
                                </div>
                                <span>${estatisticasEscola.distribuicao.medio}</span>
                            </div>
                            <div class="barra-item">
                                <span>Alto</span>
                                <div class="progress-bar-container">
                                    <div class="progress-bar bg-danger" 
                                         style="width: ${(estatisticasEscola.distribuicao.alto/estatisticasEscola.totalAlunos*100)}%">
                                    </div>
                                </div>
                                <span>${estatisticasEscola.distribuicao.alto}</span>
                            </div>
                            <div class="barra-item">
                                <span>Crítico</span>
                                <div class="progress-bar-container">
                                    <div class="progress-bar bg-dark" 
                                         style="width: ${(estatisticasEscola.distribuicao.critico/estatisticasEscola.totalAlunos*100)}%">
                                    </div>
                                </div>
                                <span>${estatisticasEscola.distribuicao.critico}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="evasao-lista">
                        <h4>🚨 Alunos em Situação Crítica</h4>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Aluno</th>
                                    <th>Risco</th>
                                    <th>Probabilidade</th>
                                    <th>Fatores Críticos</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${alunosRisco.slice(0, 10).map(analise => `
                                    <tr>
                                        <td>${analise.alunoNome}</td>
                                        <td>
                                            <span class="status-badge ${analise.nivelRisco}">
                                                ${analise.nivelRisco}
                                            </span>
                                        </td>
                                        <td class="${analise.probabilidadeEvasao > 70 ? 'text-danger' : 'text-warning'}">
                                            ${analise.probabilidadeEvasao}%
                                        </td>
                                        <td>
                                            ${analise.fatoresCriticos.map(f => `
                                                <span class="badge badge-warning" title="${f.descricao}">
                                                    ${f.fator}
                                                </span>
                                            `).join('')}
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="verPlanoAcao(${analise.alunoId})">
                                                Ver Plano
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="evasao-recomendacoes">
                        <h4>📋 Recomendações Prioritárias</h4>
                        <div class="recomendacoes-lista">
                            ${alunosRisco.slice(0, 3).map(analise => `
                                <div class="recomendacao-card ${analise.nivelRisco}">
                                    <h5>${analise.alunoNome}</h5>
                                    <ul>
                                        ${analise.recomendacoes.slice(0, 3).map(rec => `
                                            <li>
                                                <strong>${rec.area}:</strong> ${rec.acao}
                                                <span class="prazo">${rec.prazo}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                    <button class="btn btn-sm btn-outline-primary">Plano Completo</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

            // Adicionar estilos
            adicionarEstilosEvasao();

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Análise de Risco de Evasão', modalHTML);
            }
        }

        function adicionarEstilosEvasao() {
            if (document.getElementById('style-evasao')) return;

            const style = document.createElement('style');
            style.id = 'style-evasao';
            style.textContent = `
                .ia-evasao-painel {
                    max-height: 600px;
                    overflow-y: auto;
                }
                
                .evasao-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin: 20px 0;
                }
                
                .evasao-grafico {
                    background: var(--tema-cardHover);
                    padding: 20px;
                    border-radius: var(--radius);
                    margin: 20px 0;
                }
                
                .barras-risco {
                    margin-top: 15px;
                }
                
                .barra-item {
                    display: grid;
                    grid-template-columns: 80px 1fr 50px;
                    align-items: center;
                    gap: 10px;
                    margin: 10px 0;
                }
                
                .bg-dark {
                    background: #2c3e50;
                }
                
                .status-badge.crítico {
                    background: #2c3e50;
                    color: white;
                }
                
                .recomendacoes-lista {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    margin-top: 15px;
                }
                
                .recomendacao-card {
                    background: var(--tema-card);
                    padding: 20px;
                    border-radius: var(--radius);
                    border: 1px solid var(--tema-border);
                    border-left-width: 4px;
                }
                
                .recomendacao-card.alto {
                    border-left-color: var(--tema-danger);
                }
                
                .recomendacao-card.crítico {
                    border-left-color: #2c3e50;
                }
                
                .recomendacao-card ul {
                    margin: 15px 0;
                    padding-left: 20px;
                }
                
                .recomendacao-card li {
                    margin: 10px 0;
                }
                
                .prazo {
                    display: block;
                    font-size: 0.8rem;
                    color: var(--tema-textSecondary);
                }
                
                .btn-outline-primary {
                    background: transparent;
                    border: 1px solid var(--tema-primary);
                    color: var(--tema-primary);
                }
                
                .btn-outline-primary:hover {
                    background: var(--tema-primary);
                    color: white;
                }
                
                @media (max-width: 768px) {
                    .evasao-stats {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    
                    .barra-item {
                        grid-template-columns: 60px 1fr 40px;
                        font-size: 0.9rem;
                    }
                }
            `;

            document.head.appendChild(style);
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function atualizarMetricas(analise) {
            metricasEvasao.totalAnalises++;
            
            switch(analise.nivelRisco) {
                case CONFIG.niveisRisco.BAIXO:
                    metricasEvasao.riscoBaixo++;
                    break;
                case CONFIG.niveisRisco.MEDIO:
                    metricasEvasao.riscoMedio++;
                    break;
                case CONFIG.niveisRisco.ALTO:
                    metricasEvasao.riscoAlto++;
                    break;
                case CONFIG.niveisRisco.CRITICO:
                    metricasEvasao.riscoCritico++;
                    break;
            }
            
            metricasEvasao.previsaoEvasao = (metricasEvasao.riscoAlto + metricasEvasao.riscoCritico) / 
                                            metricasEvasao.totalAnalises * 100;
        }

        function mostrarDetalhesRisco(alunoId) {
            const analise = analisesRisco[alunoId];
            if (!analise) return;

            // Implementar visualização detalhada
            console.log('Detalhes do risco:', analise);
        }

        function carregarAnalises() {
            try {
                const saved = localStorage.getItem('sme_analises_evasao');
                if (saved) {
                    analisesRisco = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar análises:', e);
            }
        }

        function salvarAnalises() {
            try {
                localStorage.setItem('sme_analises_evasao', JSON.stringify(analisesRisko));
            } catch (e) {
                console.error('Erro ao salvar análises:', e);
            }
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            analisarRiscoAluno,
            analisarRiscoTurma,
            analisarRiscoEscola,
            mostrarPainelEvasao,
            getMetricas: () => ({ ...metricasEvasao }),
            getAnalise: (alunoId) => analisesRisco[alunoId]
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_IA_EVASAO.init();
        }, 7500);
    });

    window.MODULO_IA_EVASAO = MODULO_IA_EVASAO;
    console.log('✅ Módulo de Análise de Risco de Evasão carregado');
}
// modulos/ia-previsao.js - Previsão de Desempenho com IA
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0 - FASE 4

if (typeof MODULO_IA_PREVISAO === 'undefined') {
    const MODULO_IA_PREVISAO = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            modelos: {
                REGRESSAO_LINEAR: 'regressao_linear',
                RANDOM_FOREST: 'random_forest',
                REDE_NEURAL: 'rede_neural'
            },
            precisaoMinima: 0.7,
            historicoMinimo: 10,
            fatoresRisco: [
                'frequencia_baixa',
                'notas_baixas',
                'atrasos_frequentes',
                'problemas_disciplina',
                'falta_engajamento'
            ]
        };

        // ==================== ESTADO ====================
        let modelosTreinados = {};
        let predicoes = [];
        let metricas = {
            totalPredicoes: 0,
            acuraciaMedia: 0,
            alunosRisco: 0
        };

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('🤖 Módulo de IA - Previsão de Desempenho inicializado');
            
            // Carregar modelos salvos
            carregarModelos();
            
            // Treinar modelos iniciais
            treinarModelos();
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    'Módulo de IA de previsão inicializado',
                    MODULO_AUDITORIA.categorias.IA,
                    MODULO_AUDITORIA.niveis.INFO
                );
            }
        }

        // ==================== PREPARAÇÃO DE DADOS ====================
        function prepararDadosTreinamento() {
            const alunos = MOCK_DATA.alunos || [];
            const notas = MOCK_DATA.notas || [];
            const frequencias = MOCK_DATA.frequencias || [];
            
            const dadosTreinamento = [];
            
            alunos.forEach(aluno => {
                // Coletar notas do aluno
                const notasAluno = notas.filter(n => n.alunoId === aluno.id);
                
                if (notasAluno.length >= CONFIG.historicoMinimo) {
                    const medias = notasAluno.map(n => n.media);
                    const mediaGeral = medias.reduce((a, b) => a + b, 0) / medias.length;
                    
                    // Calcular frequência
                    const freqAluno = frequencias.filter(f => f.alunoId === aluno.id);
                    const freqMedia = freqAluno.length > 0 
                        ? freqAluno.reduce((a, f) => a + f.percentual, 0) / freqAluno.length
                        : 0;
                    
                    // Calcular tendência (últimas 3 notas)
                    const ultimasNotas = notasAluno.slice(-3).map(n => n.media);
                    const tendencia = ultimasNotas.length >= 3 
                        ? (ultimasNotas[2] - ultimasNotas[0]) / 2
                        : 0;
                    
                    dadosTreinamento.push({
                        alunoId: aluno.id,
                        features: {
                            mediaGeral,
                            frequencia: freqMedia,
                            tendencia,
                            variabilidade: calcularVariabilidade(medias),
                            anoEscolar: extrairAnoEscolar(aluno.turma),
                            faltas: aluno.faltas || 0
                        },
                        target: mediaGeral // Para regressão
                    });
                }
            });
            
            return dadosTreinamento;
        }

        function calcularVariabilidade(medias) {
            if (medias.length < 2) return 0;
            const media = medias.reduce((a, b) => a + b, 0) / medias.length;
            const variancia = medias.reduce((a, b) => a + Math.pow(b - media, 2), 0) / medias.length;
            return Math.sqrt(variancia);
        }

        function extrairAnoEscolar(turma) {
            const match = turma?.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
        }

        // ==================== MODELOS DE IA SIMULADOS ====================
        function treinarModelos() {
            console.log('🧠 Treinando modelos de IA...');
            
            const dados = prepararDadosTreinamento();
            
            if (dados.length === 0) {
                console.warn('⚠️ Dados insuficientes para treinamento');
                return;
            }
            
            // Simular treinamento de diferentes modelos
            modelosTreinados = {
                [CONFIG.modelos.REGRESSAO_LINEAR]: treinarRegressaoLinear(dados),
                [CONFIG.modelos.RANDOM_FOREST]: treinarRandomForest(dados),
                [CONFIG.modelos.REDE_NEURAL]: treinarRedeNeural(dados)
            };
            
            console.log('✅ Modelos treinados com sucesso');
        }

        function treinarRegressaoLinear(dados) {
            // Simulação simplificada de regressão linear
            const features = dados.map(d => d.features);
            const targets = dados.map(d => d.target);
            
            // Calcular pesos simulados
            const pesos = {
                mediaGeral: 0.35,
                frequencia: 0.25,
                tendencia: 0.20,
                variabilidade: -0.10,
                anoEscolar: 0.05,
                faltas: -0.05
            };
            
            return {
                tipo: CONFIG.modelos.REGRESSAO_LINEAR,
                pesos,
                precisao: calcularPrecisaoModelo(dados, pesos),
                dataTreinamento: new Date().toISOString(),
                amostras: dados.length
            };
        }

        function treinarRandomForest(dados) {
            // Simulação de Random Forest
            return {
                tipo: CONFIG.modelos.RANDOM_FOREST,
                precisao: 0.82 + Math.random() * 0.1,
                arvores: 100,
                profundidadeMaxima: 10,
                dataTreinamento: new Date().toISOString(),
                amostras: dados.length
            };
        }

        function treinarRedeNeural(dados) {
            // Simulação de Rede Neural
            return {
                tipo: CONFIG.modelos.REDE_NEURAL,
                precisao: 0.85 + Math.random() * 0.1,
                camadas: [10, 20, 10],
                epocas: 100,
                dataTreinamento: new Date().toISOString(),
                amostras: dados.length
            };
        }

        function calcularPrecisaoModelo(dados, pesos) {
            // Simular cálculo de precisão
            return 0.75 + Math.random() * 0.2;
        }

        // ==================== PREVISÕES ====================
        function preverDesempenhoAluno(alunoId, modelo = CONFIG.modelos.RANDOM_FOREST) {
            const aluno = MOCK_DATA.alunos?.find(a => a.id === alunoId);
            if (!aluno) return null;
            
            const notas = MOCK_DATA.notas?.filter(n => n.alunoId === alunoId) || [];
            const frequencias = MOCK_DATA.frequencias?.filter(f => f.alunoId === alunoId) || [];
            
            // Extrair features
            const medias = notas.map(n => n.media);
            const mediaGeral = medias.length > 0 
                ? medias.reduce((a, b) => a + b, 0) / medias.length 
                : 0;
                
            const freqMedia = frequencias.length > 0
                ? frequencias.reduce((a, f) => a + f.percentual, 0) / frequencias.length
                : 0;
                
            const tendencia = medias.length >= 3
                ? (medias[medias.length - 1] - medias[medias.length - 3]) / 2
                : 0;
                
            const features = {
                mediaGeral,
                frequencia: freqMedia,
                tendencia,
                variabilidade: calcularVariabilidade(medias),
                anoEscolar: extrairAnoEscolar(aluno.turma),
                faltas: aluno.faltas || 0
            };
            
            // Fazer previsão com o modelo selecionado
            let previsao;
            switch(modelo) {
                case CONFIG.modelos.REGRESSAO_LINEAR:
                    previsao = preverRegressaoLinear(features);
                    break;
                case CONFIG.modelos.RANDOM_FOREST:
                    previsao = preverRandomForest(features);
                    break;
                case CONFIG.modelos.REDE_NEURAL:
                    previsao = preverRedeNeural(features);
                    break;
                default:
                    previsao = preverRegressaoLinear(features);
            }
            
            // Calcular nível de confiança
            const confianca = calcularConfianca(features, modelo);
            
            // Identificar riscos
            const riscos = identificarRiscos(aluno, features);
            
            const resultado = {
                alunoId,
                alunoNome: aluno.nome,
                dataPrevisao: new Date().toISOString(),
                modelo,
                previsao: previsao.toFixed(2),
                confianca: (confianca * 100).toFixed(1) + '%',
                faixa: classificarDesempenho(previsao),
                riscos,
                recomendacoes: gerarRecomendacoes(riscos, previsao),
                features
            };
            
            predicoes.push(resultado);
            metricas.totalPredicoes++;
            
            return resultado;
        }

        function preverRegressaoLinear(features) {
            const modelo = modelosTreinados[CONFIG.modelos.REGRESSAO_LINEAR];
            if (!modelo) return features.mediaGeral;
            
            const { pesos } = modelo;
            
            let previsao = 0;
            previsao += features.mediaGeral * pesos.mediaGeral;
            previsao += features.frequencia / 100 * pesos.frequencia;
            previsao += features.tendencia * pesos.tendencia;
            previsao += features.variabilidade * pesos.variabilidade;
            previsao += features.anoEscolar / 10 * pesos.anoEscolar;
            previsao += features.faltas * pesos.faltas;
            
            // Normalizar
            previsao = Math.min(10, Math.max(0, previsao * 2));
            
            return previsao;
        }

        function preverRandomForest(features) {
            // Simulação de Random Forest
            const base = features.mediaGeral;
            const variacao = (Math.random() - 0.5) * 0.5;
            return Math.min(10, Math.max(0, base + variacao));
        }

        function preverRedeNeural(features) {
            // Simulação de Rede Neural
            const base = features.mediaGeral;
            const tendencia = features.tendencia * 0.3;
            const freq = features.frequencia / 100 * 0.2;
            return Math.min(10, Math.max(0, base + tendencia + freq));
        }

        function calcularConfianca(features, modelo) {
            // Calcular confiança baseado na qualidade dos dados
            let confianca = 0.5;
            
            if (features.mediaGeral > 0) confianca += 0.2;
            if (features.frequencia > 0) confianca += 0.15;
            if (features.tendencia !== 0) confianca += 0.1;
            
            // Ajustar por modelo
            const modeloInfo = modelosTreinados[modelo];
            if (modeloInfo) {
                confianca += modeloInfo.precisao * 0.3;
            }
            
            return Math.min(1, confianca);
        }

        function classificarDesempenho(nota) {
            if (nota >= 9) return 'Excelente';
            if (nota >= 7.5) return 'Bom';
            if (nota >= 6) return 'Regular';
            if (nota >= 5) return 'Atenção';
            return 'Crítico';
        }

        function identificarRiscos(aluno, features) {
            const riscos = [];
            
            if (features.frequencia < 75) {
                riscos.push({
                    tipo: 'frequencia_baixa',
                    nivel: 'alto',
                    descricao: 'Frequência abaixo do mínimo recomendado'
                });
            }
            
            if (features.mediaGeral < 6) {
                riscos.push({
                    tipo: 'notas_baixas',
                    nivel: 'médio',
                    descricao: 'Média geral abaixo da média'
                });
            }
            
            if (features.tendencia < -0.5) {
                riscos.push({
                    tipo: 'tendencia_queda',
                    nivel: 'médio',
                    descricao: 'Desempenho em declínio'
                });
            }
            
            if (features.variabilidade > 2) {
                riscos.push({
                    tipo: 'instabilidade',
                    nivel: 'baixo',
                    descricao: 'Desempenho instável entre disciplinas'
                });
            }
            
            if (aluno.faltas > 10) {
                riscos.push({
                    tipo: 'faltas_excessivas',
                    nivel: 'alto',
                    descricao: 'Muitas faltas registradas'
                });
            }
            
            return riscos;
        }

        function gerarRecomendacoes(riscos, previsao) {
            const recomendacoes = [];
            
            if (previsao < 6) {
                recomendacoes.push({
                    area: 'reforço',
                    acao: 'Encaminhar para aulas de reforço',
                    prioridade: 'alta'
                });
            }
            
            riscos.forEach(risco => {
                switch(risco.tipo) {
                    case 'frequencia_baixa':
                        recomendacoes.push({
                            area: 'frequência',
                            acao: 'Contatar responsáveis sobre baixa frequência',
                            prioridade: risco.nivel
                        });
                        break;
                    case 'notas_baixas':
                        recomendacoes.push({
                            area: 'pedagógico',
                            acao: 'Avaliar dificuldades de aprendizagem',
                            prioridade: 'média'
                        });
                        break;
                    case 'tendencia_queda':
                        recomendacoes.push({
                            area: 'acompanhamento',
                            acao: 'Acompanhamento pedagógico individualizado',
                            prioridade: 'média'
                        });
                        break;
                }
            });
            
            return recomendacoes;
        }

        // ==================== ANÁLISE PREDITIVA ====================
        function identificarAlunosRisco(limiar = 6) {
            const alunos = MOCK_DATA.alunos || [];
            const alunosRisco = [];
            
            alunos.forEach(aluno => {
                const previsao = preverDesempenhoAluno(aluno.id);
                if (previsao && previsao.previsao < limiar) {
                    alunosRisco.push({
                        ...previsao,
                        nivelRisco: previsao.previsao < 5 ? 'alto' : 'médio'
                    });
                }
            });
            
            metricas.alunosRisco = alunosRisco.length;
            
            return alunosRisco.sort((a, b) => a.previsao - b.previsao);
        }

        function analisarTendenciasTurma(turmaId) {
            const alunos = MOCK_DATA.alunos?.filter(a => a.turmaId === turmaId) || [];
            const tendencias = [];
            
            alunos.forEach(aluno => {
                const previsao = preverDesempenhoAluno(aluno.id);
                if (previsao) {
                    tendencias.push(previsao);
                }
            });
            
            const mediaTurma = tendencias.reduce((acc, t) => acc + parseFloat(t.previsao), 0) / tendencias.length;
            const desvio = Math.sqrt(
                tendencias.reduce((acc, t) => acc + Math.pow(parseFloat(t.previsao) - mediaTurma, 2), 0) / tendencias.length
            );
            
            return {
                turmaId,
                totalAlunos: alunos.length,
                alunosAnalisados: tendencias.length,
                mediaPrevista: mediaTurma.toFixed(2),
                desvioPadrao: desvio.toFixed(2),
                distribuicao: {
                    excelente: tendencias.filter(t => parseFloat(t.previsao) >= 9).length,
                    bom: tendencias.filter(t => parseFloat(t.previsao) >= 7.5 && parseFloat(t.previsao) < 9).length,
                    regular: tendencias.filter(t => parseFloat(t.previsao) >= 6 && parseFloat(t.previsao) < 7.5).length,
                    atencao: tendencias.filter(t => parseFloat(t.previsao) >= 5 && parseFloat(t.previsao) < 6).length,
                    critico: tendencias.filter(t => parseFloat(t.previsao) < 5).length
                }
            };
        }

        // ==================== INTERFACE DO USUÁRIO ====================
        function mostrarPainelIA() {
            const alunosRisco = identificarAlunosRisco();
            
            const modalHTML = `
                <div class="ia-painel">
                    <div class="ia-header">
                        <h3><i class="fas fa-robot"></i> Análise Preditiva com IA</h3>
                    </div>
                    
                    <div class="ia-stats">
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>Alunos Analisados</h3>
                                <p class="stat-number">${metricas.totalPredicoes}</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>Alunos em Risco</h3>
                                <p class="stat-number text-danger">${metricas.alunosRisco}</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>Modelos Ativos</h3>
                                <p class="stat-number">${Object.keys(modelosTreinados).length}</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>Acurácia Média</h3>
                                <p class="stat-number">${calcularAcuraciaMedia()}%</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ia-modelos">
                        <h4>Modelos de IA Disponíveis</h4>
                        <div class="modelos-grid">
                            ${Object.entries(modelosTreinados).map(([key, modelo]) => `
                                <div class="modelo-card">
                                    <h5>${formatarNomeModelo(key)}</h5>
                                    <p>Acurácia: ${(modelo.precisao * 100).toFixed(1)}%</p>
                                    <p>Amostras: ${modelo.amostras}</p>
                                    <p>Treinado: ${new Date(modelo.dataTreinamento).toLocaleDateString()}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="ia-risco">
                        <h4>Alunos em Risco de Reprovação</h4>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Aluno</th>
                                    <th>Previsão</th>
                                    <th>Confiança</th>
                                    <th>Nível</th>
                                    <th>Riscos</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${alunosRisco.map(a => `
                                    <tr>
                                        <td>${a.alunoNome}</td>
                                        <td class="${a.previsao < 5 ? 'text-danger' : 'text-warning'}">
                                            ${a.previsao}
                                        </td>
                                        <td>${a.confianca}</td>
                                        <td>
                                            <span class="status-badge ${a.nivelRisco}">
                                                ${a.nivelRisco}
                                            </span>
                                        </td>
                                        <td>
                                            ${a.riscos.map(r => `
                                                <span class="badge badge-warning" title="${r.descricao}">
                                                    ${r.tipo}
                                                </span>
                                            `).join('')}
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="verRecomendacoes(${a.alunoId})">
                                                Ver Ações
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="ia-turmas">
                        <h4>Análise por Turma</h4>
                        <div class="turmas-grid">
                            ${MOCK_DATA.turmas.map(turma => {
                                const analise = analisarTendenciasTurma(turma.id);
                                return `
                                    <div class="turma-ia-card">
                                        <h5>Turma ${turma.nome}</h5>
                                        <p>Média Prevista: <strong>${analise.mediaPrevista}</strong></p>
                                        <div class="distribuicao-mini">
                                            <div class="barra-excelente" style="width: ${(analise.distribuicao.excelente/analise.totalAlunos*100)}%"></div>
                                            <div class="barra-bom" style="width: ${(analise.distribuicao.bom/analise.totalAlunos*100)}%"></div>
                                            <div class="barra-regular" style="width: ${(analise.distribuicao.regular/analise.totalAlunos*100)}%"></div>
                                            <div class="barra-atencao" style="width: ${(analise.distribuicao.atencao/analise.totalAlunos*100)}%"></div>
                                            <div class="barra-critico" style="width: ${(analise.distribuicao.critico/analise.totalAlunos*100)}%"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            // Adicionar estilos
            adicionarEstilosIA();
            
            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Análise com IA', modalHTML);
            }
        }

        function adicionarEstilosIA() {
            if (document.getElementById('style-ia')) return;

            const style = document.createElement('style');
            style.id = 'style-ia';
            style.textContent = `
                .ia-painel {
                    max-height: 600px;
                    overflow-y: auto;
                    padding: 10px;
                }
                
                .ia-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin: 20px 0;
                }
                
                .modelos-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin: 15px 0;
                }
                
                .modelo-card {
                    background: var(--tema-cardHover);
                    padding: 15px;
                    border-radius: var(--radius);
                    border: 1px solid var(--tema-border);
                }
                
                .modelo-card h5 {
                    color: var(--tema-primary);
                    margin-bottom: 10px;
                }
                
                .ia-risco {
                    margin: 30px 0;
                }
                
                .turmas-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }
                
                .turma-ia-card {
                    background: var(--tema-card);
                    padding: 15px;
                    border-radius: var(--radius);
                    border: 1px solid var(--tema-border);
                }
                
                .distribuicao-mini {
                    display: flex;
                    height: 10px;
                    margin: 10px 0;
                    border-radius: 5px;
                    overflow: hidden;
                }
                
                .barra-excelente { background: #2ecc71; }
                .barra-bom { background: #3498db; }
                .barra-regular { background: #f1c40f; }
                .barra-atencao { background: #e67e22; }
                .barra-critico { background: #e74c3c; }
                
                .badge-warning {
                    background: var(--tema-warning);
                    color: white;
                    margin: 2px;
                    display: inline-block;
                }
                
                @media (max-width: 768px) {
                    .ia-stats {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `;

            document.head.appendChild(style);
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function formatarNomeModelo(modelo) {
            const nomes = {
                regressao_linear: 'Regressão Linear',
                random_forest: 'Random Forest',
                rede_neural: 'Rede Neural'
            };
            return nomes[modelo] || modelo;
        }

        function calcularAcuraciaMedia() {
            const valores = Object.values(modelosTreinados).map(m => m.precisao);
            if (valores.length === 0) return '0.0';
            const media = valores.reduce((a, b) => a + b, 0) / valores.length;
            return (media * 100).toFixed(1);
        }

        function carregarModelos() {
            try {
                const saved = localStorage.getItem('sme_ia_modelos');
                if (saved) {
                    modelosTreinados = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar modelos:', e);
            }
        }

        function salvarModelos() {
            try {
                localStorage.setItem('sme_ia_modelos', JSON.stringify(modelosTreinados));
            } catch (e) {
                console.error('Erro ao salvar modelos:', e);
            }
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            preverDesempenhoAluno,
            identificarAlunosRisco,
            analisarTendenciasTurma,
            mostrarPainelIA,
            getMetricas: () => ({ ...metricas }),
            getModelos: () => ({ ...modelosTreinados })
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_IA_PREVISAO.init();
        }, 6500);
    });

    window.MODULO_IA_PREVISAO = MODULO_IA_PREVISAO;
    console.log('✅ Módulo de IA - Previsão de Desempenho carregado');
}
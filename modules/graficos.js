// modulos/graficos.js - Sistema de Gráficos e Estatísticas
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_GRAFICOS === 'undefined') {
    const MODULO_GRAFICOS = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CORES = {
            primary: '#3498db',
            success: '#27ae60',
            warning: '#f39c12',
            danger: '#e74c3c',
            info: '#17a2b8',
            purple: '#9b59b6',
            orange: '#e67e22',
            dark: '#2c3e50',
            gray: '#95a5a6',
            light: '#ecf0f1'
        };

        const CORES_PALETA = [
            '#3498db', '#27ae60', '#f39c12', '#e74c3c', '#9b59b6',
            '#1abc9c', '#e67e22', '#2c3e50', '#8e44ad', '#16a085'
        ];

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('📊 Sistema de Gráficos inicializado');
            
            // Carregar biblioteca Chart.js se não existir
            carregarChartJS();
        }

        function carregarChartJS() {
            if (typeof Chart !== 'undefined') return;

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
            script.onload = () => console.log('✅ Chart.js carregado');
            document.head.appendChild(script);
        }

        // ==================== GRÁFICOS DO DASHBOARD ====================
        function criarGraficoDesempenhoGeral(elementoId, dados) {
            const ctx = document.getElementById(elementoId)?.getContext('2d');
            if (!ctx) return null;

            return new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dados.labels || ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                    datasets: [
                        {
                            label: 'Média Geral',
                            data: dados.medias || [7.5, 7.8, 8.0, 8.2, 8.1, 8.3, 8.4, 8.5, 8.3, 8.6, 8.7, 8.9],
                            borderColor: CORES.primary,
                            backgroundColor: CORES.primary + '20',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Meta',
                            data: dados.metas || Array(12).fill(8.0),
                            borderColor: CORES.success,
                            borderDash: [5, 5],
                            borderWidth: 2,
                            fill: false,
                            pointRadius: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Desempenho Geral da Rede'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10,
                            grid: {
                                color: '#e0e0e0'
                            }
                        }
                    }
                }
            });
        }

        function criarGraficoDistribuicaoAlunos(elementoId, dados) {
            const ctx = document.getElementById(elementoId)?.getContext('2d');
            if (!ctx) return null;

            return new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: dados.labels || ['Escola A', 'Escola B', 'Escola C', 'Escola D'],
                    datasets: [{
                        data: dados.valores || [850, 1200, 650, 980],
                        backgroundColor: CORES_PALETA,
                        borderColor: 'white',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: true,
                            text: 'Distribuição de Alunos por Escola'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} alunos (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        function criarGraficoDesempenhoTurmas(elementoId, dados) {
            const ctx = document.getElementById(elementoId)?.getContext('2d');
            if (!ctx) return null;

            return new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: dados.labels || ['5ºA', '5ºB', '6ºA', '6ºB', '7ºA', '7ºB'],
                    datasets: [
                        {
                            label: 'Matemática',
                            data: dados.matematica || [8.2, 7.8, 8.5, 8.0, 7.5, 8.3],
                            backgroundColor: CORES.primary,
                            borderRadius: 5
                        },
                        {
                            label: 'Português',
                            data: dados.portugues || [8.5, 8.0, 8.2, 7.9, 8.1, 8.4],
                            backgroundColor: CORES.success,
                            borderRadius: 5
                        },
                        {
                            label: 'Ciências',
                            data: dados.ciencias || [8.0, 8.3, 8.1, 8.4, 7.8, 8.2],
                            backgroundColor: CORES.warning,
                            borderRadius: 5
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Desempenho por Turma e Disciplina'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10,
                            grid: {
                                color: '#e0e0e0'
                            }
                        }
                    }
                }
            });
        }

        function criarGraficoFrequencia(elementoId, dados) {
            const ctx = document.getElementById(elementoId)?.getContext('2d');
            if (!ctx) return null;

            return new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dados.labels || ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
                    datasets: [
                        {
                            label: 'Presenças',
                            data: dados.presencas || [92, 88, 95, 90, 85],
                            borderColor: CORES.success,
                            backgroundColor: CORES.success + '20',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Faltas',
                            data: dados.faltas || [8, 12, 5, 10, 15],
                            borderColor: CORES.danger,
                            backgroundColor: CORES.danger + '20',
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Frequência Escolar - Última Semana'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            grid: {
                                color: '#e0e0e0'
                            }
                        }
                    }
                }
            });
        }

        function criarGraficoBiblioteca(elementoId, dados) {
            const ctx = document.getElementById(elementoId)?.getContext('2d');
            if (!ctx) return null;

            return new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: dados.labels || ['Emprestados', 'Disponíveis', 'Reservados', 'Em Manutenção'],
                    datasets: [{
                        data: dados.valores || [45, 120, 15, 8],
                        backgroundColor: [
                            CORES.warning,
                            CORES.success,
                            CORES.primary,
                            CORES.gray
                        ],
                        borderColor: 'white',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: true,
                            text: 'Status do Acervo da Biblioteca'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        function criarGraficoMerenda(elementoId, dados) {
            const ctx = document.getElementById(elementoId)?.getContext('2d');
            if (!ctx) return null;

            return new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: dados.labels || ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                    datasets: [
                        {
                            label: 'Café da Manhã',
                            data: dados.cafe || [120, 115, 118, 122, 110],
                            backgroundColor: CORES.primary,
                            borderRadius: 5
                        },
                        {
                            label: 'Almoço',
                            data: dados.almoco || [350, 345, 352, 348, 340],
                            backgroundColor: CORES.success,
                            borderRadius: 5
                        },
                        {
                            label: 'Lanche',
                            data: dados.lanche || [180, 175, 182, 178, 170],
                            backgroundColor: CORES.warning,
                            borderRadius: 5
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Refeições Servidas por Dia'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#e0e0e0'
                            }
                        }
                    }
                }
            });
        }

        // ==================== GRÁFICOS ESPECÍFICOS ====================
        function criarGraficoDesempenhoAluno(elementoId, alunoId) {
            const notas = MOCK_DATA.notas?.filter(n => n.alunoId === alunoId) || [];
            
            const disciplinas = [...new Set(notas.map(n => n.disciplina))];
            const medias = disciplinas.map(disp => {
                const notasDisciplina = notas.filter(n => n.disciplina === disp);
                const media = notasDisciplina.reduce((acc, n) => acc + n.media, 0) / notasDisciplina.length;
                return media.toFixed(1);
            });

            const ctx = document.getElementById(elementoId)?.getContext('2d');
            if (!ctx) return null;

            return new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: disciplinas,
                    datasets: [{
                        label: 'Média do Aluno',
                        data: medias,
                        backgroundColor: CORES.primary + '40',
                        borderColor: CORES.primary,
                        pointBackgroundColor: CORES.primary,
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: CORES.primary
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Desempenho por Disciplina'
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 10,
                            ticks: {
                                stepSize: 2
                            }
                        }
                    }
                }
            });
        }

        function criarGraficoEvolucaoAluno(elementoId, alunoId) {
            const notas = MOCK_DATA.notas?.filter(n => n.alunoId === alunoId) || [];
            
            const bimestres = ['1º Bim', '2º Bim', '3º Bim', '4º Bim'];
            const disciplinas = [...new Set(notas.map(n => n.disciplina))];

            const datasets = disciplinas.map((disp, index) => {
                const notasDisciplina = notas.filter(n => n.disciplina === disp);
                const dados = [
                    notasDisciplina[0]?.nota1 || 0,
                    notasDisciplina[0]?.nota2 || 0,
                    notasDisciplina[0]?.nota3 || 0,
                    notasDisciplina[0]?.nota4 || 0
                ];

                return {
                    label: disp,
                    data: dados,
                    borderColor: CORES_PALETA[index % CORES_PALETA.length],
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    borderWidth: 2
                };
            });

            const ctx = document.getElementById(elementoId)?.getContext('2d');
            if (!ctx) return null;

            return new Chart(ctx, {
                type: 'line',
                data: {
                    labels: bimestres,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Evolução por Bimestre'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10,
                            grid: {
                                color: '#e0e0e0'
                            }
                        }
                    }
                }
            });
        }

        function criarGraficoFrequenciaAluno(elementoId, alunoId) {
            const frequencias = MOCK_DATA.frequencias?.filter(f => f.alunoId === alunoId) || [];
            
            const ctx = document.getElementById(elementoId)?.getContext('2d');
            if (!ctx) return null;

            return new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: frequencias.map(f => f.disciplina),
                    datasets: [
                        {
                            label: 'Frequência (%)',
                            data: frequencias.map(f => f.percentual),
                            backgroundColor: frequencias.map(f => 
                                f.percentual >= 75 ? CORES.success : CORES.danger
                            ),
                            borderRadius: 5
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Frequência por Disciplina'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            grid: {
                                color: '#e0e0e0'
                            }
                        }
                    }
                }
            });
        }

        // ==================== GRÁFICOS COMPARATIVOS ====================
        function criarGraficoComparativoTurmas(elementoId, turmasIds) {
            const turmas = MOCK_DATA.turmas.filter(t => turmasIds.includes(t.id));
            const alunos = MOCK_DATA.alunos.filter(a => turmasIds.includes(a.turmaId));
            
            const mediasPorTurma = turmas.map(turma => {
                const alunosTurma = alunos.filter(a => a.turmaId === turma.id);
                const media = alunosTurma.reduce((acc, a) => acc + a.mediaGeral, 0) / alunosTurma.length;
                return media.toFixed(1);
            });

            const ctx = document.getElementById(elementoId)?.getContext('2d');
            if (!ctx) return null;

            return new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: turmas.map(t => t.nome),
                    datasets: [{
                        label: 'Média Geral',
                        data: mediasPorTurma,
                        backgroundColor: CORES.primary,
                        borderRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Comparativo entre Turmas'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10,
                            grid: {
                                color: '#e0e0e0'
                            }
                        }
                    }
                }
            });
        }

        // ==================== PAINEL DE ESTATÍSTICAS ====================
        function criarPainelEstatisticas(elementoId) {
            const estatisticas = calcularEstatisticasGerais();

            return `
                <div class="estatisticas-painel">
                    <div class="estatisticas-grid">
                        <div class="estatistica-card">
                            <div class="estatistica-valor">${estatisticas.totalAlunos}</div>
                            <div class="estatistica-rotulo">Alunos</div>
                            <div class="estatistica-tendencia ${estatisticas.tendenciaAlunos > 0 ? 'positiva' : 'negativa'}">
                                <i class="fas fa-arrow-${estatisticas.tendenciaAlunos > 0 ? 'up' : 'down'}"></i>
                                ${Math.abs(estatisticas.tendenciaAlunos)}%
                            </div>
                        </div>
                        
                        <div class="estatistica-card">
                            <div class="estatistica-valor">${estatisticas.totalProfessores}</div>
                            <div class="estatistica-rotulo">Professores</div>
                            <div class="estatistica-tendencia ${estatisticas.tendenciaProfessores > 0 ? 'positiva' : 'negativa'}">
                                <i class="fas fa-arrow-${estatisticas.tendenciaProfessores > 0 ? 'up' : 'down'}"></i>
                                ${Math.abs(estatisticas.tendenciaProfessores)}%
                            </div>
                        </div>
                        
                        <div class="estatistica-card">
                            <div class="estatistica-valor">${estatisticas.mediaGeral}</div>
                            <div class="estatistica-rotulo">Média Geral</div>
                            <div class="estatistica-tendencia ${estatisticas.tendenciaMedia > 0 ? 'positiva' : 'negativa'}">
                                <i class="fas fa-arrow-${estatisticas.tendenciaMedia > 0 ? 'up' : 'down'}"></i>
                                ${Math.abs(estatisticas.tendenciaMedia)}%
                            </div>
                        </div>
                        
                        <div class="estatistica-card">
                            <div class="estatistica-valor">${estatisticas.frequenciaMedia}%</div>
                            <div class="estatistica-rotulo">Frequência</div>
                            <div class="estatistica-tendencia ${estatisticas.tendenciaFrequencia > 0 ? 'positiva' : 'negativa'}">
                                <i class="fas fa-arrow-${estatisticas.tendenciaFrequencia > 0 ? 'up' : 'down'}"></i>
                                ${Math.abs(estatisticas.tendenciaFrequencia)}%
                            </div>
                        </div>
                        
                        <div class="estatistica-card">
                            <div class="estatistica-valor">${estatisticas.aprovacao}%</div>
                            <div class="estatistica-rotulo">Aprovação</div>
                            <div class="estatistica-tendencia positiva">
                                <i class="fas fa-arrow-up"></i> 2%
                            </div>
                        </div>
                        
                        <div class="estatistica-card">
                            <div class="estatistica-valor">${estatisticas.evasao}%</div>
                            <div class="estatistica-rotulo">Evasão</div>
                            <div class="estatistica-tendencia negativa">
                                <i class="fas fa-arrow-down"></i> 1%
                            </div>
                        </div>
                    </div>
                    
                    <div class="graficos-painel">
                        <div class="grafico-container">
                            <canvas id="grafico-desempenho-geral"></canvas>
                        </div>
                        <div class="grafico-container">
                            <canvas id="grafico-distribuicao"></canvas>
                        </div>
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function calcularEstatisticasGerais() {
            const alunos = MOCK_DATA.alunos || [];
            const professores = MOCK_DATA.professores || [];
            const notas = MOCK_DATA.notas || [];
            
            const medias = notas.map(n => n.media);
            const mediaGeral = medias.length > 0 
                ? (medias.reduce((a, b) => a + b, 0) / medias.length).toFixed(1)
                : '0.0';

            const frequencias = MOCK_DATA.frequencias || [];
            const frequenciaMedia = frequencias.length > 0
                ? Math.round(frequencias.reduce((a, b) => a + b.percentual, 0) / frequencias.length)
                : 0;

            const aprovados = notas.filter(n => n.media >= 7).length;
            const aprovacao = notas.length > 0 ? Math.round((aprovados / notas.length) * 100) : 0;
            
            const evadidos = alunos.filter(a => a.status === 'inativo').length;
            const evasao = alunos.length > 0 ? Math.round((evadidos / alunos.length) * 100) : 0;

            return {
                totalAlunos: alunos.length,
                totalProfessores: professores.length,
                mediaGeral: mediaGeral,
                frequenciaMedia: frequenciaMedia,
                aprovacao: aprovacao,
                evasao: evasao,
                tendenciaAlunos: 5,
                tendenciaProfessores: 2,
                tendenciaMedia: 3,
                tendenciaFrequencia: 1
            };
        }

        // ==================== EXPORTAÇÃO ====================
        function exportarGraficoComoImagem(elementoId) {
            const canvas = document.getElementById(elementoId);
            if (!canvas) return;

            const link = document.createElement('a');
            link.download = `grafico-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }

        function exportarGraficoComoPDF(elementoId) {
            // Implementar exportação para PDF
            console.log('Exportando gráfico como PDF:', elementoId);
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            criarGraficoDesempenhoGeral,
            criarGraficoDistribuicaoAlunos,
            criarGraficoDesempenhoTurmas,
            criarGraficoFrequencia,
            criarGraficoBiblioteca,
            criarGraficoMerenda,
            criarGraficoDesempenhoAluno,
            criarGraficoEvolucaoAluno,
            criarGraficoFrequenciaAluno,
            criarGraficoComparativoTurmas,
            criarPainelEstatisticas,
            exportarGraficoComoImagem,
            exportarGraficoComoPDF,
            CORES
        };
    })();

    window.MODULO_GRAFICOS = MODULO_GRAFICOS;
    console.log('✅ Módulo de Gráficos carregado');
}
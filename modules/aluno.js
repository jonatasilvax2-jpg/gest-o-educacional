// modulos/aluno.js - Módulo do Aluno
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_ALUNO === 'undefined') {
    const MODULO_ALUNO = (function() {
        'use strict';

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarBoletim(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const aluno = MOCK_DATA.alunos.find(a => a.email === usuario.email);
            
            if (!aluno) {
                return '<div class="error-message">Aluno não encontrado</div>';
            }

            const notas = MOCK_DATA.notas.filter(n => n.alunoId === aluno.id);
            
            if (notas.length === 0) {
                return `
                    <div class="boletim-content">
                        <div class="content-header">
                            <h1><i class="fas fa-file-alt"></i> Meu Boletim</h1>
                        </div>
                        <div class="boletim-card">
                            <div class="aluno-info">
                                <h3>${aluno.nome}</h3>
                                <p>Turma: ${aluno.turma} | Matrícula: ${aluno.matricula}</p>
                            </div>
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Nenhuma nota disponível para exibição.</p>
                            </div>
                        </div>
                    </div>
                `;
            }

            const mediaGeral = (notas.reduce((acc, n) => acc + n.media, 0) / notas.length).toFixed(1);

            return `
                <div class="boletim-content">
                    <div class="content-header">
                        <h1><i class="fas fa-file-alt"></i> Meu Boletim</h1>
                        <button class="btn btn-primary" onclick="exportarBoletim()">
                            <i class="fas fa-download"></i> Exportar
                        </button>
                    </div>
                    
                    <div class="boletim-card">
                        <div class="aluno-info">
                            <h3>${aluno.nome}</h3>
                            <p>Turma: ${aluno.turma} | Matrícula: ${aluno.matricula}</p>
                            <p class="media-geral">Média Geral: <strong class="${mediaGeral >= 7 ? 'text-success' : 'text-warning'}">${mediaGeral}</strong></p>
                        </div>
                        
                        <div class="notas-tabela">
                            <table class="boletim-table">
                                <thead>
                                    <tr>
                                        <th>Disciplina</th>
                                        <th>1º Bim</th>
                                        <th>2º Bim</th>
                                        <th>3º Bim</th>
                                        <th>4º Bim</th>
                                        <th>Média Final</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${notas.map(nota => `
                                        <tr>
                                            <td><strong>${nota.disciplina}</strong></td>
                                            <td class="nota">${nota.nota1}</td>
                                            <td class="nota">${nota.nota2}</td>
                                            <td class="nota">${nota.nota3}</td>
                                            <td class="nota">${nota.nota4}</td>
                                            <td class="nota media"><strong>${nota.media}</strong></td>
                                            <td>
                                                <span class="status-badge ${nota.media >= 7 ? 'aprovado' : 'recuperacao'}">
                                                    ${nota.media >= 7 ? 'Aprovado' : 'Recuperação'}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="legenda">
                            <div class="legenda-item">
                                <span class="status-badge aprovado"></span>
                                <span>Aprovado (média ≥ 7.0)</span>
                            </div>
                            <div class="legenda-item">
                                <span class="status-badge recuperacao"></span>
                                <span>Recuperação (média < 7.0)</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderizarMinhasNotas(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const aluno = MOCK_DATA.alunos.find(a => a.email === usuario.email);
            
            if (!aluno) {
                return '<div class="error-message">Aluno não encontrado</div>';
            }

            const notas = MOCK_DATA.notas.filter(n => n.alunoId === aluno.id);

            return `
                <div class="notas-content">
                    <div class="content-header">
                        <h1><i class="fas fa-chart-line"></i> Minhas Notas</h1>
                    </div>
                    
                    <div class="notas-grid">
                        ${notas.map(nota => `
                            <div class="nota-disciplina-card">
                                <h3>${nota.disciplina}</h3>
                                <div class="bimestres">
                                    <div class="bimestre ${nota.nota1 >= 7 ? 'aprovado' : nota.nota1 >= 5 ? 'recuperacao' : 'reprovado'}">
                                        <span class="bimestre-label">1º Bim</span>
                                        <span class="bimestre-nota">${nota.nota1}</span>
                                    </div>
                                    <div class="bimestre ${nota.nota2 >= 7 ? 'aprovado' : nota.nota2 >= 5 ? 'recuperacao' : 'reprovado'}">
                                        <span class="bimestre-label">2º Bim</span>
                                        <span class="bimestre-nota">${nota.nota2}</span>
                                    </div>
                                    <div class="bimestre ${nota.nota3 >= 7 ? 'aprovado' : nota.nota3 >= 5 ? 'recuperacao' : 'reprovado'}">
                                        <span class="bimestre-label">3º Bim</span>
                                        <span class="bimestre-nota">${nota.nota3}</span>
                                    </div>
                                    <div class="bimestre ${nota.nota4 >= 7 ? 'aprovado' : nota.nota4 >= 5 ? 'recuperacao' : 'reprovado'}">
                                        <span class="bimestre-label">4º Bim</span>
                                        <span class="bimestre-nota">${nota.nota4}</span>
                                    </div>
                                </div>
                                <div class="media-final ${nota.media >= 7 ? 'aprovado' : nota.media >= 5 ? 'recuperacao' : 'reprovado'}">
                                    Média Final: <strong>${nota.media}</strong>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function renderizarMinhasFaltas(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            let aluno = MOCK_DATA.alunos.find(a => a.email === usuario.email);
            
            if (!aluno) {
                if (usuario.email === 'aluno@escola') {
                    aluno = MOCK_DATA.alunos[2];
                } else {
                    aluno = MOCK_DATA.alunos[0];
                }
            }

            if (!aluno) return '<div class="error-message">Aluno não encontrado</div>';

            const aulasPorMes = 20;
            const totalAulas = aulasPorMes * 4;
            const presencas = totalAulas - (aluno.faltas || 0);
            const frequenciaPercentual = ((presencas / totalAulas) * 100).toFixed(1);

            return `
                <div class="faltas-content">
                    <div class="content-header">
                        <h1><i class="fas fa-calendar-times"></i> Minhas Faltas</h1>
                    </div>
                    
                    <div class="faltas-card">
                        <div class="aluno-info">
                            <h3>${aluno.nome}</h3>
                            <p>Turma: ${aluno.turma} | Matrícula: ${aluno.matricula}</p>
                        </div>
                        
                        <div class="faltas-stats">
                            <div class="stat-box">
                                <span class="stat-label">Total de Faltas</span>
                                <span class="stat-value text-warning">${aluno.faltas || 0}</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-label">Total de Aulas</span>
                                <span class="stat-value">${totalAulas}</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-label">Presenças</span>
                                <span class="stat-value text-success">${presencas}</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-label">Frequência</span>
                                <span class="stat-value ${frequenciaPercentual >= 75 ? 'text-success' : 'text-danger'}">
                                    ${frequenciaPercentual}%
                                </span>
                            </div>
                        </div>
                        
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${frequenciaPercentual}%"></div>
                        </div>
                        
                        <div class="alerta-frequencia ${frequenciaPercentual >= 75 ? 'success' : 'danger'}">
                            <i class="fas ${frequenciaPercentual >= 75 ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                            ${frequenciaPercentual >= 75 
                                ? 'Sua frequência está dentro do limite permitido.' 
                                : 'Atenção! Sua frequência está abaixo do mínimo necessário (75%).'}
                        </div>
                        
                        <h3 style="margin-top: 30px;">Detalhamento por Disciplina</h3>
                        <table class="faltas-table">
                            <thead>
                                <tr>
                                    <th>Disciplina</th>
                                    <th>Faltas</th>
                                    <th>Aulas</th>
                                    <th>Frequência</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${MOCK_DATA.frequencias.filter(f => f.alunoId === aluno.id).map(f => `
                                    <tr>
                                        <td>${f.disciplina}</td>
                                        <td>${f.faltas}</td>
                                        <td>${f.totalAulas}</td>
                                        <td>${f.percentual}%</td>
                                        <td><span class="status-badge ${f.percentual >= 75 ? 'aprovado' : 'reprovado'}">
                                            ${f.percentual >= 75 ? 'Regular' : 'Crítico'}
                                        </span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        function renderizarMeuHorario(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            let aluno = MOCK_DATA.alunos.find(a => a.email === usuario.email);
            
            if (!aluno) {
                if (usuario.email === 'aluno@escola') {
                    aluno = MOCK_DATA.alunos[2];
                } else {
                    aluno = MOCK_DATA.alunos[0];
                }
            }

            if (!aluno) return '<div class="error-message">Aluno não encontrado</div>';

            const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
            const horariosPorDia = {};

            dias.forEach(dia => {
                horariosPorDia[dia] = MOCK_DATA.horarios.filter(h => 
                    h.turmaId === aluno.turmaId && h.dia === dia
                );
            });

            return `
                <div class="horario-content">
                    <div class="content-header">
                        <h1><i class="fas fa-clock"></i> Meu Horário</h1>
                        <p>Turma: ${aluno.turma}</p>
                    </div>
                    
                    <div class="horario-grid">
                        ${dias.map(dia => `
                            <div class="dia-card">
                                <h3>${dia}-feira</h3>
                                ${horariosPorDia[dia].length > 0 ? 
                                    horariosPorDia[dia].map(aula => `
                                        <div class="aula-item">
                                            <span class="aula-horario">${aula.horarioInicio} - ${aula.horarioFim}</span>
                                            <span class="aula-disciplina">${aula.disciplina}</span>
                                            <span class="aula-professor">${aula.professor}</span>
                                            <span class="aula-sala">Sala ${aula.sala}</span>
                                        </div>
                                    `).join('')
                                    : '<div class="aula-item">Nenhuma aula</div>'
                                }
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function renderizarAtividadesPendentes(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            let aluno = MOCK_DATA.alunos.find(a => a.email === usuario.email);
            
            if (!aluno) {
                if (usuario.email === 'aluno@escola') {
                    aluno = MOCK_DATA.alunos[2];
                } else {
                    aluno = MOCK_DATA.alunos[0];
                }
            }

            if (!aluno) return '<div class="error-message">Aluno não encontrado</div>';

            const atividades = MOCK_DATA.atividades.filter(a => a.turmaId === aluno.turmaId);

            return `
                <div class="atividades-content">
                    <div class="content-header">
                        <h1><i class="fas fa-tasks"></i> Atividades Pendentes</h1>
                    </div>
                    
                    <div class="atividades-lista">
                        ${atividades.map(atividade => {
                            const dataEntrega = new Date(atividade.dataEntrega);
                            const hoje = new Date();
                            const diasRestantes = Math.ceil((dataEntrega - hoje) / (1000 * 60 * 60 * 24));
                            
                            return `
                                <div class="atividade-card">
                                    <div class="atividade-header">
                                        <h3>${atividade.titulo}</h3>
                                        <span class="status-badge ${diasRestantes > 3 ? 'aprovado' : diasRestantes > 0 ? 'recuperacao' : 'reprovado'}">
                                            ${diasRestantes > 0 ? `${diasRestantes} dias` : 'Vencida'}
                                        </span>
                                    </div>
                                    <div class="atividade-body">
                                        <p>${atividade.descricao}</p>
                                        <p><i class="fas fa-calendar"></i> Entrega: ${new Date(atividade.dataEntrega).toLocaleDateString('pt-BR')}</p>
                                        <p><i class="fas fa-star"></i> Valor: ${atividade.valor} pontos</p>
                                        <p><i class="fas fa-users"></i> ${atividade.entregues}/${atividade.totalAlunos} entregues</p>
                                    </div>
                                    <div class="atividade-footer">
                                        <button class="btn btn-sm btn-primary" onclick="abrirModal('${atividade.titulo}', getDetalhesAtividade(${atividade.id}))">
                                            <i class="fas fa-eye"></i> Ver
                                        </button>
                                        <button class="btn btn-sm btn-success" onclick="abrirModal('Entregar', getFormEntrega(${atividade.id}))">
                                            <i class="fas fa-upload"></i> Entregar
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function getDetalhesAtividade(id) {
            const atividade = MOCK_DATA.atividades.find(a => a.id === id);
            if (!atividade) return '<p>Atividade não encontrada</p>';

            return `
                <div class="detalhes-atividade">
                    <h3>${atividade.titulo}</h3>
                    <p><strong>Descrição:</strong> ${atividade.descricao}</p>
                    <p><strong>Data de Entrega:</strong> ${new Date(atividade.dataEntrega).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Valor:</strong> ${atividade.valor} pontos</p>
                    <p><strong>Tipo:</strong> ${atividade.tipo}</p>
                    <p><strong>Entregues:</strong> ${atividade.entregues}/${atividade.totalAlunos}</p>
                </div>
            `;
        }

        function getFormEntrega(id) {
            return `
                <form id="form-entrega">
                    <div class="form-group">
                        <label>Arquivo</label>
                        <input type="file" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Comentários</label>
                        <textarea class="form-control" rows="4" placeholder="Observações sobre a entrega..."></textarea>
                    </div>
                </form>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarBoletim,
            renderizarMinhasNotas,
            renderizarMinhasFaltas,
            renderizarMeuHorario,
            renderizarAtividadesPendentes,
            getDetalhesAtividade,
            getFormEntrega
        };
    })();

    window.MODULO_ALUNO = MODULO_ALUNO;
    console.log('✅ Módulo do Aluno carregado');
}
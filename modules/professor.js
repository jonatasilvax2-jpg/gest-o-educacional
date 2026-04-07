// modulos/professor.js - Módulo do Professor
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_PROFESSOR === 'undefined') {
    const MODULO_PROFESSOR = (function() {
        'use strict';

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarMinhasTurmas(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const professor = MOCK_DATA.professores.find(p => p.email === usuario.email);
            
            if (!professor) return '<div class="error-message">Professor não encontrado</div>';

            const turmas = MOCK_DATA.turmas.filter(t => t.professorId === professor.id);

            return `
                <div class="turmas-content">
                    <div class="content-header">
                        <h1><i class="fas fa-users"></i> Minhas Turmas</h1>
                    </div>
                    
                    <div class="turmas-grid">
                        ${turmas.map(turma => {
                            const alunos = MOCK_DATA.alunos.filter(a => a.turmaId === turma.id);
                            return `
                                <div class="turma-card">
                                    <div class="turma-header">
                                        <h3>Turma ${turma.nome}</h3>
                                        <span class="periodo">${turma.periodo}</span>
                                    </div>
                                    <div class="turma-body">
                                        <p><i class="fas fa-users"></i> ${alunos.length} alunos</p>
                                        <p><i class="fas fa-clock"></i> ${turma.horarioInicio} - ${turma.horarioFim}</p>
                                        <p><i class="fas fa-door-open"></i> Sala ${turma.sala}</p>
                                        
                                        <div class="progresso-container">
                                            <div class="progresso-label">Frequência Média</div>
                                            <div class="progress-bar-container">
                                                <div class="progress-bar" style="width: 92%"></div>
                                            </div>
                                            <span class="progresso-valor">92%</span>
                                        </div>
                                        
                                        <div class="progresso-container">
                                            <div class="progresso-label">Média da Turma</div>
                                            <div class="progress-bar-container">
                                                <div class="progress-bar" style="width: 82%"></div>
                                            </div>
                                            <span class="progresso-valor">8.2</span>
                                        </div>
                                    </div>
                                    <div class="turma-footer">
                                        <button class="btn btn-sm btn-primary" onclick="navegarPara('notas', 'lancar', ${turma.id})">
                                            <i class="fas fa-edit"></i> Notas
                                        </button>
                                        <button class="btn btn-sm btn-success" onclick="navegarPara('frequencia', 'registrar', ${turma.id})">
                                            <i class="fas fa-clipboard-check"></i> Frequência
                                        </button>
                                        <button class="btn btn-sm btn-info" onclick="abrirModal('Turma ${turma.nome}', getDetalhesTurmaProfessor(${turma.id}))">
                                            <i class="fas fa-eye"></i> Detalhes
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        function renderizarLancarNotas(secao, turmaId = null) {
            const usuario = SISTEMA.getEstado().usuario;
            const professor = MOCK_DATA.professores.find(p => p.email === usuario.email);
            
            if (!professor) return '<div class="error-message">Professor não encontrado</div>';

            const turmas = turmaId 
                ? [MOCK_DATA.turmas.find(t => t.id === turmaId)]
                : MOCK_DATA.turmas.filter(t => t.professorId === professor.id);

            return `
                <div class="notas-content">
                    <div class="content-header">
                        <h1><i class="fas fa-edit"></i> Lançar Notas</h1>
                        <select class="form-control" id="select-bimestre" style="width: 200px;">
                            <option value="1">1º Bimestre</option>
                            <option value="2">2º Bimestre</option>
                            <option value="3">3º Bimestre</option>
                            <option value="4" selected>4º Bimestre</option>
                        </select>
                    </div>
                    
                    ${turmas.map(turma => {
                        const alunos = MOCK_DATA.alunos.filter(a => a.turmaId === turma.id);
                        return `
                            <div class="turma-notas-card">
                                <h3>Turma ${turma.nome}</h3>
                                <div class="table-responsive">
                                    <table class="notas-table">
                                        <thead>
                                            <tr>
                                                <th>Aluno</th>
                                                <th>1º Bim</th>
                                                <th>2º Bim</th>
                                                <th>3º Bim</th>
                                                <th>4º Bim</th>
                                                <th>Média</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${alunos.map(aluno => {
                                                const notas = MOCK_DATA.notas.find(n => 
                                                    n.alunoId === aluno.id && 
                                                    n.disciplina === professor.disciplina
                                                ) || { nota1: '-', nota2: '-', nota3: '-', nota4: '-', media: '-' };
                                                return `
                                                    <tr>
                                                        <td>${aluno.nome}</td>
                                                        <td><input type="number" class="nota-input" value="${notas.nota1 !== '-' ? notas.nota1 : ''}" step="0.1" min="0" max="10"></td>
                                                        <td><input type="number" class="nota-input" value="${notas.nota2 !== '-' ? notas.nota2 : ''}" step="0.1" min="0" max="10"></td>
                                                        <td><input type="number" class="nota-input" value="${notas.nota3 !== '-' ? notas.nota3 : ''}" step="0.1" min="0" max="10"></td>
                                                        <td><input type="number" class="nota-input" value="${notas.nota4 !== '-' ? notas.nota4 : ''}" step="0.1" min="0" max="10"></td>
                                                        <td class="media-cell ${notas.media >= 7 ? 'text-success' : notas.media >= 5 ? 'text-warning' : 'text-danger'}">
                                                            ${notas.media}
                                                        </td>
                                                        <td>
                                                            <button class="btn btn-sm btn-success" onclick="salvarNotasAluno(${aluno.id})">
                                                                <i class="fas fa-save"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                `;
                                            }).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        `;
                    }).join('')}
                    
                    <div class="notas-actions">
                        <button class="btn btn-primary" onclick="salvarTodasNotas()">
                            <i class="fas fa-save"></i> Salvar Todas
                        </button>
                    </div>
                </div>
            `;
        }

        function renderizarRegistrarFrequencia(secao, turmaId = null) {
            const usuario = SISTEMA.getEstado().usuario;
            const professor = MOCK_DATA.professores.find(p => p.email === usuario.email);
            
            if (!professor) return '<div class="error-message">Professor não encontrado</div>';

            const turmas = turmaId 
                ? [MOCK_DATA.turmas.find(t => t.id === turmaId)]
                : MOCK_DATA.turmas.filter(t => t.professorId === professor.id);

            const hoje = new Date().toLocaleDateString('pt-BR');

            return `
                <div class="frequencia-content">
                    <div class="content-header">
                        <h1><i class="fas fa-clipboard-check"></i> Registrar Frequência</h1>
                        <div>
                            <span class="data-label">Data: <strong>${hoje}</strong></span>
                        </div>
                    </div>
                    
                    ${turmas.map(turma => {
                        const alunos = MOCK_DATA.alunos.filter(a => a.turmaId === turma.id);
                        return `
                            <div class="turma-frequencia-card">
                                <h3>Turma ${turma.nome}</h3>
                                <div class="table-responsive">
                                    <table class="frequencia-table">
                                        <thead>
                                            <tr>
                                                <th>Aluno</th>
                                                <th>Status</th>
                                                <th>Justificativa</th>
                                                <th>Observações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${alunos.map(aluno => `
                                                <tr>
                                                    <td>${aluno.nome}</td>
                                                    <td>
                                                        <select class="frequencia-select">
                                                            <option value="presente">Presente</option>
                                                            <option value="ausente">Ausente</option>
                                                            <option value="atrasado">Atrasado</option>
                                                            <option value="justificado">Falta Justificada</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <input type="text" class="form-control" placeholder="Justificativa">
                                                    </td>
                                                    <td>
                                                        <input type="text" class="form-control" placeholder="Obs.">
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                                <div class="frequencia-actions">
                                    <button class="btn btn-primary" onclick="salvarFrequenciaTurma(${turma.id})">
                                        <i class="fas fa-save"></i> Salvar Frequência
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        function renderizarMeusAlunos(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const professor = MOCK_DATA.professores.find(p => p.email === usuario.email);
            
            if (!professor) return '<div class="error-message">Professor não encontrado</div>';

            const turmas = MOCK_DATA.turmas.filter(t => t.professorId === professor.id);
            const alunos = MOCK_DATA.alunos.filter(a => turmas.some(t => t.id === a.turmaId));

            return `
                <div class="alunos-content">
                    <div class="content-header">
                        <h1><i class="fas fa-graduation-cap"></i> Meus Alunos</h1>
                    </div>
                    
                    <div class="alunos-list">
                        ${alunos.map(aluno => `
                            <div class="aluno-card">
                                <div class="aluno-avatar">
                                    <i class="fas fa-user-graduate"></i>
                                </div>
                                <div class="aluno-info">
                                    <h3>${aluno.nome}</h3>
                                    <p><strong>Turma:</strong> ${aluno.turma}</p>
                                    <p><strong>Média:</strong> <span class="${aluno.mediaGeral >= 7 ? 'text-success' : 'text-warning'}">${aluno.mediaGeral}</span></p>
                                    <p><strong>Frequência:</strong> ${Math.round((1 - aluno.faltas/80)*100)}%</p>
                                </div>
                                <div class="aluno-actions">
                                    <button class="btn btn-sm btn-primary" onclick="abrirModal('${aluno.nome}', getDetalhesAlunoProfessor(${aluno.id}))">
                                        <i class="fas fa-eye"></i> Detalhes
                                    </button>
                                    <button class="btn btn-sm btn-success" onclick="navegarPara('notas', 'lancar')">
                                        <i class="fas fa-edit"></i> Notas
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function getDetalhesTurmaProfessor(turmaId) {
            const turma = MOCK_DATA.turmas.find(t => t.id === turmaId);
            if (!turma) return '<p>Turma não encontrada</p>';

            const alunos = MOCK_DATA.alunos.filter(a => a.turmaId === turma.id);
            const horarios = MOCK_DATA.horarios.filter(h => h.turmaId === turma.id);

            return `
                <div class="detalhes-turma">
                    <p><strong>Turma:</strong> ${turma.nome}</p>
                    <p><strong>Período:</strong> ${turma.periodo}</p>
                    <p><strong>Horário:</strong> ${turma.horarioInicio} - ${turma.horarioFim}</p>
                    <p><strong>Sala:</strong> ${turma.sala}</p>
                    <p><strong>Total Alunos:</strong> ${alunos.length}</p>
                    
                    <h4 style="margin-top: 20px;">Horário Semanal</h4>
                    <ul>
                        ${horarios.map(h => `<li>${h.dia}: ${h.disciplina} - ${h.horarioInicio} às ${h.horarioFim}</li>`).join('')}
                    </ul>
                    
                    <h4 style="margin-top: 20px;">Alunos</h4>
                    <ul>
                        ${alunos.map(a => `<li>${a.nome} - Média: ${a.mediaGeral}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarMinhasTurmas,
            renderizarLancarNotas,
            renderizarRegistrarFrequencia,
            renderizarMeusAlunos,
            getDetalhesTurmaProfessor,
            getDetalhesAlunoProfessor: (id) => `<p>Detalhes do aluno ${id}</p>`
        };
    })();

    window.MODULO_PROFESSOR = MODULO_PROFESSOR;
    console.log('✅ Módulo do Professor carregado');
}
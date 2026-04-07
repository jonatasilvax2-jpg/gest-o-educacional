// modulos/secretaria.js - Módulo da Secretaria
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_SECRETARIA === 'undefined') {
    const MODULO_SECRETARIA = (function() {
        'use strict';

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarEscolas(secao) {
            const escolas = MOCK_DATA.escolas;

            if (secao === 'listar') {
                return `
                    <div class="escolas-content">
                        <div class="content-header">
                            <h1><i class="fas fa-school"></i> Escolas Municipais</h1>
                            <button class="btn btn-success" onclick="abrirModal('Nova Escola', getFormEscola())">
                                <i class="fas fa-plus"></i> Nova Escola
                            </button>
                        </div>
                        
                        <div class="escolas-list">
                            ${escolas.map(escola => `
                                <div class="escola-card">
                                    <div class="escola-header">
                                        <h3><i class="fas fa-school"></i> ${escola.nome}</h3>
                                        <span class="status-badge ${escola.status}">${escola.status}</span>
                                    </div>
                                    <div class="escola-body">
                                        <p><i class="fas fa-map-marker-alt"></i> ${escola.endereco}, ${escola.bairro}</p>
                                        <p><i class="fas fa-phone"></i> ${escola.telefone}</p>
                                        <p><i class="fas fa-user-tie"></i> Diretor: ${escola.diretor}</p>
                                        
                                        <div class="escola-stats">
                                            <div class="stat" onclick="navegarPara('alunos', 'listar')">
                                                <i class="fas fa-graduation-cap"></i>
                                                <span>${escola.totalAlunos} alunos</span>
                                            </div>
                                            <div class="stat" onclick="navegarPara('professores', 'listar')">
                                                <i class="fas fa-chalkboard-teacher"></i>
                                                <span>${escola.totalProfessores} professores</span>
                                            </div>
                                            <div class="stat" onclick="navegarPara('turmas', 'listar')">
                                                <i class="fas fa-users"></i>
                                                <span>${escola.totalTurmas} turmas</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="escola-footer">
                                        <button class="btn btn-sm btn-primary" onclick="abrirModal('${escola.nome}', getDetalhesEscola(${escola.id}))">
                                            <i class="fas fa-eye"></i> Detalhes
                                        </button>
                                        <button class="btn btn-sm btn-secondary" onclick="abrirModal('Editar Escola', getFormEscola(${escola.id}))">
                                            <i class="fas fa-edit"></i> Editar
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            return '<div>Seção não encontrada</div>';
        }

        function renderizarProfessores(secao) {
            const professores = MOCK_DATA.professores;

            if (secao === 'listar') {
                return `
                    <div class="professores-content">
                        <div class="content-header">
                            <h1><i class="fas fa-chalkboard-teacher"></i> Professores</h1>
                            <button class="btn btn-success" onclick="abrirModal('Novo Professor', getFormProfessor())">
                                <i class="fas fa-plus"></i> Novo Professor
                            </button>
                        </div>
                        
                        <div class="professores-list">
                            ${professores.map(prof => {
                                const escola = MOCK_DATA.escolas.find(e => e.id === prof.escolaId);
                                return `
                                    <div class="professor-card">
                                        <div class="professor-avatar">
                                            <img src="${prof.avatar || 'https://i.pravatar.cc/80'}" alt="${prof.nome}">
                                        </div>
                                        <div class="professor-info">
                                            <h3>${prof.nome}</h3>
                                            <p class="disciplina">${prof.disciplina}</p>
                                            <p><i class="fas fa-envelope"></i> ${prof.email}</p>
                                            <p><i class="fas fa-phone"></i> ${prof.telefone}</p>
                                            <p><i class="fas fa-school"></i> ${escola ? escola.nome : 'Não informada'}</p>
                                            <p><i class="fas fa-graduation-cap"></i> ${prof.formacao}</p>
                                        </div>
                                        <div class="professor-actions">
                                            <button class="btn btn-sm btn-primary" onclick="abrirModal('${prof.nome}', getDetalhesProfessor(${prof.id}))">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button class="btn btn-sm btn-secondary" onclick="abrirModal('Editar Professor', getFormProfessor(${prof.id}))">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }

            return '<div>Seção não encontrada</div>';
        }

        function renderizarAlunos(secao) {
            const alunos = MOCK_DATA.alunos;

            if (secao === 'listar') {
                return `
                    <div class="alunos-content">
                        <div class="content-header">
                            <h1><i class="fas fa-graduation-cap"></i> Alunos</h1>
                            <button class="btn btn-success" onclick="abrirModal('Novo Aluno', getFormAluno())">
                                <i class="fas fa-plus"></i> Novo Aluno
                            </button>
                        </div>
                        
                        <div class="alunos-list">
                            ${alunos.map(aluno => `
                                <div class="aluno-card">
                                    <div class="aluno-avatar">
                                        <i class="fas fa-user-graduate"></i>
                                    </div>
                                    <div class="aluno-info">
                                        <h3>${aluno.nome}</h3>
                                        <p><strong>Matrícula:</strong> ${aluno.matricula}</p>
                                        <p><strong>Turma:</strong> ${aluno.turma}</p>
                                        <p><strong>Responsável:</strong> ${aluno.responsavel}</p>
                                        <p><strong>Média:</strong> <span class="${aluno.mediaGeral >= 7 ? 'text-success' : 'text-warning'}">${aluno.mediaGeral}</span></p>
                                    </div>
                                    <div class="aluno-actions">
                                        <button class="btn btn-sm btn-primary" onclick="abrirModal('${aluno.nome}', getDetalhesAluno(${aluno.id}))">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn btn-sm btn-secondary" onclick="abrirModal('Editar Aluno', getFormAluno(${aluno.id}))">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            return '<div>Seção não encontrada</div>';
        }

        function renderizarTurmas(secao) {
            const turmas = MOCK_DATA.turmas;

            if (secao === 'listar') {
                return `
                    <div class="turmas-content">
                        <div class="content-header">
                            <h1><i class="fas fa-users"></i> Turmas</h1>
                            <button class="btn btn-success" onclick="abrirModal('Nova Turma', getFormTurma())">
                                <i class="fas fa-plus"></i> Nova Turma
                            </button>
                        </div>
                        
                        <div class="turmas-list">
                            ${turmas.map(turma => {
                                const escola = MOCK_DATA.escolas.find(e => e.id === turma.escolaId);
                                const professor = MOCK_DATA.professores.find(p => p.id === turma.professorId);
                                return `
                                    <div class="turma-card">
                                        <div class="turma-header">
                                            <h3>Turma ${turma.nome}</h3>
                                            <span class="periodo">${turma.periodo}</span>
                                        </div>
                                        <div class="turma-body">
                                            <p><i class="fas fa-school"></i> ${escola ? escola.nome : 'N/A'}</p>
                                            <p><i class="fas fa-chalkboard-teacher"></i> Professor: ${professor ? professor.nome : 'Não atribuído'}</p>
                                            <p><i class="fas fa-users"></i> ${turma.totalAlunos} alunos</p>
                                            <p><i class="fas fa-clock"></i> ${turma.horarioInicio} - ${turma.horarioFim}</p>
                                        </div>
                                        <div class="turma-footer">
                                            <button class="btn btn-sm btn-primary" onclick="abrirModal('Turma ${turma.nome}', getDetalhesTurma(${turma.id}))">
                                                <i class="fas fa-eye"></i> Detalhes
                                            </button>
                                            <button class="btn btn-sm btn-secondary" onclick="abrirModal('Editar Turma', getFormTurma(${turma.id}))">
                                                <i class="fas fa-edit"></i> Editar
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }

            return '<div>Seção não encontrada</div>';
        }

        // ==================== FUNÇÕES DE FORMULÁRIO ====================
        function getFormEscola(id = null) {
            if (id) {
                const escola = MOCK_DATA.escolas.find(e => e.id === id);
                if (!escola) return '<p>Escola não encontrada</p>';

                return `
                    <form id="form-escola">
                        <div class="form-group">
                            <label>Nome da Escola</label>
                            <input type="text" class="form-control" value="${escola.nome}">
                        </div>
                        <div class="form-group">
                            <label>Endereço</label>
                            <input type="text" class="form-control" value="${escola.endereco}">
                        </div>
                        <div class="form-group">
                            <label>Bairro</label>
                            <input type="text" class="form-control" value="${escola.bairro}">
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Telefone</label>
                                    <input type="text" class="form-control" value="${escola.telefone}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Diretor</label>
                                    <input type="text" class="form-control" value="${escola.diretor}">
                                </div>
                            </div>
                        </div>
                    </form>
                `;
            }

            return `
                <form id="form-escola">
                    <div class="form-group">
                        <label>Nome da Escola *</label>
                        <input type="text" class="form-control" placeholder="Digite o nome da escola">
                    </div>
                    <div class="form-group">
                        <label>Endereço *</label>
                        <input type="text" class="form-control" placeholder="Digite o endereço">
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Bairro</label>
                                <input type="text" class="form-control" placeholder="Bairro">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Cidade</label>
                                <input type="text" class="form-control" value="São Paulo" readonly>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Telefone</label>
                                <input type="text" class="form-control" placeholder="(00) 0000-0000">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Diretor</label>
                                <input type="text" class="form-control" placeholder="Nome do diretor">
                            </div>
                        </div>
                    </div>
                </form>
            `;
        }

        function getFormProfessor(id = null) {
            if (id) {
                const prof = MOCK_DATA.professores.find(p => p.id === id);
                if (!prof) return '<p>Professor não encontrado</p>';

                return `
                    <form id="form-professor">
                        <div class="form-group">
                            <label>Nome Completo</label>
                            <input type="text" class="form-control" value="${prof.nome}">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" class="form-control" value="${prof.email}">
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Telefone</label>
                                    <input type="text" class="form-control" value="${prof.telefone}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Disciplina</label>
                                    <input type="text" class="form-control" value="${prof.disciplina}">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Formação</label>
                            <input type="text" class="form-control" value="${prof.formacao}">
                        </div>
                    </form>
                `;
            }

            return `
                <form id="form-professor">
                    <div class="form-group">
                        <label>Nome Completo *</label>
                        <input type="text" class="form-control" placeholder="Digite o nome">
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" class="form-control" placeholder="email@escola.gov.br">
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Telefone</label>
                                <input type="text" class="form-control" placeholder="(00) 0000-0000">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Disciplina</label>
                                <select class="form-control">
                                    <option>Matemática</option>
                                    <option>Português</option>
                                    <option>Ciências</option>
                                    <option>História</option>
                                    <option>Geografia</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>
            `;
        }

        function getFormAluno(id = null) {
            if (id) {
                const aluno = MOCK_DATA.alunos.find(a => a.id === id);
                if (!aluno) return '<p>Aluno não encontrado</p>';

                return `
                    <form id="form-aluno">
                        <div class="form-group">
                            <label>Nome Completo</label>
                            <input type="text" class="form-control" value="${aluno.nome}">
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Matrícula</label>
                                    <input type="text" class="form-control" value="${aluno.matricula}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Turma</label>
                                    <input type="text" class="form-control" value="${aluno.turma}">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Responsável</label>
                            <input type="text" class="form-control" value="${aluno.responsavel}">
                        </div>
                        <div class="form-group">
                            <label>Telefone</label>
                            <input type="text" class="form-control" value="${aluno.telefone}">
                        </div>
                    </form>
                `;
            }

            return `
                <form id="form-aluno">
                    <div class="form-group">
                        <label>Nome Completo *</label>
                        <input type="text" class="form-control" placeholder="Digite o nome">
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Data Nascimento</label>
                                <input type="date" class="form-control">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Turma</label>
                                <select class="form-control">
                                    <option>5ºA</option>
                                    <option>5ºB</option>
                                    <option>6ºA</option>
                                    <option>6ºB</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Responsável</label>
                        <input type="text" class="form-control" placeholder="Nome do responsável">
                    </div>
                    <div class="form-group">
                        <label>Telefone</label>
                        <input type="text" class="form-control" placeholder="(00) 0000-0000">
                    </div>
                </form>
            `;
        }

        // ==================== FUNÇÕES DE DETALHES ====================
        function getDetalhesEscola(id) {
            const escola = MOCK_DATA.escolas.find(e => e.id === id);
            if (!escola) return '<p>Escola não encontrada</p>';

            return `
                <div class="detalhes-escola">
                    <p><strong>Nome:</strong> ${escola.nome}</p>
                    <p><strong>Endereço:</strong> ${escola.endereco}, ${escola.bairro}</p>
                    <p><strong>Cidade:</strong> ${escola.cidade}</p>
                    <p><strong>Telefone:</strong> ${escola.telefone}</p>
                    <p><strong>Diretor:</strong> ${escola.diretor}</p>
                    <p><strong>Total Alunos:</strong> ${escola.totalAlunos}</p>
                    <p><strong>Total Professores:</strong> ${escola.totalProfessores}</p>
                    <p><strong>Total Turmas:</strong> ${escola.totalTurmas}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${escola.status}">${escola.status}</span></p>
                    <p><strong>Inauguração:</strong> ${new Date(escola.inauguracao).toLocaleDateString('pt-BR')}</p>
                </div>
            `;
        }

        function getDetalhesProfessor(id) {
            const prof = MOCK_DATA.professores.find(p => p.id === id);
            if (!prof) return '<p>Professor não encontrado</p>';

            const escola = MOCK_DATA.escolas.find(e => e.id === prof.escolaId);
            const turmas = MOCK_DATA.turmas.filter(t => t.professorId === prof.id);

            return `
                <div class="detalhes-professor">
                    <p><strong>Nome:</strong> ${prof.nome}</p>
                    <p><strong>Email:</strong> ${prof.email}</p>
                    <p><strong>Telefone:</strong> ${prof.telefone}</p>
                    <p><strong>Disciplina:</strong> ${prof.disciplina}</p>
                    <p><strong>Formação:</strong> ${prof.formacao}</p>
                    <p><strong>Escola:</strong> ${escola ? escola.nome : 'N/A'}</p>
                    <p><strong>Turmas:</strong> ${turmas.map(t => t.nome).join(', ')}</p>
                    <p><strong>Total Alunos:</strong> ${prof.totalAlunos}</p>
                    <p><strong>Carga Horária:</strong> ${prof.cargaHoraria}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${prof.status}">${prof.status}</span></p>
                    <p><strong>Admissão:</strong> ${new Date(prof.dataAdmissao).toLocaleDateString('pt-BR')}</p>
                </div>
            `;
        }

        function getDetalhesAluno(id) {
            const aluno = MOCK_DATA.alunos.find(a => a.id === id);
            if (!aluno) return '<p>Aluno não encontrado</p>';

            return `
                <div class="detalhes-aluno">
                    <p><strong>Nome:</strong> ${aluno.nome}</p>
                    <p><strong>Matrícula:</strong> ${aluno.matricula}</p>
                    <p><strong>Data Nascimento:</strong> ${new Date(aluno.dataNascimento).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Turma:</strong> ${aluno.turma}</p>
                    <p><strong>Responsável:</strong> ${aluno.responsavel}</p>
                    <p><strong>Telefone:</strong> ${aluno.telefone}</p>
                    <p><strong>Endereço:</strong> ${aluno.endereco}</p>
                    <p><strong>Média Geral:</strong> <span class="${aluno.mediaGeral >= 7 ? 'text-success' : 'text-warning'}">${aluno.mediaGeral}</span></p>
                    <p><strong>Total Faltas:</strong> ${aluno.faltas}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${aluno.status}">${aluno.status}</span></p>
                    <p><strong>Matrícula:</strong> ${new Date(aluno.dataMatricula).toLocaleDateString('pt-BR')}</p>
                </div>
            `;
        }

        function getDetalhesTurma(id) {
            const turma = MOCK_DATA.turmas.find(t => t.id === id);
            if (!turma) return '<p>Turma não encontrada</p>';

            const escola = MOCK_DATA.escolas.find(e => e.id === turma.escolaId);
            const professor = MOCK_DATA.professores.find(p => p.id === turma.professorId);
            const alunos = MOCK_DATA.alunos.filter(a => a.turmaId === turma.id);
            const horarios = MOCK_DATA.horarios.filter(h => h.turmaId === turma.id);

            return `
                <div class="detalhes-turma">
                    <p><strong>Turma:</strong> ${turma.nome}</p>
                    <p><strong>Escola:</strong> ${escola ? escola.nome : 'N/A'}</p>
                    <p><strong>Professor:</strong> ${professor ? professor.nome : 'Não atribuído'}</p>
                    <p><strong>Período:</strong> ${turma.periodo}</p>
                    <p><strong>Horário:</strong> ${turma.horarioInicio} - ${turma.horarioFim}</p>
                    <p><strong>Sala:</strong> ${turma.sala}</p>
                    <p><strong>Total Alunos:</strong> ${turma.totalAlunos}</p>
                    
                    <h4 style="margin-top: 20px;">Alunos</h4>
                    <ul>
                        ${alunos.map(a => `<li>${a.nome} (${a.matricula})</li>`).join('')}
                    </ul>
                    
                    <h4 style="margin-top: 20px;">Horário Semanal</h4>
                    <ul>
                        ${horarios.map(h => `<li>${h.dia}: ${h.disciplina} - ${h.horarioInicio} às ${h.horarioFim} (Sala ${h.sala})</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // ==================== FUNÇÕES DE RELATÓRIO ====================
        function gerarRelatorioEscolas() {
            const escolas = MOCK_DATA.escolas;
            const totalAlunos = escolas.reduce((acc, e) => acc + e.totalAlunos, 0);
            const totalProfessores = escolas.reduce((acc, e) => acc + e.totalProfessores, 0);

            return `
                <div class="relatorio">
                    <h2>Relatório de Escolas</h2>
                    <p>Total de Escolas: ${escolas.length}</p>
                    <p>Total de Alunos: ${totalAlunos}</p>
                    <p>Total de Professores: ${totalProfessores}</p>
                    
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Escola</th>
                                <th>Alunos</th>
                                <th>Professores</th>
                                <th>Turmas</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${escolas.map(e => `
                                <tr>
                                    <td>${e.nome}</td>
                                    <td>${e.totalAlunos}</td>
                                    <td>${e.totalProfessores}</td>
                                    <td>${e.totalTurmas}</td>
                                    <td><span class="status-badge ${e.status}">${e.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarEscolas,
            renderizarProfessores,
            renderizarAlunos,
            renderizarTurmas,
            getFormEscola,
            getFormProfessor,
            getFormAluno,
            getFormTurma: () => `<p>Formulário de turma em desenvolvimento</p>`,
            getDetalhesEscola,
            getDetalhesProfessor,
            getDetalhesAluno,
            getDetalhesTurma,
            gerarRelatorioEscolas
        };
    })();

    // Exportar módulo
    window.MODULO_SECRETARIA = MODULO_SECRETARIA;
    console.log('✅ Módulo da Secretaria carregado');
}
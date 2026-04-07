// Módulo do Dashboard
const DashboardModule = {
    // Carrega o menu baseado no perfil do usuário
    loadMenu: function() {
        const menuEl = document.getElementById('sidebar-menu');
        const user = AuthModule.getCurrentUser();
        
        if (!user || !menuEl) return;
        
        let menuItems = [];
        
        // Menu baseado no perfil
        switch(user.role) {
            case 'secretaria':
                menuItems = [
                    { id: 'dashboard', text: 'Dashboard', icon: 'fas fa-tachometer-alt' },
                    { id: 'escolas', text: 'Escolas Municipais', icon: 'fas fa-school' },
                    { id: 'professores', text: 'Professores', icon: 'fas fa-chalkboard-teacher' },
                    { id: 'alunos', text: 'Alunos', icon: 'fas fa-user-graduate' },
                    { id: 'turmas', text: 'Turmas', icon: 'fas fa-users' },
                    { id: 'calendario', text: 'Calendário Escolar', icon: 'fas fa-calendar-alt' },
                    { id: 'relatorios', text: 'Relatórios', icon: 'fas fa-chart-bar' },
                    { id: 'configuracoes', text: 'Configurações', icon: 'fas fa-cogs' }
                ];
                break;
                
            case 'diretor':
                menuItems = [
                    { id: 'dashboard', text: 'Dashboard', icon: 'fas fa-tachometer-alt' },
                    { id: 'professores-escola', text: 'Professores', icon: 'fas fa-chalkboard-teacher' },
                    { id: 'alunos-escola', text: 'Alunos', icon: 'fas fa-user-graduate' },
                    { id: 'turmas-escola', text: 'Turmas', icon: 'fas fa-users' },
                    { id: 'frequencia', text: 'Controle de Frequência', icon: 'fas fa-clipboard-check' },
                    { id: 'notas', text: 'Notas e Avaliações', icon: 'fas fa-file-signature' },
                    { id: 'recursos', text: 'Recursos Educacionais', icon: 'fas fa-book-open' },
                    { id: 'comunicados', text: 'Comunicados', icon: 'fas fa-bullhorn' }
                ];
                break;
                
            case 'professor':
                menuItems = [
                    { id: 'dashboard', text: 'Dashboard', icon: 'fas fa-tachometer-alt' },
                    { id: 'minhas-turmas', text: 'Minhas Turmas', icon: 'fas fa-users' },
                    { id: 'alunos-turma', text: 'Meus Alunos', icon: 'fas fa-user-graduate' },
                    { id: 'registrar-notas', text: 'Registrar Notas', icon: 'fas fa-file-signature' },
                    { id: 'registrar-frequencia', text: 'Registrar Frequência', icon: 'fas fa-clipboard-check' },
                    { id: 'planejamento', text: 'Planejamento de Aulas', icon: 'fas fa-chalkboard' },
                    { id: 'recursos', text: 'Recursos Educacionais', icon: 'fas fa-book-open' },
                    { id: 'comunicados', text: 'Comunicados', icon: 'fas fa-bullhorn' }
                ];
                break;
                
            case 'aluno':
                menuItems = [
                    { id: 'dashboard', text: 'Dashboard', icon: 'fas fa-tachometer-alt' },
                    { id: 'minhas-notas', text: 'Minhas Notas', icon: 'fas fa-file-signature' },
                    { id: 'minha-frequencia', text: 'Minha Frequência', icon: 'fas fa-clipboard-check' },
                    { id: 'horario-aulas', text: 'Horário de Aulas', icon: 'fas fa-clock' },
                    { id: 'calendario', text: 'Calendário Escolar', icon: 'fas fa-calendar-alt' },
                    { id: 'recursos', text: 'Recursos Educacionais', icon: 'fas fa-book-open' },
                    { id: 'comunicados', text: 'Comunicados', icon: 'fas fa-bullhorn' },
                    { id: 'atividades', text: 'Atividades', icon: 'fas fa-tasks' }
                ];
                break;
        }
        
        // Limpa o menu atual
        menuEl.innerHTML = '';
        
        // Adiciona os itens do menu
        menuItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'menu-item';
            li.dataset.menu = item.id;
            li.innerHTML = `
                <i class="${item.icon}"></i>
                <span>${item.text}</span>
            `;
            menuEl.appendChild(li);
        });
        
        // Adiciona evento de clique nos itens do menu
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', function() {
                // Remove a classe active de todos os itens
                document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
                
                // Adiciona a classe active ao item clicado
                this.classList.add('active');
                
                // Carrega o conteúdo correspondente
                const menuId = this.dataset.menu;
                DashboardModule.loadContent(menuId);
            });
        });
        
        // Ativa o primeiro item do menu
        if (menuEl.firstChild) {
            menuEl.firstChild.classList.add('active');
            DashboardModule.loadContent(menuEl.firstChild.dataset.menu);
        }
    },
    
    // Carrega o conteúdo baseado no item do menu selecionado
    loadContent: function(menuId) {
        const contentArea = document.getElementById('content-area');
        const user = AuthModule.getCurrentUser();
        
        if (!contentArea || !user) return;
        
        let content = '';
        
        // Conteúdo baseado no perfil e no menu selecionado
        switch(user.role) {
            case 'secretaria':
                content = this.loadSecretariaContent(menuId);
                break;
            case 'diretor':
                content = this.loadDiretorContent(menuId);
                break;
            case 'professor':
                content = this.loadProfessorContent(menuId);
                break;
            case 'aluno':
                content = this.loadAlunoContent(menuId);
                break;
        }
        
        contentArea.innerHTML = content;
        
        // Adiciona eventos específicos ao conteúdo carregado
        this.attachContentEvents(menuId);
    },
    
    // Carrega conteúdo para a secretaria
    loadSecretariaContent: function(menuId) {
        switch(menuId) {
            case 'dashboard':
                return this.createSecretariaDashboard();
            case 'escolas':
                return this.createEscolasList();
            case 'professores':
                return this.createProfessoresList();
            case 'alunos':
                return this.createAlunosList();
            case 'turmas':
                return this.createTurmasList();
            case 'calendario':
                return this.createCalendario();
            case 'relatorios':
                return this.createRelatorios();
            case 'configuracoes':
                return this.createConfiguracoes();
            default:
                return '<p>Conteúdo não encontrado.</p>';
        }
    },
    
    // Carrega conteúdo para o diretor
    loadDiretorContent: function(menuId) {
        switch(menuId) {
            case 'dashboard':
                return this.createDiretorDashboard();
            case 'professores-escola':
                return this.createProfessoresEscola();
            case 'alunos-escola':
                return this.createAlunosEscola();
            case 'turmas-escola':
                return this.createTurmasEscola();
            case 'frequencia':
                return this.createFrequenciaControle();
            case 'notas':
                return this.createNotasAvaliacoes();
            case 'recursos':
                return this.createRecursosEducacionais();
            case 'comunicados':
                return this.createComunicados();
            default:
                return '<p>Conteúdo não encontrado.</p>';
        }
    },
    
    // Carrega conteúdo para o professor
    loadProfessorContent: function(menuId) {
        switch(menuId) {
            case 'dashboard':
                return this.createProfessorDashboard();
            case 'minhas-turmas':
                return this.createMinhasTurmas();
            case 'alunos-turma':
                return this.createAlunosTurma();
            case 'registrar-notas':
                return this.createRegistrarNotas();
            case 'registrar-frequencia':
                return this.createRegistrarFrequencia();
            case 'planejamento':
                return this.createPlanejamentoAulas();
            case 'recursos':
                return this.createRecursosEducacionais();
            case 'comunicados':
                return this.createComunicados();
            default:
                return '<p>Conteúdo não encontrado.</p>';
        }
    },
    
    // Carrega conteúdo para o aluno
    loadAlunoContent: function(menuId) {
        switch(menuId) {
            case 'dashboard':
                return this.createAlunoDashboard();
            case 'minhas-notas':
                return this.createMinhasNotas();
            case 'minha-frequencia':
                return this.createMinhaFrequencia();
            case 'horario-aulas':
                return this.createHorarioAulas();
            case 'calendario':
                return this.createCalendario();
            case 'recursos':
                return this.createRecursosEducacionais();
            case 'comunicados':
                return this.createComunicados();
            case 'atividades':
                return this.createAtividades();
            default:
                return '<p>Conteúdo não encontrado.</p>';
        }
    },
    
    // Dashboard da secretaria
    createSecretariaDashboard: function() {
        const escolas = mockData.escolas;
        const professores = mockData.professores;
        const alunos = mockData.alunos;
        const turmas = mockData.turmas;
        
        return `
            <div class="content-header">
                <h2>Dashboard - Secretaria Municipal de Educação</h2>
                <button class="btn btn-primary" id="refresh-btn">
                    <i class="fas fa-sync-alt"></i> Atualizar
                </button>
            </div>
            
            <div class="cards-container">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-school"></i>
                        <h3>Escolas</h3>
                    </div>
                    <div class="card-stat">${escolas.length}</div>
                    <p class="card-text">Escolas municipais cadastradas</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-chalkboard-teacher"></i>
                        <h3>Professores</h3>
                    </div>
                    <div class="card-stat">${professores.length}</div>
                    <p class="card-text">Professores na rede municipal</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-user-graduate"></i>
                        <h3>Alunos</h3>
                    </div>
                    <div class="card-stat">${alunos.length}</div>
                    <p class="card-text">Alunos matriculados</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-users"></i>
                        <h3>Turmas</h3>
                    </div>
                    <div class="card-stat">${turmas.length}</div>
                    <p class="card-text">Turmas ativas</p>
                </div>
            </div>
            
            <div class="table-container">
                <h3 style="padding: 20px 20px 0;">Escolas Municipais</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Nome da Escola</th>
                            <th>Endereço</th>
                            <th>Telefone</th>
                            <th>Alunos</th>
                            <th>Professores</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${escolas.map(escola => `
                            <tr>
                                <td>${escola.nome}</td>
                                <td>${escola.endereco}</td>
                                <td>${escola.telefone}</td>
                                <td>${escola.alunos}</td>
                                <td>${escola.professores}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    // Lista de escolas
    createEscolasList: function() {
        const escolas = mockData.escolas;
        
        return `
            <div class="content-header">
                <h2>Escolas Municipais</h2>
                <button class="btn btn-primary" id="add-escola-btn">
                    <i class="fas fa-plus"></i> Nova Escola
                </button>
            </div>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome da Escola</th>
                            <th>Endereço</th>
                            <th>Telefone</th>
                            <th>Alunos</th>
                            <th>Professores</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${escolas.map(escola => `
                            <tr>
                                <td>${escola.id}</td>
                                <td>${escola.nome}</td>
                                <td>${escola.endereco}</td>
                                <td>${escola.telefone}</td>
                                <td>${escola.alunos}</td>
                                <td>${escola.professores}</td>
                                <td>
                                    <button class="btn-icon view-escola" data-id="${escola.id}" title="Visualizar">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-icon edit-escola" data-id="${escola.id}" title="Editar">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    // Lista de professores
    createProfessoresList: function() {
        const professores = mockData.professores;
        
        return `
            <div class="content-header">
                <h2>Professores da Rede Municipal</h2>
                <button class="btn btn-primary" id="add-professor-btn">
                    <i class="fas fa-plus"></i> Novo Professor
                </button>
            </div>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>E-mail</th>
                            <th>Telefone</th>
                            <th>Disciplina</th>
                            <th>Escola</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${professores.map(professor => {
                            const escola = mockData.getById('escolas', professor.escolaId);
                            return `
                                <tr>
                                    <td>${professor.id}</td>
                                    <td>${professor.nome}</td>
                                    <td>${professor.email}</td>
                                    <td>${professor.telefone}</td>
                                    <td>${professor.disciplina}</td>
                                    <td>${escola ? escola.nome : 'Não atribuído'}</td>
                                    <td>
                                        <button class="btn-icon view-professor" data-id="${professor.id}" title="Visualizar">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn-icon edit-professor" data-id="${professor.id}" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    // Dashboard do diretor
    createDiretorDashboard: function() {
        const user = AuthModule.getCurrentUser();
        const escola = mockData.getById('escolas', user.escolaId);
        const professores = mockData.getData('professores', { escolaId: user.escolaId });
        const alunos = mockData.getData('alunos', { escolaId: user.escolaId });
        const turmas = mockData.getData('turmas', { escolaId: user.escolaId });
        
        return `
            <div class="content-header">
                <h2>Dashboard - ${escola ? escola.nome : 'Escola'}</h2>
                <div class="user-info">
                    <span>Diretor: ${user.name}</span>
                </div>
            </div>
            
            <div class="cards-container">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-chalkboard-teacher"></i>
                        <h3>Professores</h3>
                    </div>
                    <div class="card-stat">${professores.length}</div>
                    <p class="card-text">Professores nesta escola</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-user-graduate"></i>
                        <h3>Alunos</h3>
                    </div>
                    <div class="card-stat">${alunos.length}</div>
                    <p class="card-text">Alunos matriculados</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-users"></i>
                        <h3>Turmas</h3>
                    </div>
                    <div class="card-stat">${turmas.length}</div>
                    <p class="card-text">Turmas ativas</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-percentage"></i>
                        <h3>Frequência</h3>
                    </div>
                    <div class="card-stat">94%</div>
                    <p class="card-text">Média de frequência escolar</p>
                </div>
            </div>
            
            <div class="table-container">
                <h3 style="padding: 20px 20px 0;">Turmas da Escola</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Turma</th>
                            <th>Professor Responsável</th>
                            <th>Turno</th>
                            <th>Número de Alunos</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${turmas.map(turma => {
                            const professor = mockData.getById('professores', turma.professorId);
                            return `
                                <tr>
                                    <td>${turma.nome}</td>
                                    <td>${professor ? professor.nome : 'Não atribuído'}</td>
                                    <td>${turma.turno}</td>
                                    <td>${turma.alunos}</td>
                                    <td>
                                        <button class="btn-icon view-turma" data-id="${turma.id}" title="Visualizar">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    // Dashboard do professor
    createProfessorDashboard: function() {
        const user = AuthModule.getCurrentUser();
        const turmas = mockData.getData('turmas', { professorId: user.id });
        const alunos = mockData.getData('alunos', { turmaId: turmas.length > 0 ? turmas[0].id : null });
        
        return `
            <div class="content-header">
                <h2>Dashboard - Professor(a) ${user.name}</h2>
                <div class="user-info">
                    <span>Disciplina: ${user.disciplina || 'Não informada'}</span>
                </div>
            </div>
            
            <div class="cards-container">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-users"></i>
                        <h3>Turmas</h3>
                    </div>
                    <div class="card-stat">${turmas.length}</div>
                    <p class="card-text">Turmas sob sua responsabilidade</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-user-graduate"></i>
                        <h3>Alunos</h3>
                    </div>
                    <div class="card-stat">${alunos.length}</div>
                    <p class="card-text">Total de alunos</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-file-signature"></i>
                        <h3>Avaliações</h3>
                    </div>
                    <div class="card-stat">${Math.floor(alunos.length * 1.5)}</div>
                    <p class="card-text">Avaliações pendentes</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-calendar-alt"></i>
                        <h3>Próxima Aula</h3>
                    </div>
                    <div class="card-stat">Amanhã</div>
                    <p class="card-text">8:00 - 5º Ano A - Matemática</p>
                </div>
            </div>
            
            <div class="table-container">
                <h3 style="padding: 20px 20px 0;">Suas Turmas</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Turma</th>
                            <th>Turno</th>
                            <th>Número de Alunos</th>
                            <th>Disciplina</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${turmas.map(turma => `
                            <tr>
                                <td>${turma.nome}</td>
                                <td>${turma.turno}</td>
                                <td>${turma.alunos}</td>
                                <td>${user.disciplina || 'Não informada'}</td>
                                <td>
                                    <button class="btn btn-primary btn-sm view-turma-prof" data-id="${turma.id}">
                                        <i class="fas fa-eye"></i> Ver Detalhes
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    // Dashboard do aluno
    createAlunoDashboard: function() {
        const user = AuthModule.getCurrentUser();
        const notas = mockData.getData('notas', { alunoId: user.id });
        const frequencia = mockData.getData('frequencia', { alunoId: user.id });
        const presencas = frequencia.filter(f => f.presente).length;
        const totalAulas = frequencia.length;
        const percentualFrequencia = totalAulas > 0 ? Math.round((presencas / totalAulas) * 100) : 0;
        
        // Calcular média das notas
        let media = 0;
        if (notas.length > 0) {
            const somaNotas = notas.reduce((acc, nota) => acc + nota.nota, 0);
            media = somaNotas / notas.length;
        }
        
        return `
            <div class="content-header">
                <h2>Dashboard - Aluno(a) ${user.name}</h2>
                <div class="user-info">
                    <span>Bem-vindo ao seu portal educacional</span>
                </div>
            </div>
            
            <div class="cards-container">
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-file-signature"></i>
                        <h3>Média Geral</h3>
                    </div>
                    <div class="card-stat">${media.toFixed(1)}</div>
                    <p class="card-text">Sua média em todas as disciplinas</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-clipboard-check"></i>
                        <h3>Frequência</h3>
                    </div>
                    <div class="card-stat">${percentualFrequencia}%</div>
                    <p class="card-text">Presença em ${presencas} de ${totalAulas} aulas</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-book"></i>
                        <h3>Disciplinas</h3>
                    </div>
                    <div class="card-stat">${[...new Set(notas.map(n => n.disciplina))].length}</div>
                    <p class="card-text">Disciplinas com notas registradas</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <i class="fas fa-calendar-alt"></i>
                        <h3>Próxima Aula</h3>
                    </div>
                    <div class="card-stat">Matemática</div>
                    <p class="card-text">Amanhã, 8:00 - Sala 12</p>
                </div>
            </div>
            
            <div class="table-container">
                <h3 style="padding: 20px 20px 0;">Suas Notas Recentes</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Disciplina</th>
                            <th>Bimestre</th>
                            <th>Nota</th>
                            <th>Situação</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${notas.slice(0, 5).map(nota => `
                            <tr>
                                <td>${nota.disciplina}</td>
                                <td>${nota.bimestre}º Bimestre</td>
                                <td>${nota.nota.toFixed(1)}</td>
                                <td>
                                    <span class="${nota.nota >= 6 ? 'status-success' : 'status-danger'}">
                                        ${nota.nota >= 6 ? 'Aprovado' : 'Em recuperação'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    // Funções auxiliares para criar outros conteúdos
    createAlunosList: function() {
        return '<h2>Lista de Alunos</h2><p>Funcionalidade de listagem de alunos será implementada aqui.</p>';
    },
    
    createTurmasList: function() {
        return '<h2>Lista de Turmas</h2><p>Funcionalidade de listagem de turmas será implementada aqui.</p>';
    },
    
    createCalendario: function() {
        return '<h2>Calendário Escolar</h2><p>Funcionalidade de calendário será implementada aqui.</p>';
    },
    
    createRelatorios: function() {
        return '<h2>Relatórios</h2><p>Funcionalidade de relatórios será implementada aqui.</p>';
    },
    
    createConfiguracoes: function() {
        return '<h2>Configurações</h2><p>Funcionalidade de configurações será implementada aqui.</p>';
    },
    
    createProfessoresEscola: function() {
        return '<h2>Professores da Escola</h2><p>Funcionalidade de professores por escola será implementada aqui.</p>';
    },
    
    createAlunosEscola: function() {
        return '<h2>Alunos da Escola</h2><p>Funcionalidade de alunos por escola será implementada aqui.</p>';
    },
    
    createTurmasEscola: function() {
        return '<h2>Turmas da Escola</h2><p>Funcionalidade de turmas por escola será implementada aqui.</p>';
    },
    
    createFrequenciaControle: function() {
        return '<h2>Controle de Frequência</h2><p>Funcionalidade de controle de frequência será implementada aqui.</p>';
    },
    
    createNotasAvaliacoes: function() {
        return '<h2>Notas e Avaliações</h2><p>Funcionalidade de notas e avaliações será implementada aqui.</p>';
    },
    
    createRecursosEducacionais: function() {
        return '<h2>Recursos Educacionais</h2><p>Funcionalidade de recursos educacionais será implementada aqui.</p>';
    },
    
    createComunicados: function() {
        return '<h2>Comunicados</h2><p>Funcionalidade de comunicados será implementada aqui.</p>';
    },
    
    createMinhasTurmas: function() {
        return '<h2>Minhas Turmas</h2><p>Funcionalidade de minhas turmas será implementada aqui.</p>';
    },
    
    createAlunosTurma: function() {
        return '<h2>Meus Alunos</h2><p>Funcionalidade de meus alunos será implementada aqui.</p>';
    },
    
    createRegistrarNotas: function() {
        return '<h2>Registrar Notas</h2><p>Funcionalidade de registrar notas será implementada aqui.</p>';
    },
    
    createRegistrarFrequencia: function() {
        return '<h2>Registrar Frequência</h2><p>Funcionalidade de registrar frequência será implementada aqui.</p>';
    },
    
    createPlanejamentoAulas: function() {
        return '<h2>Planejamento de Aulas</h2><p>Funcionalidade de planejamento de aulas será implementada aqui.</p>';
    },
    
    createMinhasNotas: function() {
        return '<h2>Minhas Notas</h2><p>Funcionalidade de minhas notas será implementada aqui.</p>';
    },
    
    createMinhaFrequencia: function() {
        return '<h2>Minha Frequência</h2><p>Funcionalidade de minha frequência será implementada aqui.</p>';
    },
    
    createHorarioAulas: function() {
        return '<h2>Horário de Aulas</h2><p>Funcionalidade de horário de aulas será implementada aqui.</p>';
    },
    
    createAtividades: function() {
        return '<h2>Atividades</h2><p>Funcionalidade de atividades será implementada aqui.</p>';
    },
    
    // Anexa eventos ao conteúdo carregado
    attachContentEvents: function(menuId) {
        // Adiciona eventos específicos baseados no conteúdo carregado
        if (menuId === 'escolas') {
            // Eventos para a lista de escolas
            document.querySelectorAll('.view-escola').forEach(btn => {
                btn.addEventListener('click', function() {
                    const escolaId = this.dataset.id;
                    DashboardModule.showModal('Visualizar Escola', `Visualizando escola com ID ${escolaId}`);
                });
            });
            
            document.querySelectorAll('.edit-escola').forEach(btn => {
                btn.addEventListener('click', function() {
                    const escolaId = this.dataset.id;
                    DashboardModule.showModal('Editar Escola', `Editando escola com ID ${escolaId}`);
                });
            });
            
            document.getElementById('add-escola-btn')?.addEventListener('click', function() {
                DashboardModule.showModal('Adicionar Nova Escola', 'Formulário para adicionar nova escola');
            });
        }
        
        if (menuId === 'professores') {
            // Eventos para a lista de professores
            document.querySelectorAll('.view-professor').forEach(btn => {
                btn.addEventListener('click', function() {
                    const professorId = this.dataset.id;
                    DashboardModule.showModal('Visualizar Professor', `Visualizando professor com ID ${professorId}`);
                });
            });
            
            document.querySelectorAll('.edit-professor').forEach(btn => {
                btn.addEventListener('click', function() {
                    const professorId = this.dataset.id;
                    DashboardModule.showModal('Editar Professor', `Editando professor com ID ${professorId}`);
                });
            });
            
            document.getElementById('add-professor-btn')?.addEventListener('click', function() {
                DashboardModule.showModal('Adicionar Novo Professor', 'Formulário para adicionar novo professor');
            });
        }
        
        // Evento para o botão de atualizar no dashboard
        document.getElementById('refresh-btn')?.addEventListener('click', function() {
            DashboardModule.loadContent('dashboard');
        });
        
        // Eventos para visualizar turmas
        document.querySelectorAll('.view-turma').forEach(btn => {
            btn.addEventListener('click', function() {
                const turmaId = this.dataset.id;
                DashboardModule.showModal('Detalhes da Turma', `Visualizando turma com ID ${turmaId}`);
            });
        });
        
        document.querySelectorAll('.view-turma-prof').forEach(btn => {
            btn.addEventListener('click', function() {
                const turmaId = this.dataset.id;
                DashboardModule.showModal('Detalhes da Turma', `Visualizando turma com ID ${turmaId}`);
            });
        });
    },
    
    // Mostra um modal com conteúdo personalizado
    showModal: function(title, content) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = content;
        document.getElementById('modal').classList.add('active');
    },
    
    // Inicializa o dashboard
    init: function() {
        const user = AuthModule.getCurrentUser();
        if (!user) return;
        
        // Atualiza informações do usuário no header
        document.getElementById('current-user').textContent = user.name;
        document.getElementById('current-role').textContent = this.getRoleName(user.role);
        document.getElementById('dashboard-title').textContent = `Sistema de Gestão - ${this.getRoleName(user.role)}`;
        
        // Carrega o menu
        this.loadMenu();
        
        // Adiciona evento para o toggle do menu (mobile)
        document.getElementById('menu-toggle')?.addEventListener('click', function() {
            document.getElementById('sidebar').classList.toggle('active');
        });
    },
    
    // Retorna o nome completo da role
    getRoleName: function(role) {
        switch(role) {
            case 'secretaria': return 'Secretaria da Educação';
            case 'diretor': return 'Diretor de Escola';
            case 'professor': return 'Professor';
            case 'aluno': return 'Aluno';
            default: return 'Usuário';
        }
    }
};
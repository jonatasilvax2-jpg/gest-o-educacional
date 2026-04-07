// modulos/projetos.js - Módulo de Projetos Escolares
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_PROJETOS === 'undefined') {
    const MODULO_PROJETOS = (function() {
        'use strict';

        // ==================== DADOS LOCAIS ====================
        let projetos = MOCK_DATA.projetos || [];

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarProjetos(secao) {
            const usuario = SISTEMA.getEstado().usuario;

            if (secao === 'listar' || usuario.perfil === 'secretaria' || usuario.perfil === 'diretor') {
                return renderizarGerenciamentoProjetos();
            } else if (usuario.perfil === 'professor') {
                return renderizarProjetosProfessor();
            } else if (usuario.perfil === 'aluno') {
                return renderizarProjetosAluno();
            } else {
                return renderizarProjetosVisiveis();
            }
        }

        function renderizarGerenciamentoProjetos() {
            const projetosAtivos = projetos.filter(p => p.status === 'em_andamento');
            const projetosConcluidos = projetos.filter(p => p.status === 'concluido');
            const projetosPlanejados = projetos.filter(p => p.status === 'planejamento');

            return `
                <div class="projetos-content">
                    <div class="content-header">
                        <h1><i class="fas fa-project-diagram"></i> Gerenciar Projetos</h1>
                        <button class="btn btn-success" onclick="abrirModal('Novo Projeto', getFormProjeto())">
                            <i class="fas fa-plus"></i> Novo Projeto
                        </button>
                    </div>
                    
                    <div class="projetos-stats">
                        <div class="stat-card">
                            <div class="stat-icon bg-primary">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Em Andamento</h3>
                                <p class="stat-number">${projetosAtivos.length}</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon bg-success">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Concluídos</h3>
                                <p class="stat-number">${projetosConcluidos.length}</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon bg-warning">
                                <i class="fas fa-pencil-alt"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Em Planejamento</h3>
                                <p class="stat-number">${projetosPlanejados.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="projetos-tabs">
                        <button class="tab-btn active" onclick="mostrarAbaProjetos('ativos')">
                            <i class="fas fa-play"></i> Em Andamento
                        </button>
                        <button class="tab-btn" onclick="mostrarAbaProjetos('planejados')">
                            <i class="fas fa-pencil-alt"></i> Planejados
                        </button>
                        <button class="tab-btn" onclick="mostrarAbaProjetos('concluidos')">
                            <i class="fas fa-check"></i> Concluídos
                        </button>
                        <button class="tab-btn" onclick="mostrarAbaProjetos('todos')">
                            <i class="fas fa-list"></i> Todos
                        </button>
                    </div>
                    
                    <div id="projetos-ativos" class="projetos-lista active">
                        ${projetosAtivos.map(projeto => criarCardProjeto(projeto)).join('')}
                        ${projetosAtivos.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Nenhum projeto em andamento</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div id="projetos-planejados" class="projetos-lista">
                        ${projetosPlanejados.map(projeto => criarCardProjeto(projeto)).join('')}
                        ${projetosPlanejados.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Nenhum projeto em planejamento</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div id="projetos-concluidos" class="projetos-lista">
                        ${projetosConcluidos.map(projeto => criarCardProjeto(projeto)).join('')}
                        ${projetosConcluidos.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Nenhum projeto concluído</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div id="projetos-todos" class="projetos-lista">
                        ${projetos.map(projeto => criarCardProjeto(projeto)).join('')}
                    </div>
                </div>
            `;
        }

        function renderizarProjetosProfessor() {
            const usuario = SISTEMA.getEstado().usuario;
            const professor = MOCK_DATA.professores.find(p => p.email === usuario.email);
            
            const meusProjetos = projetos.filter(p => 
                p.responsavel === professor?.id || p.professorId === professor?.id
            );

            return `
                <div class="projetos-content">
                    <div class="content-header">
                        <h1><i class="fas fa-project-diagram"></i> Meus Projetos</h1>
                        <button class="btn btn-success" onclick="abrirModal('Novo Projeto', getFormProjeto())">
                            <i class="fas fa-plus"></i> Novo Projeto
                        </button>
                    </div>
                    
                    <div class="projetos-calendario">
                        <h2>Próximos Prazos</h2>
                        ${meusProjetos.filter(p => p.status === 'em_andamento').map(projeto => `
                            <div class="projeto-prazo">
                                <span class="projeto-nome">${projeto.titulo}</span>
                                <span class="projeto-data">Fim: ${new Date(projeto.dataFim).toLocaleDateString('pt-BR')}</span>
                                ${calcularDiasRestantes(projeto.dataFim) <= 7 ? 
                                    '<span class="badge badge-warning">Prazo próximo!</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="projetos-lista">
                        <h2>Projetos Ativos</h2>
                        ${meusProjetos.filter(p => p.status === 'em_andamento').map(projeto => criarCardProjeto(projeto)).join('')}
                        
                        <h2 style="margin-top: 30px;">Projetos Concluídos</h2>
                        ${meusProjetos.filter(p => p.status === 'concluido').map(projeto => criarCardProjeto(projeto)).join('')}
                    </div>
                </div>
            `;
        }

        function renderizarProjetosAluno() {
            const usuario = SISTEMA.getEstado().usuario;
            const aluno = MOCK_DATA.alunos.find(a => a.email === usuario.email);
            
            const projetosAluno = projetos.filter(p => 
                p.alunos?.includes(aluno?.id) || 
                p.turmas?.includes(aluno?.turmaId)
            );

            return `
                <div class="projetos-content">
                    <div class="content-header">
                        <h1><i class="fas fa-project-diagram"></i> Projetos que Participo</h1>
                    </div>
                    
                    <div class="projetos-participacao">
                        ${projetosAluno.map(projeto => `
                            <div class="projeto-participante-card">
                                <div class="projeto-header">
                                    <h3>${projeto.titulo}</h3>
                                    <span class="status-badge ${projeto.status}">${projeto.status}</span>
                                </div>
                                <div class="projeto-body">
                                    <p>${projeto.descricao}</p>
                                    <p><i class="fas fa-calendar"></i> Período: ${new Date(projeto.dataInicio).toLocaleDateString('pt-BR')} - ${new Date(projeto.dataFim).toLocaleDateString('pt-BR')}</p>
                                    <p><i class="fas fa-user-tie"></i> Responsável: ${getNomeResponsavel(projeto.responsavel)}</p>
                                    
                                    <div class="progresso-container">
                                        <div class="progresso-label">Progresso do Projeto</div>
                                        <div class="progress-bar-container">
                                            <div class="progress-bar" style="width: ${calcularProgresso(projeto)}%"></div>
                                        </div>
                                        <span class="progresso-valor">${calcularProgresso(projeto)}%</span>
                                    </div>
                                    
                                    <div class="projeto-acoes">
                                        <button class="btn btn-sm btn-primary" onclick="abrirModal('${projeto.titulo}', getDetalhesProjeto(${projeto.id}))">
                                            <i class="fas fa-eye"></i> Detalhes
                                        </button>
                                        <button class="btn btn-sm btn-success" onclick="abrirModal('Entregar Atividade', getFormEntregaProjeto(${projeto.id}))">
                                            <i class="fas fa-upload"></i> Entregar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                        
                        ${projetosAluno.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Você não participa de nenhum projeto no momento</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        function renderizarProjetosVisiveis() {
            const projetosPublicos = projetos.filter(p => p.visivelPublico !== false);

            return `
                <div class="projetos-content">
                    <div class="content-header">
                        <h1><i class="fas fa-project-diagram"></i> Projetos da Escola</h1>
                    </div>
                    
                    <div class="projetos-grid">
                        ${projetosPublicos.map(projeto => `
                            <div class="projeto-card-visivel">
                                <h3>${projeto.titulo}</h3>
                                <p>${projeto.descricao.substring(0, 150)}${projeto.descricao.length > 150 ? '...' : ''}</p>
                                <p><strong>Período:</strong> ${new Date(projeto.dataInicio).toLocaleDateString('pt-BR')} - ${new Date(projeto.dataFim).toLocaleDateString('pt-BR')}</p>
                                <p><strong>Responsável:</strong> ${getNomeResponsavel(projeto.responsavel)}</p>
                                <button class="btn btn-sm btn-primary" onclick="abrirModal('${projeto.titulo}', getDetalhesProjeto(${projeto.id}))">
                                    Saiba mais
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function criarCardProjeto(projeto) {
            const diasRestantes = calcularDiasRestantes(projeto.dataFim);
            
            return `
                <div class="projeto-card">
                    <div class="projeto-header">
                        <h3>${projeto.titulo}</h3>
                        <span class="status-badge ${projeto.status}">${getStatusNome(projeto.status)}</span>
                    </div>
                    <div class="projeto-body">
                        <p>${projeto.descricao}</p>
                        <p><i class="fas fa-calendar"></i> ${new Date(projeto.dataInicio).toLocaleDateString('pt-BR')} - ${new Date(projeto.dataFim).toLocaleDateString('pt-BR')}</p>
                        <p><i class="fas fa-user-tie"></i> Responsável: ${getNomeResponsavel(projeto.responsavel)}</p>
                        <p><i class="fas fa-users"></i> Turmas: ${projeto.turmas?.map(t => t).join(', ') || 'Todas'}</p>
                        
                        <div class="progresso-container">
                            <div class="progresso-label">Progresso</div>
                            <div class="progress-bar-container">
                                <div class="progress-bar" style="width: ${calcularProgresso(projeto)}%"></div>
                            </div>
                            <span class="progresso-valor">${calcularProgresso(projeto)}%</span>
                        </div>
                        
                        ${diasRestantes > 0 ? `
                            <p class="dias-restantes ${diasRestantes <= 7 ? 'text-warning' : ''}">
                                <i class="fas fa-clock"></i> ${diasRestantes} dias restantes
                            </p>
                        ` : ''}
                        
                        ${projeto.orcamento ? `
                            <p><i class="fas fa-dollar-sign"></i> Orçamento: R$ ${projeto.orcamento.toFixed(2)}</p>
                        ` : ''}
                    </div>
                    <div class="projeto-footer">
                        <button class="btn btn-sm btn-primary" onclick="abrirModal('${projeto.titulo}', getDetalhesProjeto(${projeto.id}))">
                            <i class="fas fa-eye"></i> Detalhes
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="abrirModal('Editar', getFormProjeto(${projeto.id}))">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-info" onclick="abrirModal('Acompanhamento', getFormAcompanhamento(${projeto.id}))">
                            <i class="fas fa-chart-line"></i> Acompanhar
                        </button>
                    </div>
                </div>
            `;
        }

        function getStatusNome(status) {
            const nomes = {
                'planejamento': 'Em Planejamento',
                'em_andamento': 'Em Andamento',
                'concluido': 'Concluído',
                'cancelado': 'Cancelado'
            };
            return nomes[status] || status;
        }

        function getNomeResponsavel(id) {
            if (!id) return 'Não definido';
            
            const professor = MOCK_DATA.professores.find(p => p.id === id);
            return professor ? professor.nome : 'Responsável';
        }

        function calcularDiasRestantes(dataFim) {
            const fim = new Date(dataFim);
            const hoje = new Date();
            return Math.ceil((fim - hoje) / (1000 * 60 * 60 * 24));
        }

        function calcularProgresso(projeto) {
            const inicio = new Date(projeto.dataInicio);
            const fim = new Date(projeto.dataFim);
            const hoje = new Date();
            
            if (hoje < inicio) return 0;
            if (hoje > fim) return 100;
            
            const total = fim - inicio;
            const passado = hoje - inicio;
            return Math.round((passado / total) * 100);
        }

        // ==================== FUNÇÕES DE FORMULÁRIO ====================
        function getFormProjeto(id = null) {
            if (id) {
                const projeto = projetos.find(p => p.id === id);
                if (!projeto) return '<p>Projeto não encontrado</p>';

                return `
                    <form id="form-projeto" onsubmit="event.preventDefault(); salvarProjeto(${id})">
                        <div class="form-group">
                            <label>Título *</label>
                            <input type="text" class="form-control" id="edit-titulo" value="${projeto.titulo}" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Descrição *</label>
                            <textarea class="form-control" id="edit-descricao" rows="4" required>${projeto.descricao}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label>Objetivos</label>
                            <textarea class="form-control" id="edit-objetivos" rows="3">${projeto.objetivos?.join('\n') || ''}</textarea>
                            <small>Um objetivo por linha</small>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Data Início *</label>
                                    <input type="date" class="form-control" id="edit-dataInicio" value="${projeto.dataInicio}" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Data Fim *</label>
                                    <input type="date" class="form-control" id="edit-dataFim" value="${projeto.dataFim}" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Responsável</label>
                            <select class="form-control" id="edit-responsavel">
                                <option value="">Selecione...</option>
                                ${MOCK_DATA.professores.map(p => `
                                    <option value="${p.id}" ${projeto.responsavel === p.id ? 'selected' : ''}>${p.nome}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Turmas Participantes</label>
                            <select class="form-control" id="edit-turmas" multiple size="4">
                                ${MOCK_DATA.turmas.map(t => `
                                    <option value="${t.id}" ${projeto.turmas?.includes(t.id) ? 'selected' : ''}>${t.nome}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Orçamento (R$)</label>
                            <input type="number" class="form-control" id="edit-orcamento" value="${projeto.orcamento || ''}" step="0.01">
                        </div>
                        
                        <div class="form-group">
                            <label>Status</label>
                            <select class="form-control" id="edit-status">
                                <option value="planejamento" ${projeto.status === 'planejamento' ? 'selected' : ''}>Em Planejamento</option>
                                <option value="em_andamento" ${projeto.status === 'em_andamento' ? 'selected' : ''}>Em Andamento</option>
                                <option value="concluido" ${projeto.status === 'concluido' ? 'selected' : ''}>Concluído</option>
                                <option value="cancelado" ${projeto.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Observações</label>
                            <textarea class="form-control" id="edit-observacoes" rows="3">${projeto.observacoes || ''}</textarea>
                        </div>
                    </form>
                `;
            }

            return `
                <form id="form-projeto" onsubmit="event.preventDefault(); salvarProjeto()">
                    <div class="form-group">
                        <label>Título do Projeto *</label>
                        <input type="text" class="form-control" id="novo-titulo" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Descrição *</label>
                        <textarea class="form-control" id="novo-descricao" rows="4" required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Objetivos</label>
                        <textarea class="form-control" id="novo-objetivos" rows="3" placeholder="Digite um objetivo por linha"></textarea>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Data Início *</label>
                                <input type="date" class="form-control" id="novo-dataInicio" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Data Fim *</label>
                                <input type="date" class="form-control" id="novo-dataFim" required>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Responsável</label>
                        <select class="form-control" id="novo-responsavel">
                            <option value="">Selecione...</option>
                            ${MOCK_DATA.professores.map(p => `
                                <option value="${p.id}">${p.nome}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Turmas Participantes</label>
                        <select class="form-control" id="novo-turmas" multiple size="4">
                            ${MOCK_DATA.turmas.map(t => `
                                <option value="${t.id}">${t.nome}</option>
                            `).join('')}
                        </select>
                        <small>Segure Ctrl para selecionar múltiplas turmas</small>
                    </div>
                    
                    <div class="form-group">
                        <label>Orçamento (R$)</label>
                        <input type="number" class="form-control" id="novo-orcamento" step="0.01">
                    </div>
                    
                    <div class="form-group">
                        <label>Observações</label>
                        <textarea class="form-control" id="novo-observacoes" rows="3"></textarea>
                    </div>
                </form>
            `;
        }

        function getFormAcompanhamento(projetoId) {
            const projeto = projetos.find(p => p.id === projetoId);
            
            return `
                <div class="acompanhamento-projeto">
                    <h3>${projeto?.titulo}</h3>
                    
                    <div class="acompanhamento-item">
                        <label>Progresso Atual:</label>
                        <div class="progresso-editor">
                            <input type="range" min="0" max="100" value="${calcularProgresso(projeto)}" id="progresso-slider">
                            <span id="progresso-valor">${calcularProgresso(projeto)}%</span>
                        </div>
                    </div>
                    
                    <div class="acompanhamento-item">
                        <label>Registro de Atividades</label>
                        <textarea class="form-control" rows="4" placeholder="Registre as atividades realizadas..."></textarea>
                    </div>
                    
                    <div class="acompanhamento-item">
                        <label>Dificuldades Encontradas</label>
                        <textarea class="form-control" rows="3" placeholder="Registre dificuldades..."></textarea>
                    </div>
                    
                    <div class="acompanhamento-item">
                        <label>Próximos Passos</label>
                        <textarea class="form-control" rows="3" placeholder="Próximas ações..."></textarea>
                    </div>
                    
                    <div class="acompanhamento-item">
                        <label>Anexar Fotos/Arquivos</label>
                        <input type="file" class="form-control" multiple>
                    </div>
                    
                    <div class="historico-acompanhamento">
                        <h4>Histórico de Acompanhamento</h4>
                        <div class="registro-item">
                            <span class="data">10/11/2023</span>
                            <p>Reunião de alinhamento realizada. Equipe motivada.</p>
                        </div>
                        <div class="registro-item">
                            <span class="data">05/11/2023</span>
                            <p>Primeiras atividades concluídas conforme planejado.</p>
                        </div>
                    </div>
                </div>
            `;
        }

        function getFormEntregaProjeto(projetoId) {
            return `
                <form id="form-entrega-projeto" onsubmit="event.preventDefault(); entregarProjeto(${projetoId})">
                    <div class="form-group">
                        <label>Título da Entrega *</label>
                        <input type="text" class="form-control" id="entrega-titulo" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Descrição da Atividade *</label>
                        <textarea class="form-control" id="entrega-descricao" rows="4" required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Arquivo</label>
                        <input type="file" class="form-control" id="entrega-arquivo">
                    </div>
                    
                    <div class="form-group">
                        <label>Link (opcional)</label>
                        <input type="url" class="form-control" id="entrega-link" placeholder="https://...">
                    </div>
                </form>
            `;
        }

        function getDetalhesProjeto(id) {
            const projeto = projetos.find(p => p.id === id);
            if (!projeto) return '<p>Projeto não encontrado</p>';

            return `
                <div class="detalhes-projeto">
                    <h3>${projeto.titulo}</h3>
                    
                    <div class="info-section">
                        <h4>Descrição</h4>
                        <p>${projeto.descricao}</p>
                    </div>
                    
                    ${projeto.objetivos ? `
                        <div class="info-section">
                            <h4>Objetivos</h4>
                            <ul>
                                ${projeto.objetivos.map(obj => `<li>${obj}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <div class="info-grid">
                        <div class="info-item">
                            <strong>Início:</strong> ${new Date(projeto.dataInicio).toLocaleDateString('pt-BR')}
                        </div>
                        <div class="info-item">
                            <strong>Término:</strong> ${new Date(projeto.dataFim).toLocaleDateString('pt-BR')}
                        </div>
                        <div class="info-item">
                            <strong>Responsável:</strong> ${getNomeResponsavel(projeto.responsavel)}
                        </div>
                        <div class="info-item">
                            <strong>Status:</strong> <span class="status-badge ${projeto.status}">${getStatusNome(projeto.status)}</span>
                        </div>
                        ${projeto.orcamento ? `
                            <div class="info-item">
                                <strong>Orçamento:</strong> R$ ${projeto.orcamento.toFixed(2)}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="info-section">
                        <h4>Turmas Participantes</h4>
                        <p>${projeto.turmas?.map(t => t).join(', ') || 'Todas as turmas'}</p>
                    </div>
                    
                    ${projeto.observacoes ? `
                        <div class="info-section">
                            <h4>Observações</h4>
                            <p>${projeto.observacoes}</p>
                        </div>
                    ` : ''}
                    
                    <div class="progresso-detalhado">
                        <h4>Progresso</h4>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${calcularProgresso(projeto)}%"></div>
                        </div>
                        <p>${calcularProgresso(projeto)}% concluído</p>
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES DE AÇÃO ====================
        function salvarProjeto(id = null) {
            if (id) {
                // Editar projeto existente
                const projeto = projetos.find(p => p.id === id);
                if (!projeto) return;

                projeto.titulo = document.getElementById('edit-titulo')?.value;
                projeto.descricao = document.getElementById('edit-descricao')?.value;
                
                const objetivosText = document.getElementById('edit-objetivos')?.value;
                projeto.objetivos = objetivosText ? objetivosText.split('\n').filter(o => o.trim()) : [];
                
                projeto.dataInicio = document.getElementById('edit-dataInicio')?.value;
                projeto.dataFim = document.getElementById('edit-dataFim')?.value;
                projeto.responsavel = parseInt(document.getElementById('edit-responsavel')?.value) || null;
                
                const turmas = document.getElementById('edit-turmas')?.selectedOptions;
                projeto.turmas = Array.from(turmas || []).map(opt => parseInt(opt.value));
                
                projeto.orcamento = parseFloat(document.getElementById('edit-orcamento')?.value) || null;
                projeto.status = document.getElementById('edit-status')?.value;
                projeto.observacoes = document.getElementById('edit-observacoes')?.value;

                mostrarMensagem('Projeto atualizado com sucesso!', 'success');
            } else {
                // Criar novo projeto
                const titulo = document.getElementById('novo-titulo')?.value;
                const descricao = document.getElementById('novo-descricao')?.value;
                const dataInicio = document.getElementById('novo-dataInicio')?.value;
                const dataFim = document.getElementById('novo-dataFim')?.value;

                if (!titulo || !descricao || !dataInicio || !dataFim) {
                    mostrarMensagem('Preencha os campos obrigatórios', 'error');
                    return;
                }

                const objetivosText = document.getElementById('novo-objetivos')?.value;
                const turmas = document.getElementById('novo-turmas')?.selectedOptions;

                const novoProjeto = {
                    id: Date.now(),
                    titulo: titulo,
                    descricao: descricao,
                    objetivos: objetivosText ? objetivosText.split('\n').filter(o => o.trim()) : [],
                    dataInicio: dataInicio,
                    dataFim: dataFim,
                    responsavel: parseInt(document.getElementById('novo-responsavel')?.value) || null,
                    turmas: Array.from(turmas || []).map(opt => parseInt(opt.value)),
                    orcamento: parseFloat(document.getElementById('novo-orcamento')?.value) || null,
                    status: 'planejamento',
                    observacoes: document.getElementById('novo-observacoes')?.value,
                    visivelPublico: true
                };

                projetos.push(novoProjeto);
                mostrarMensagem('Projeto criado com sucesso!', 'success');
            }

            salvarDados();
            fecharModal();
        }

        function entregarProjeto(projetoId) {
            const titulo = document.getElementById('entrega-titulo')?.value;
            const descricao = document.getElementById('entrega-descricao')?.value;

            if (!titulo || !descricao) {
                mostrarMensagem('Preencha título e descrição', 'error');
                return;
            }

            mostrarMensagem('Atividade entregue com sucesso!', 'success');
            fecharModal();
        }

        function mostrarAbaProjetos(aba) {
            document.querySelectorAll('.projetos-lista').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            
            document.getElementById(`projetos-${aba}`)?.classList.add('active');
            event.target.classList.add('active');
        }

        function salvarDados() {
            if (!MOCK_DATA.projetos) MOCK_DATA.projetos = [];
            MOCK_DATA.projetos = projetos;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarProjetos,
            getFormProjeto,
            getFormAcompanhamento,
            getFormEntregaProjeto,
            getDetalhesProjeto,
            salvarProjeto,
            entregarProjeto
        };
    })();

    window.MODULO_PROJETOS = MODULO_PROJETOS;
    console.log('✅ Módulo de Projetos Escolares carregado');
}
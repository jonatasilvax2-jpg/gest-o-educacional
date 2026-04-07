// modulos/diretor.js - Módulo do Diretor
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_DIRETOR === 'undefined') {
    const MODULO_DIRETOR = (function() {
        'use strict';

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarMinhaEscola(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const escola = MOCK_DATA.escolas.find(e => e.id === usuario.escolaId) || MOCK_DATA.escolas[0];
            
            const professores = MOCK_DATA.professores.filter(p => p.escolaId === escola.id);
            const alunos = MOCK_DATA.alunos.filter(a => a.escolaId === escola.id);
            const turmas = MOCK_DATA.turmas.filter(t => t.escolaId === escola.id);

            return `
                <div class="escola-content">
                    <div class="content-header">
                        <h1><i class="fas fa-school"></i> Minha Escola</h1>
                    </div>
                    
                    <div class="escola-card">
                        <div class="escola-header">
                            <h3>${escola.nome}</h3>
                            <span class="status-badge ${escola.status}">${escola.status}</span>
                        </div>
                        <div class="escola-body">
                            <p><i class="fas fa-map-marker-alt"></i> ${escola.endereco}, ${escola.bairro}</p>
                            <p><i class="fas fa-phone"></i> ${escola.telefone}</p>
                            <p><i class="fas fa-envelope"></i> ${escola.email}</p>
                            
                            <div class="escola-stats-large">
                                <div class="stat-large" onclick="navegarPara('professores', 'listar')">
                                    <i class="fas fa-chalkboard-teacher"></i>
                                    <span class="stat-number">${professores.length}</span>
                                    <span class="stat-label">Professores</span>
                                </div>
                                <div class="stat-large" onclick="navegarPara('alunos', 'listar')">
                                    <i class="fas fa-graduation-cap"></i>
                                    <span class="stat-number">${alunos.length}</span>
                                    <span class="stat-label">Alunos</span>
                                </div>
                                <div class="stat-large" onclick="navegarPara('turmas', 'listar')">
                                    <i class="fas fa-users"></i>
                                    <span class="stat-number">${turmas.length}</span>
                                    <span class="stat-label">Turmas</span>
                                </div>
                                <div class="stat-large">
                                    <i class="fas fa-chart-line"></i>
                                    <span class="stat-number">8.2</span>
                                    <span class="stat-label">Média Geral</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-grid">
                        <div class="info-card">
                            <h3><i class="fas fa-chart-pie"></i> Desempenho por Turma</h3>
                            ${turmas.map(turma => {
                                const mediaTurma = calcularMediaTurma(turma.id);
                                return `
                                    <div class="desempenho-item">
                                        <span class="turma-nome">${turma.nome}</span>
                                        <div class="progress-bar-container">
                                            <div class="progress-bar" style="width: ${(mediaTurma/10)*100}%"></div>
                                        </div>
                                        <span class="turma-media ${mediaTurma >= 7 ? 'text-success' : mediaTurma >= 5 ? 'text-warning' : 'text-danger'}">
                                            ${mediaTurma}
                                        </span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        
                        <div class="info-card">
                            <h3><i class="fas fa-calendar-alt"></i> Próximos Eventos</h3>
                            ${MOCK_DATA.eventos ? MOCK_DATA.eventos.slice(0, 5).map(e => `
                                <div class="evento-mini">
                                    <span class="evento-data">${new Date(e.data).toLocaleDateString('pt-BR')}</span>
                                    <span class="evento-titulo">${e.titulo}</span>
                                </div>
                            `).join('') : '<p>Nenhum evento agendado</p>'}
                        </div>
                        
                        <div class="info-card">
                            <h3><i class="fas fa-exclamation-triangle"></i> Alertas</h3>
                            <div class="alertas-lista">
                                <div class="alerta-item warning">
                                    <i class="fas fa-exclamation-circle"></i>
                                    <span>5 alunos com baixa frequência</span>
                                </div>
                                <div class="alerta-item info">
                                    <i class="fas fa-info-circle"></i>
                                    <span>3 professores pendentes</span>
                                </div>
                                <div class="alerta-item danger">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    <span>2 turmas com média baixa</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderizarOcorrencias(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const escola = MOCK_DATA.escolas.find(e => e.id === usuario.escolaId);
            const alunos = MOCK_DATA.alunos.filter(a => a.escolaId === escola.id);
            const ocorrencias = MOCK_DATA.ocorrencias.filter(o => 
                alunos.some(a => a.id === o.alunoId)
            );

            return `
                <div class="ocorrencias-content">
                    <div class="content-header">
                        <h1><i class="fas fa-exclamation-triangle"></i> Ocorrências Disciplinares</h1>
                        <button class="btn btn-success" onclick="abrirModal('Nova Ocorrência', getFormOcorrencia())">
                            <i class="fas fa-plus"></i> Nova Ocorrência
                        </button>
                    </div>
                    
                    <div class="filtros">
                        <select class="form-control" id="filtro-status" onchange="filtrarOcorrencias()">
                            <option value="">Todos os status</option>
                            <option value="pendente">Pendente</option>
                            <option value="em_andamento">Em Andamento</option>
                            <option value="resolvido">Resolvido</option>
                        </select>
                        <select class="form-control" id="filtro-tipo" onchange="filtrarOcorrencias()">
                            <option value="">Todos os tipos</option>
                            <option value="indisciplina">Indisciplina</option>
                            <option value="atraso">Atraso</option>
                            <option value="material">Material</option>
                            <option value="outros">Outros</option>
                        </select>
                    </div>
                    
                    <div class="ocorrencias-lista">
                        ${ocorrencias.map(ocorrencia => {
                            const aluno = MOCK_DATA.alunos.find(a => a.id === ocorrencia.alunoId);
                            return `
                                <div class="ocorrencia-card ${ocorrencia.status}">
                                    <div class="ocorrencia-header">
                                        <h3>${aluno ? aluno.nome : 'Aluno não encontrado'}</h3>
                                        <span class="status-badge ${ocorrencia.status}">${ocorrencia.status}</span>
                                    </div>
                                    <div class="ocorrencia-body">
                                        <p><strong>Tipo:</strong> ${ocorrencia.tipo}</p>
                                        <p><strong>Data:</strong> ${new Date(ocorrencia.data).toLocaleDateString('pt-BR')} às ${ocorrencia.hora}</p>
                                        <p><strong>Descrição:</strong> ${ocorrencia.descricao}</p>
                                        <p><strong>Medidas:</strong> ${ocorrencia.medidas}</p>
                                        ${ocorrencia.dataResolucao ? `<p><strong>Resolução:</strong> ${new Date(ocorrencia.dataResolucao).toLocaleDateString('pt-BR')}</p>` : ''}
                                    </div>
                                    <div class="ocorrencia-footer">
                                        <button class="btn btn-sm btn-primary" onclick="abrirModal('Detalhes', getDetalhesOcorrencia(${ocorrencia.id}))">
                                            <i class="fas fa-eye"></i> Detalhes
                                        </button>
                                        <button class="btn btn-sm btn-secondary" onclick="abrirModal('Editar', getFormOcorrencia(${ocorrencia.id}))">
                                            <i class="fas fa-edit"></i> Editar
                                        </button>
                                        ${ocorrencia.status !== 'resolvido' ? `
                                            <button class="btn btn-sm btn-success" onclick="resolverOcorrencia(${ocorrencia.id})">
                                                <i class="fas fa-check"></i> Resolver
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        function renderizarReunioes(secao) {
            const reunioes = MOCK_DATA.reunioes || [];

            return `
                <div class="reunioes-content">
                    <div class="content-header">
                        <h1><i class="fas fa-calendar-alt"></i> Reuniões e Atas</h1>
                        <button class="btn btn-success" onclick="abrirModal('Nova Reunião', getFormReuniao())">
                            <i class="fas fa-plus"></i> Nova Reunião
                        </button>
                    </div>
                    
                    <div class="reunioes-lista">
                        ${reunioes.map(reuniao => `
                            <div class="reuniao-card">
                                <div class="reuniao-header">
                                    <h3>${reuniao.titulo}</h3>
                                    <span class="status-badge ${reuniao.status}">${reuniao.status}</span>
                                </div>
                                <div class="reuniao-body">
                                    <p><i class="fas fa-calendar"></i> ${new Date(reuniao.data).toLocaleDateString('pt-BR')} às ${reuniao.horario}</p>
                                    <p><i class="fas fa-clock"></i> Duração: ${reuniao.duracao}</p>
                                    <p><i class="fas fa-map-marker-alt"></i> ${reuniao.local}</p>
                                    <p><i class="fas fa-users"></i> Participantes: ${reuniao.participantesNomes ? reuniao.participantesNomes.join(', ') : reuniao.participantes.length}</p>
                                    
                                    <h4>Pauta:</h4>
                                    <ul>
                                        ${reuniao.pauta.map(item => `<li>${item}</li>`).join('')}
                                    </ul>
                                    
                                    ${reuniao.ata ? `
                                        <div class="ata">
                                            <h4>Ata da Reunião:</h4>
                                            <p>${reuniao.ata}</p>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="reuniao-footer">
                                    <button class="btn btn-sm btn-primary" onclick="abrirModal('${reuniao.titulo}', getDetalhesReuniao(${reuniao.id}))">
                                        <i class="fas fa-eye"></i> Detalhes
                                    </button>
                                    <button class="btn btn-sm btn-secondary" onclick="abrirModal('Editar', getFormReuniao(${reuniao.id}))">
                                        <i class="fas fa-edit"></i> Editar
                                    </button>
                                    ${!reuniao.ata ? `
                                        <button class="btn btn-sm btn-success" onclick="abrirModal('Registrar Ata', getFormAta(${reuniao.id}))">
                                            <i class="fas fa-file-alt"></i> Registrar Ata
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function renderizarProjetos(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const escola = MOCK_DATA.escolas.find(e => e.id === usuario.escolaId);
            const projetos = MOCK_DATA.projetos || [];

            return `
                <div class="projetos-content">
                    <div class="content-header">
                        <h1><i class="fas fa-project-diagram"></i> Projetos Escolares</h1>
                        <button class="btn btn-success" onclick="abrirModal('Novo Projeto', getFormProjeto())">
                            <i class="fas fa-plus"></i> Novo Projeto
                        </button>
                    </div>
                    
                    <div class="projetos-grid">
                        ${projetos.map(projeto => `
                            <div class="projeto-card">
                                <div class="projeto-header">
                                    <h3>${projeto.titulo}</h3>
                                    <span class="status-badge ${projeto.status}">${projeto.status}</span>
                                </div>
                                <div class="projeto-body">
                                    <p>${projeto.descricao}</p>
                                    <p><i class="fas fa-calendar"></i> ${new Date(projeto.dataInicio).toLocaleDateString('pt-BR')} - ${new Date(projeto.dataFim).toLocaleDateString('pt-BR')}</p>
                                    <p><i class="fas fa-user-tie"></i> Responsável: ${projeto.responsavel}</p>
                                    <p><i class="fas fa-users"></i> Turmas: ${projeto.turmas.map(t => t).join(', ')}</p>
                                    
                                    <h4>Objetivos:</h4>
                                    <ul>
                                        ${projeto.objetivos.map(obj => `<li>${obj}</li>`).join('')}
                                    </ul>
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
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function calcularMediaTurma(turmaId) {
            const alunos = MOCK_DATA.alunos.filter(a => a.turmaId === turmaId);
            if (alunos.length === 0) return '0.0';
            
            const soma = alunos.reduce((acc, aluno) => acc + aluno.mediaGeral, 0);
            return (soma / alunos.length).toFixed(1);
        }

        function getFormOcorrencia(id = null) {
            if (id) {
                const ocorrencia = MOCK_DATA.ocorrencias.find(o => o.id === id);
                if (!ocorrencia) return '<p>Ocorrência não encontrada</p>';

                return `
                    <form id="form-ocorrencia">
                        <div class="form-group">
                            <label>Aluno</label>
                            <select class="form-control">
                                ${MOCK_DATA.alunos.map(a => `
                                    <option value="${a.id}" ${a.id === ocorrencia.alunoId ? 'selected' : ''}>${a.nome}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Tipo</label>
                            <select class="form-control">
                                <option value="indisciplina" ${ocorrencia.tipo === 'indisciplina' ? 'selected' : ''}>Indisciplina</option>
                                <option value="atraso" ${ocorrencia.tipo === 'atraso' ? 'selected' : ''}>Atraso</option>
                                <option value="material" ${ocorrencia.tipo === 'material' ? 'selected' : ''}>Material</option>
                                <option value="outros" ${ocorrencia.tipo === 'outros' ? 'selected' : ''}>Outros</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Descrição</label>
                            <textarea class="form-control" rows="4">${ocorrencia.descricao}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Medidas Adotadas</label>
                            <textarea class="form-control" rows="3">${ocorrencia.medidas}</textarea>
                        </div>
                    </form>
                `;
            }

            return `
                <form id="form-ocorrencia">
                    <div class="form-group">
                        <label>Aluno *</label>
                        <select class="form-control" required>
                            <option value="">Selecione...</option>
                            ${MOCK_DATA.alunos.map(a => `<option value="${a.id}">${a.nome}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tipo *</label>
                        <select class="form-control" required>
                            <option value="">Selecione...</option>
                            <option value="indisciplina">Indisciplina</option>
                            <option value="atraso">Atraso</option>
                            <option value="material">Material</option>
                            <option value="outros">Outros</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Descrição *</label>
                        <textarea class="form-control" rows="4" placeholder="Descreva a ocorrência..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Medidas Adotadas</label>
                        <textarea class="form-control" rows="3" placeholder="Medidas tomadas..."></textarea>
                    </div>
                </form>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarMinhaEscola,
            renderizarOcorrencias,
            renderizarReunioes,
            renderizarProjetos,
            getFormOcorrencia,
            getFormReuniao: () => `<p>Formulário de reunião em desenvolvimento</p>`,
            getFormProjeto: () => `<p>Formulário de projeto em desenvolvimento</p>`,
            getDetalhesOcorrencia: (id) => `<p>Detalhes da ocorrência ${id}</p>`,
            getDetalhesReuniao: (id) => `<p>Detalhes da reunião ${id}</p>`,
            getDetalhesProjeto: (id) => `<p>Detalhes do projeto ${id}</p>`
        };
    })();

    window.MODULO_DIRETOR = MODULO_DIRETOR;
    console.log('✅ Módulo do Diretor carregado');
}
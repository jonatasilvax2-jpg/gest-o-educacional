// modulos/atividades.js - Módulo de Atividades e Tarefas
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_ATIVIDADES === 'undefined') {
    const MODULO_ATIVIDADES = (function() {
        'use strict';

        // ==================== DADOS LOCAIS ====================
        let atividades = MOCK_DATA.atividades || [];
        let entregas = MOCK_DATA.entregas || [];

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarAtividades(secao) {
            const usuario = SISTEMA.getEstado().usuario;

            if (usuario.perfil === 'professor') {
                return renderizarAtividadesProfessor();
            } else if (usuario.perfil === 'aluno') {
                return renderizarAtividadesAluno();
            } else {
                return renderizarAtividadesSecretaria();
            }
        }

        function renderizarAtividadesProfessor() {
            const usuario = SISTEMA.getEstado().usuario;
            const professor = MOCK_DATA.professores.find(p => p.email === usuario.email);
            
            if (!professor) return '<div class="error-message">Professor não encontrado</div>';

            const minhasAtividades = atividades.filter(a => a.professorId === professor.id);

            return `
                <div class="atividades-content">
                    <div class="content-header">
                        <h1><i class="fas fa-tasks"></i> Gerenciar Atividades</h1>
                        <button class="btn btn-success" onclick="abrirModal('Nova Atividade', getFormAtividade())">
                            <i class="fas fa-plus"></i> Nova Atividade
                        </button>
                    </div>
                    
                    <div class="atividades-tabs">
                        <button class="tab-btn active" onclick="filtrarAtividadesProfessor('ativas')">
                            <i class="fas fa-clock"></i> Ativas
                        </button>
                        <button class="tab-btn" onclick="filtrarAtividadesProfessor('entregues')">
                            <i class="fas fa-check-circle"></i> Entregues
                        </button>
                        <button class="tab-btn" onclick="filtrarAtividadesProfessor('avaliadas')">
                            <i class="fas fa-star"></i> Avaliadas
                        </button>
                    </div>
                    
                    <div id="atividades-ativas" class="atividades-lista active">
                        ${minhasAtividades.filter(a => new Date(a.dataEntrega) > new Date()).map(atividade => {
                            const turma = MOCK_DATA.turmas.find(t => t.id === atividade.turmaId);
                            return `
                                <div class="atividade-card">
                                    <div class="atividade-header">
                                        <h3>${atividade.titulo}</h3>
                                        <span class="badge badge-info">${turma ? turma.nome : 'Turma'}</span>
                                    </div>
                                    <div class="atividade-body">
                                        <p>${atividade.descricao}</p>
                                        <p><i class="fas fa-calendar"></i> Entrega: ${new Date(atividade.dataEntrega).toLocaleDateString('pt-BR')}</p>
                                        <p><i class="fas fa-star"></i> Valor: ${atividade.valor} pontos</p>
                                        <p><i class="fas fa-users"></i> Entregues: ${atividade.entregues}/${atividade.totalAlunos}</p>
                                    </div>
                                    <div class="atividade-footer">
                                        <button class="btn btn-sm btn-primary" onclick="abrirModal('${atividade.titulo}', getDetalhesAtividade(${atividade.id}))">
                                            <i class="fas fa-eye"></i> Ver
                                        </button>
                                        <button class="btn btn-sm btn-success" onclick="abrirModal('Corrigir', getFormCorrecao(${atividade.id}))">
                                            <i class="fas fa-check-double"></i> Corrigir
                                        </button>
                                        <button class="btn btn-sm btn-warning" onclick="abrirModal('Editar', getFormAtividade(${atividade.id}))">
                                            <i class="fas fa-edit"></i> Editar
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                        
                        ${minhasAtividades.filter(a => new Date(a.dataEntrega) > new Date()).length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Nenhuma atividade ativa no momento</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div id="atividades-entregues" class="atividades-lista">
                        ${minhasAtividades.filter(a => new Date(a.dataEntrega) <= new Date() && a.entregues > 0).map(atividade => {
                            return `
                                <div class="atividade-card">
                                    <h3>${atividade.titulo}</h3>
                                    <p>${atividade.entregues} entregas • Aguardando correção</p>
                                    <button class="btn btn-sm btn-primary" onclick="abrirModal('Corrigir', getFormCorrecao(${atividade.id}))">
                                        Corrigir
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div id="atividades-avaliadas" class="atividades-lista">
                        ${minhasAtividades.filter(a => a.entregues === a.totalAlunos).map(atividade => {
                            return `
                                <div class="atividade-card">
                                    <h3>${atividade.titulo}</h3>
                                    <p>Todas as atividades corrigidas</p>
                                    <span class="badge badge-success">Concluída</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        function renderizarAtividadesAluno() {
            const usuario = SISTEMA.getEstado().usuario;
            const aluno = MOCK_DATA.alunos.find(a => a.email === usuario.email);
            
            if (!aluno) return '<div class="error-message">Aluno não encontrado</div>';

            const atividadesTurma = atividades.filter(a => a.turmaId === aluno.turmaId);
            const minhasEntregas = entregas.filter(e => e.alunoId === aluno.id);

            return `
                <div class="atividades-content">
                    <div class="content-header">
                        <h1><i class="fas fa-tasks"></i> Minhas Atividades</h1>
                    </div>
                    
                    <div class="atividades-tabs">
                        <button class="tab-btn active" onclick="filtrarAtividadesAluno('pendentes')">
                            <i class="fas fa-clock"></i> Pendentes
                        </button>
                        <button class="tab-btn" onclick="filtrarAtividadesAluno('entregues')">
                            <i class="fas fa-check-circle"></i> Entregues
                        </button>
                        <button class="tab-btn" onclick="filtrarAtividadesAluno('avaliadas')">
                            <i class="fas fa-star"></i> Avaliadas
                        </button>
                    </div>
                    
                    <div id="atividades-pendentes" class="atividades-lista active">
                        ${atividadesTurma.filter(a => {
                            const entregue = minhasEntregas.some(e => e.atividadeId === a.id);
                            return !entregue && new Date(a.dataEntrega) > new Date();
                        }).map(atividade => {
                            const diasRestantes = Math.ceil((new Date(atividade.dataEntrega) - new Date()) / (1000 * 60 * 60 * 24));
                            return `
                                <div class="atividade-card">
                                    <div class="atividade-header">
                                        <h3>${atividade.titulo}</h3>
                                        <span class="badge ${diasRestantes <= 2 ? 'badge-warning' : 'badge-info'}">
                                            ${diasRestantes} dias
                                        </span>
                                    </div>
                                    <div class="atividade-body">
                                        <p>${atividade.descricao}</p>
                                        <p><i class="fas fa-calendar"></i> Entrega: ${new Date(atividade.dataEntrega).toLocaleDateString('pt-BR')}</p>
                                        <p><i class="fas fa-star"></i> Valor: ${atividade.valor} pontos</p>
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
                        
                        ${atividadesTurma.filter(a => {
                            const entregue = minhasEntregas.some(e => e.atividadeId === a.id);
                            return !entregue && new Date(a.dataEntrega) > new Date();
                        }).length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-check-circle text-success"></i>
                                <p>Nenhuma atividade pendente! Parabéns!</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div id="atividades-entregues" class="atividades-lista">
                        ${minhasEntregas.filter(e => !e.nota).map(entrega => {
                            const atividade = atividades.find(a => a.id === entrega.atividadeId);
                            return `
                                <div class="atividade-card">
                                    <h3>${atividade?.titulo}</h3>
                                    <p>Entregue em ${new Date(entrega.dataEntrega).toLocaleDateString('pt-BR')}</p>
                                    <span class="badge badge-warning">Aguardando correção</span>
                                </div>
                            `;
                        }).join('')}
                        
                        ${minhasEntregas.filter(e => !e.nota).length === 0 ? `
                            <div class="no-data">
                                <p>Nenhuma atividade aguardando correção</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div id="atividades-avaliadas" class="atividades-lista">
                        ${minhasEntregas.filter(e => e.nota).map(entrega => {
                            const atividade = atividades.find(a => a.id === entrega.atividadeId);
                            return `
                                <div class="atividade-card">
                                    <h3>${atividade?.titulo}</h3>
                                    <p>Nota: <strong class="${entrega.nota >= 7 ? 'text-success' : 'text-warning'}">${entrega.nota}</strong></p>
                                    ${entrega.comentario ? `<p><i class="fas fa-comment"></i> ${entrega.comentario}</p>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        function renderizarAtividadesSecretaria() {
            return `
                <div class="atividades-content">
                    <div class="content-header">
                        <h1><i class="fas fa-tasks"></i> Visão Geral de Atividades</h1>
                    </div>
                    
                    <div class="dashboard-stats">
                        <div class="stat-card">
                            <div class="stat-icon bg-primary">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Atividades Ativas</h3>
                                <p class="stat-number">${atividades.filter(a => new Date(a.dataEntrega) > new Date()).length}</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon bg-success">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Entregues</h3>
                                <p class="stat-number">${entregas.length}</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon bg-warning">
                                <i class="fas fa-star"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Média Geral</h3>
                                <p class="stat-number">8.2</p>
                            </div>
                        </div>
                    </div>
                    
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Atividade</th>
                                <th>Turma</th>
                                <th>Professor</th>
                                <th>Data Entrega</th>
                                <th>Entregas</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${atividades.map(a => {
                                const turma = MOCK_DATA.turmas.find(t => t.id === a.turmaId);
                                const professor = MOCK_DATA.professores.find(p => p.id === a.professorId);
                                return `
                                    <tr>
                                        <td>${a.titulo}</td>
                                        <td>${turma ? turma.nome : '-'}</td>
                                        <td>${professor ? professor.nome : '-'}</td>
                                        <td>${new Date(a.dataEntrega).toLocaleDateString('pt-BR')}</td>
                                        <td>${a.entregues}/${a.totalAlunos}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // ==================== FUNÇÕES DE FORMULÁRIO ====================
        function getFormAtividade(id = null) {
            if (id) {
                const atividade = atividades.find(a => a.id === id);
                if (!atividade) return '<p>Atividade não encontrada</p>';

                return `
                    <form id="form-atividade">
                        <div class="form-group">
                            <label>Título</label>
                            <input type="text" class="form-control" value="${atividade.titulo}">
                        </div>
                        <div class="form-group">
                            <label>Descrição</label>
                            <textarea class="form-control" rows="4">${atividade.descricao}</textarea>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Data de Entrega</label>
                                    <input type="date" class="form-control" value="${atividade.dataEntrega}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Valor (pontos)</label>
                                    <input type="number" class="form-control" value="${atividade.valor}">
                                </div>
                            </div>
                        </div>
                    </form>
                `;
            }

            const usuario = SISTEMA.getEstado().usuario;
            const professor = MOCK_DATA.professores.find(p => p.email === usuario.email);
            const turmas = MOCK_DATA.turmas.filter(t => t.professorId === professor?.id);

            return `
                <form id="form-atividade">
                    <div class="form-group">
                        <label>Turma *</label>
                        <select class="form-control" id="atividade-turma" required>
                            <option value="">Selecione...</option>
                            ${turmas.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Título *</label>
                        <input type="text" class="form-control" id="atividade-titulo" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Descrição *</label>
                        <textarea class="form-control" id="atividade-descricao" rows="4" required></textarea>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Data de Entrega *</label>
                                <input type="date" class="form-control" id="atividade-data" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Valor (pontos) *</label>
                                <input type="number" class="form-control" id="atividade-valor" min="0" max="10" step="0.5" required>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Anexos</label>
                        <input type="file" class="form-control" id="atividade-anexos" multiple>
                    </div>
                </form>
            `;
        }

        function getFormEntrega(atividadeId) {
            return `
                <form id="form-entrega" onsubmit="event.preventDefault(); realizarEntrega(${atividadeId})">
                    <div class="form-group">
                        <label>Arquivo</label>
                        <input type="file" class="form-control" id="entrega-arquivo" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Comentários</label>
                        <textarea class="form-control" id="entrega-comentario" rows="4" placeholder="Observações sobre a entrega..."></textarea>
                    </div>
                </form>
            `;
        }

        function getFormCorrecao(atividadeId) {
            const atividade = atividades.find(a => a.id === atividadeId);
            const entregasAtividade = entregas.filter(e => e.atividadeId === atividadeId && !e.nota);

            return `
                <div class="correcao-container">
                    <h3>${atividade?.titulo}</h3>
                    <p>${entregasAtividade.length} entregas para corrigir</p>
                    
                    ${entregasAtividade.map(entrega => {
                        const aluno = MOCK_DATA.alunos.find(a => a.id === entrega.alunoId);
                        return `
                            <div class="entrega-item">
                                <h4>${aluno ? aluno.nome : 'Aluno'}</h4>
                                <p><i class="fas fa-calendar"></i> Entregue em: ${new Date(entrega.dataEntrega).toLocaleDateString('pt-BR')}</p>
                                ${entrega.comentario ? `<p><i class="fas fa-comment"></i> ${entrega.comentario}</p>` : ''}
                                
                                <div class="form-group">
                                    <label>Nota</label>
                                    <input type="number" class="form-control" id="nota-${entrega.id}" min="0" max="10" step="0.5">
                                </div>
                                <div class="form-group">
                                    <label>Feedback</label>
                                    <textarea class="form-control" id="feedback-${entrega.id}" rows="2"></textarea>
                                </div>
                                <button class="btn btn-sm btn-success" onclick="salvarCorrecao(${entrega.id})">Salvar</button>
                                <hr>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        function getDetalhesAtividade(id) {
            const atividade = atividades.find(a => a.id === id);
            if (!atividade) return '<p>Atividade não encontrada</p>';

            const turma = MOCK_DATA.turmas.find(t => t.id === atividade.turmaId);
            const professor = MOCK_DATA.professores.find(p => p.id === atividade.professorId);

            return `
                <div class="detalhes-atividade">
                    <h3>${atividade.titulo}</h3>
                    <p><strong>Turma:</strong> ${turma ? turma.nome : '-'}</p>
                    <p><strong>Professor:</strong> ${professor ? professor.nome : '-'}</p>
                    <p><strong>Data de Entrega:</strong> ${new Date(atividade.dataEntrega).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Valor:</strong> ${atividade.valor} pontos</p>
                    
                    <div class="descricao">
                        <h4>Descrição:</h4>
                        <p>${atividade.descricao}</p>
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES DE AÇÃO ====================
        function salvarNovaAtividade() {
            const turmaId = document.getElementById('atividade-turma')?.value;
            const titulo = document.getElementById('atividade-titulo')?.value;
            const descricao = document.getElementById('atividade-descricao')?.value;
            const data = document.getElementById('atividade-data')?.value;
            const valor = document.getElementById('atividade-valor')?.value;

            if (!turmaId || !titulo || !descricao || !data || !valor) {
                mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
                return;
            }

            const usuario = SISTEMA.getEstado().usuario;
            const professor = MOCK_DATA.professores.find(p => p.email === usuario.email);
            const turma = MOCK_DATA.turmas.find(t => t.id === parseInt(turmaId));

            const novaAtividade = {
                id: Date.now(),
                turmaId: parseInt(turmaId),
                titulo: titulo,
                descricao: descricao,
                dataPublicacao: new Date().toISOString().split('T')[0],
                dataEntrega: data,
                tipo: 'tarefa',
                professorId: professor?.id,
                valor: parseFloat(valor),
                entregues: 0,
                totalAlunos: turma?.totalAlunos || 0
            };

            atividades.push(novaAtividade);
            salvarDados();
            fecharModal();
            mostrarMensagem('Atividade criada com sucesso!', 'success');
        }

        function realizarEntrega(atividadeId) {
            const arquivo = document.getElementById('entrega-arquivo')?.files[0];
            const comentario = document.getElementById('entrega-comentario')?.value;

            if (!arquivo) {
                mostrarMensagem('Selecione um arquivo', 'error');
                return;
            }

            const usuario = SISTEMA.getEstado().usuario;
            const aluno = MOCK_DATA.alunos.find(a => a.email === usuario.email);

            const novaEntrega = {
                id: Date.now(),
                atividadeId: atividadeId,
                alunoId: aluno?.id,
                dataEntrega: new Date().toISOString().split('T')[0],
                arquivo: arquivo.name,
                comentario: comentario,
                nota: null,
                status: 'entregue'
            };

            entregas.push(novaEntrega);
            
            // Atualizar contador de entregas
            const atividade = atividades.find(a => a.id === atividadeId);
            if (atividade) {
                atividade.entregues = (atividade.entregues || 0) + 1;
            }

            salvarDados();
            fecharModal();
            mostrarMensagem('Atividade entregue com sucesso!', 'success');
        }

        function salvarCorrecao(entregaId) {
            const nota = document.getElementById(`nota-${entregaId}`)?.value;
            const feedback = document.getElementById(`feedback-${entregaId}`)?.value;

            if (!nota) {
                mostrarMensagem('Digite uma nota', 'error');
                return;
            }

            const entrega = entregas.find(e => e.id === entregaId);
            if (entrega) {
                entrega.nota = parseFloat(nota);
                entrega.comentario = feedback || '';
                entrega.status = 'avaliado';
            }

            salvarDados();
            mostrarMensagem('Correção salva!', 'success');
        }

        function filtrarAtividadesProfessor(tipo) {
            document.querySelectorAll('.atividades-lista').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            
            document.getElementById(`atividades-${tipo}`)?.classList.add('active');
            event.target.classList.add('active');
        }

        function filtrarAtividadesAluno(tipo) {
            document.querySelectorAll('.atividades-lista').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            
            document.getElementById(`atividades-${tipo}`)?.classList.add('active');
            event.target.classList.add('active');
        }

        function salvarDados() {
            if (!MOCK_DATA.atividades) MOCK_DATA.atividades = [];
            if (!MOCK_DATA.entregas) MOCK_DATA.entregas = [];
            
            MOCK_DATA.atividades = atividades;
            MOCK_DATA.entregas = entregas;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarAtividades,
            getFormAtividade,
            getFormEntrega,
            getFormCorrecao,
            getDetalhesAtividade,
            salvarNovaAtividade,
            realizarEntrega,
            salvarCorrecao
        };
    })();

    window.MODULO_ATIVIDADES = MODULO_ATIVIDADES;
    console.log('✅ Módulo de Atividades carregado');
}
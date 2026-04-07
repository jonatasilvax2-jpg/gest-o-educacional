// modulos/monitoria.js - Módulo de Monitoria
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_MONITORIA === 'undefined') {
    const MODULO_MONITORIA = (function() {
        'use strict';

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarMonitorias(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const monitorias = MOCK_DATA.monitoria || [];

            return `
                <div class="monitoria-content">
                    <div class="content-header">
                        <h1><i class="fas fa-user-graduate"></i> Monitoria</h1>
                        ${usuario.perfil === 'professor' ? `
                            <button class="btn btn-success" onclick="abrirModal('Nova Monitoria', getFormMonitoria())">
                                <i class="fas fa-plus"></i> Nova Monitoria
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="monitorias-grid">
                        ${monitorias.map(monitoria => {
                            const monitor = MOCK_DATA.alunos.find(a => a.id === monitoria.monitorId);
                            return `
                                <div class="monitoria-card">
                                    <div class="monitoria-header">
                                        <h3>Monitoria de ${monitoria.disciplina}</h3>
                                        <span class="status-badge ativo">Ativa</span>
                                    </div>
                                    <div class="monitoria-body">
                                        <p><i class="fas fa-user"></i> Monitor: ${monitor ? monitor.nome : 'Aluno'}</p>
                                        <p><i class="fas fa-users"></i> Turmas: ${monitoria.turmas.map(t => t).join(', ')}</p>
                                        <p><i class="fas fa-clock"></i> Horários:</p>
                                        <ul>
                                            ${monitoria.horarios.map(h => `<li>${h}</li>`).join('')}
                                        </ul>
                                        <p><i class="fas fa-users"></i> Alunos Atendidos: ${monitoria.alunosAtendidos.length}</p>
                                    </div>
                                    <div class="monitoria-footer">
                                        <button class="btn btn-sm btn-primary" onclick="abrirModal('Detalhes', getDetalhesMonitoria(${monitoria.id}))">
                                            <i class="fas fa-eye"></i> Ver
                                        </button>
                                        ${usuario.perfil === 'aluno' ? `
                                            <button class="btn btn-sm btn-success" onclick="abrirModal('Solicitar Monitoria', getFormSolicitacaoMonitoria(${monitoria.id}))">
                                                <i class="fas fa-hand-holding"></i> Solicitar
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                        
                        ${monitorias.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Nenhuma monitoria disponível no momento.</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        function renderizarMinhasMonitorias(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            
            if (usuario.perfil === 'professor') {
                return renderizarMonitoriasProfessor();
            } else if (usuario.perfil === 'aluno') {
                return renderizarMonitoriasAluno();
            }

            return '<div>Seção não disponível</div>';
        }

        function renderizarMonitoriasProfessor() {
            const monitorias = MOCK_DATA.monitoria || [];

            return `
                <div class="monitorias-professor-content">
                    <div class="content-header">
                        <h1><i class="fas fa-chalkboard-teacher"></i> Monitorias sob minha responsabilidade</h1>
                    </div>
                    
                    <div class="monitorias-lista">
                        ${monitorias.map(monitoria => {
                            const monitor = MOCK_DATA.alunos.find(a => a.id === monitoria.monitorId);
                            return `
                                <div class="monitoria-prof-card">
                                    <h3>Monitoria de ${monitoria.disciplina}</h3>
                                    <p><strong>Monitor:</strong> ${monitor ? monitor.nome : 'Aluno'}</p>
                                    <p><strong>Alunos Atendidos:</strong> ${monitoria.alunosAtendidos.length}</p>
                                    <p><strong>Horários:</strong> ${monitoria.horarios.join('; ')}</p>
                                    
                                    <h4 style="margin-top: 15px;">Alunos Atendidos</h4>
                                    <ul>
                                        ${monitoria.alunosAtendidos.map(alunoId => {
                                            const aluno = MOCK_DATA.alunos.find(a => a.id === alunoId);
                                            return `<li>${aluno ? aluno.nome : 'Aluno'}</li>`;
                                        }).join('')}
                                    </ul>
                                    
                                    <div class="acoes" style="margin-top: 15px;">
                                        <button class="btn btn-sm btn-primary" onclick="abrirModal('Editar', getFormMonitoria(${monitoria.id}))">
                                            <i class="fas fa-edit"></i> Editar
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="encerrarMonitoria(${monitoria.id})">
                                            <i class="fas fa-times"></i> Encerrar
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        function renderizarMonitoriasAluno() {
            const usuario = SISTEMA.getEstado().usuario;
            
            // Verificar se o aluno é monitor
            const monitoriaAluno = MOCK_DATA.monitoria?.find(m => m.monitorId === usuario.id);
            
            // Verificar solicitações do aluno
            const solicitacoes = monitoriaAluno ? monitoriaAluno.alunosAtendidos || [] : [];

            return `
                <div class="monitorias-aluno-content">
                    <div class="content-header">
                        <h1><i class="fas fa-user-graduate"></i> Minhas Monitorias</h1>
                    </div>
                    
                    ${monitoriaAluno ? `
                        <div class="monitoria-card destaque">
                            <h3>Você é monitor de ${monitoriaAluno.disciplina}</h3>
                            <p><strong>Horários:</strong> ${monitoriaAluno.horarios.join('; ')}</p>
                            <p><strong>Alunos atendendo:</strong> ${monitoriaAluno.alunosAtendidos.length}</p>
                            <button class="btn btn-primary" onclick="abrirModal('Registrar Atendimento', getFormRegistroAtendimento(${monitoriaAluno.id}))">
                                <i class="fas fa-clipboard-check"></i> Registrar Atendimento
                            </button>
                        </div>
                    ` : ''}
                    
                    <h2 style="margin-top: 30px;">Minhas Solicitações</h2>
                    <div class="solicitacoes-lista">
                        ${solicitacoes.length > 0 ? solicitacoes.map(alunoId => {
                            const aluno = MOCK_DATA.alunos.find(a => a.id === alunoId);
                            return `
                                <div class="solicitacao-card">
                                    <p><strong>Monitoria de ${monitoriaAluno.disciplina}</strong></p>
                                    <p>Aluno: ${aluno ? aluno.nome : 'Aluno'}</p>
                                    <p>Status: <span class="status-badge ativo">Em andamento</span></p>
                                    <button class="btn btn-sm btn-primary" onclick="abrirModal('Registrar', getFormRegistroAtendimento(${monitoriaAluno.id}, ${alunoId}))">
                                        <i class="fas fa-check"></i> Registrar Atendimento
                                    </button>
                                </div>
                            `;
                        }).join('') : `
                            <div class="no-data">
                                <p>Você não tem solicitações de monitoria.</p>
                            </div>
                        `}
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function getFormMonitoria(id = null) {
            if (id) {
                const monitoria = MOCK_DATA.monitoria?.find(m => m.id === id);
                if (!monitoria) return '<p>Monitoria não encontrada</p>';

                return `
                    <form id="form-monitoria">
                        <div class="form-group">
                            <label>Monitor</label>
                            <select class="form-control">
                                ${MOCK_DATA.alunos.map(a => `
                                    <option value="${a.id}" ${a.id === monitoria.monitorId ? 'selected' : ''}>${a.nome}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Disciplina</label>
                            <input type="text" class="form-control" value="${monitoria.disciplina}">
                        </div>
                        <div class="form-group">
                            <label>Turmas Atendidas</label>
                            <select class="form-control" multiple size="3">
                                ${MOCK_DATA.turmas.map(t => `
                                    <option value="${t.id}" ${monitoria.turmas.includes(t.id) ? 'selected' : ''}>${t.nome}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Horários</label>
                            <textarea class="form-control" rows="3">${monitoria.horarios.join('\n')}</textarea>
                            <small>Digite um horário por linha</small>
                        </div>
                    </form>
                `;
            }

            return `
                <form id="form-monitoria">
                    <div class="form-group">
                        <label>Monitor *</label>
                        <select class="form-control" required>
                            <option value="">Selecione...</option>
                            ${MOCK_DATA.alunos.map(a => `<option value="${a.id}">${a.nome}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Disciplina *</label>
                        <input type="text" class="form-control" placeholder="Ex: Matemática" required>
                    </div>
                    <div class="form-group">
                        <label>Turmas Atendidas</label>
                        <select class="form-control" multiple size="3">
                            ${MOCK_DATA.turmas.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Horários</label>
                        <textarea class="form-control" rows="3" placeholder="Ex: Segunda 14h-16h"></textarea>
                    </div>
                </form>
            `;
        }

        function getFormSolicitacaoMonitoria(monitoriaId) {
            return `
                <form id="form-solicitacao-monitoria">
                    <p><strong>Solicitar monitoria</strong></p>
                    <div class="form-group">
                        <label>Disciplina</label>
                        <input type="text" class="form-control" value="Matemática" readonly>
                    </div>
                    <div class="form-group">
                        <label>Conteúdo desejado *</label>
                        <textarea class="form-control" rows="4" placeholder="Qual conteúdo você precisa de ajuda?" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Disponibilidade</label>
                        <input type="text" class="form-control" placeholder="Ex: Segundas e Quartas 14h">
                    </div>
                </form>
            `;
        }

        function getFormRegistroAtendimento(monitoriaId, alunoId = null) {
            return `
                <form id="form-registro">
                    <div class="form-group">
                        <label>Aluno atendido</label>
                        <select class="form-control" ${alunoId ? 'disabled' : ''}>
                            ${alunoId ? 
                                `<option value="${alunoId}">Aluno selecionado</option>` :
                                MOCK_DATA.alunos.map(a => `<option value="${a.id}">${a.nome}</option>`).join('')
                            }
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Data do atendimento</label>
                        <input type="date" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label>Duração (minutos)</label>
                        <input type="number" class="form-control" value="60">
                    </div>
                    <div class="form-group">
                        <label>Conteúdo trabalhado</label>
                        <textarea class="form-control" rows="4" placeholder="O que foi estudado?" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Observações</label>
                        <textarea class="form-control" rows="3" placeholder="Observações sobre o atendimento"></textarea>
                    </div>
                </form>
            `;
        }

        function getDetalhesMonitoria(id) {
            const monitoria = MOCK_DATA.monitoria?.find(m => m.id === id);
            if (!monitoria) return '<p>Monitoria não encontrada</p>';

            const monitor = MOCK_DATA.alunos.find(a => a.id === monitoria.monitorId);

            return `
                <div class="detalhes-monitoria">
                    <h3>Monitoria de ${monitoria.disciplina}</h3>
                    <p><strong>Monitor:</strong> ${monitor ? monitor.nome : 'Aluno'}</p>
                    <p><strong>Turmas:</strong> ${monitoria.turmas.map(t => t).join(', ')}</p>
                    <p><strong>Horários:</strong></p>
                    <ul>
                        ${monitoria.horarios.map(h => `<li>${h}</li>`).join('')}
                    </ul>
                    <p><strong>Alunos atendidos:</strong> ${monitoria.alunosAtendidos.length}</p>
                </div>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarMonitorias,
            renderizarMinhasMonitorias,
            getFormMonitoria,
            getFormSolicitacaoMonitoria,
            getFormRegistroAtendimento,
            getDetalhesMonitoria
        };
    })();

    window.MODULO_MONITORIA = MODULO_MONITORIA;
    console.log('✅ Módulo de Monitoria carregado');
}
// modulos/competicoes.js - Módulo de Competições e Olimpíadas
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_COMPETICOES === 'undefined') {
    const MODULO_COMPETICOES = (function() {
        'use strict';

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarCompeticoes(secao) {
            const competicoes = MOCK_DATA.competicoes || [];

            return `
                <div class="competicoes-content">
                    <div class="content-header">
                        <h1><i class="fas fa-trophy"></i> Competições e Olimpíadas</h1>
                        ${SISTEMA.getEstado().usuario.perfil !== 'aluno' ? `
                            <button class="btn btn-success" onclick="abrirModal('Nova Competição', getFormCompeticao())">
                                <i class="fas fa-plus"></i> Nova Competição
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="competicoes-grid">
                        ${competicoes.map(comp => {
                            const dataCompeticao = new Date(comp.data);
                            const hoje = new Date();
                            const diasRestantes = Math.ceil((dataCompeticao - hoje) / (1000 * 60 * 60 * 24));
                            
                            return `
                                <div class="competicao-card">
                                    <div class="competicao-header">
                                        <h3>${comp.nome}</h3>
                                        <span class="status-badge ${comp.status}">${comp.status}</span>
                                    </div>
                                    <div class="competicao-body">
                                        <p><i class="fas fa-tag"></i> Tipo: ${comp.tipo}</p>
                                        <p><i class="fas fa-calendar"></i> Data: ${new Date(comp.data).toLocaleDateString('pt-BR')}</p>
                                        <p><i class="fas fa-map-marker-alt"></i> Local: ${comp.local}</p>
                                        
                                        <div class="inscritos-info">
                                            <p><i class="fas fa-users"></i> Alunos Inscritos: ${comp.alunosInscritos?.length || 0}</p>
                                            ${diasRestantes > 0 ? `
                                                <p class="dias-restantes">
                                                    <i class="fas fa-clock"></i> Faltam ${diasRestantes} dias
                                                </p>
                                            ` : ''}
                                        </div>
                                        
                                        ${comp.alunosNomes && comp.alunosNomes.length > 0 ? `
                                            <div class="alunos-lista">
                                                <p><strong>Alunos:</strong></p>
                                                <ul>
                                                    ${comp.alunosNomes.map(nome => `<li>${nome}</li>`).join('')}
                                                </ul>
                                            </div>
                                        ` : ''}
                                        
                                        ${comp.resultado ? `
                                            <div class="resultado-card">
                                                <p><strong>Resultado:</strong> <span class="text-success">${comp.resultado}</span></p>
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div class="competicao-footer">
                                        ${SISTEMA.getEstado().usuario.perfil === 'aluno' && comp.status === 'inscricoes_abertas' ? `
                                            <button class="btn btn-sm btn-primary" onclick="abrirModal('Inscrever-se', getFormInscricaoCompeticao(${comp.id}))">
                                                <i class="fas fa-pencil-alt"></i> Inscrever-se
                                            </button>
                                        ` : ''}
                                        
                                        ${SISTEMA.getEstado().usuario.perfil !== 'aluno' ? `
                                            <button class="btn btn-sm btn-success" onclick="abrirModal('Registrar Resultado', getFormResultadoCompeticao(${comp.id}))">
                                                <i class="fas fa-star"></i> Registrar Resultado
                                            </button>
                                            <button class="btn btn-sm btn-secondary" onclick="abrirModal('Editar', getFormCompeticao(${comp.id}))">
                                                <i class="fas fa-edit"></i> Editar
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                        
                        ${competicoes.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Nenhuma competição cadastrada.</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        function renderizarMinhasCompeticoes(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const competicoes = MOCK_DATA.competicoes?.filter(c => 
                c.alunosInscritos?.includes(usuario.id)
            ) || [];

            return `
                <div class="minhas-competicoes-content">
                    <div class="content-header">
                        <h1><i class="fas fa-trophy"></i> Minhas Competições</h1>
                    </div>
                    
                    <div class="competicoes-lista">
                        ${competicoes.map(comp => `
                            <div class="competicao-mini-card">
                                <div class="competicao-icon">
                                    <i class="fas ${comp.tipo === 'estadual' ? 'fa-flag' : comp.tipo === 'municipal' ? 'fa-city' : 'fa-globe'}"></i>
                                </div>
                                <div class="competicao-info">
                                    <h3>${comp.nome}</h3>
                                    <p>${comp.tipo} • ${new Date(comp.data).toLocaleDateString('pt-BR')}</p>
                                    ${comp.resultado ? `
                                        <p class="resultado text-success">Resultado: ${comp.resultado}</p>
                                    ` : `
                                        <p class="status-pendente">Aguardando resultado</p>
                                    `}
                                </div>
                            </div>
                        `).join('')}
                        
                        ${competicoes.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Você não está inscrito em nenhuma competição.</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function getFormCompeticao(id = null) {
            if (id) {
                const comp = MOCK_DATA.competicoes?.find(c => c.id === id);
                if (!comp) return '<p>Competição não encontrada</p>';

                return `
                    <form id="form-competicao">
                        <div class="form-group">
                            <label>Nome da Competição</label>
                            <input type="text" class="form-control" value="${comp.nome}">
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Tipo</label>
                                    <select class="form-control">
                                        <option value="municipal" ${comp.tipo === 'municipal' ? 'selected' : ''}>Municipal</option>
                                        <option value="estadual" ${comp.tipo === 'estadual' ? 'selected' : ''}>Estadual</option>
                                        <option value="nacional" ${comp.tipo === 'nacional' ? 'selected' : ''}>Nacional</option>
                                        <option value="internacional" ${comp.tipo === 'internacional' ? 'selected' : ''}>Internacional</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Data</label>
                                    <input type="date" class="form-control" value="${comp.data}">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Local</label>
                            <input type="text" class="form-control" value="${comp.local}">
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select class="form-control">
                                <option value="inscricoes_abertas" ${comp.status === 'inscricoes_abertas' ? 'selected' : ''}>Inscrições Abertas</option>
                                <option value="em_andamento" ${comp.status === 'em_andamento' ? 'selected' : ''}>Em Andamento</option>
                                <option value="concluida" ${comp.status === 'concluida' ? 'selected' : ''}>Concluída</option>
                            </select>
                        </div>
                    </form>
                `;
            }

            return `
                <form id="form-competicao">
                    <div class="form-group">
                        <label>Nome da Competição *</label>
                        <input type="text" class="form-control" required>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Tipo</label>
                                <select class="form-control">
                                    <option value="municipal">Municipal</option>
                                    <option value="estadual">Estadual</option>
                                    <option value="nacional">Nacional</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Data</label>
                                <input type="date" class="form-control">
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Local</label>
                        <input type="text" class="form-control">
                    </div>
                </form>
            `;
        }

        function getFormInscricaoCompeticao(competicaoId) {
            return `
                <form id="form-inscricao-competicao">
                    <p><strong>Confirmar inscrição?</strong></p>
                    <p>Ao se inscrever, você concorda em participar da competição nas datas estabelecidas.</p>
                    
                    <div class="form-group">
                        <label>Observações</label>
                        <textarea class="form-control" rows="3" placeholder="Alguma observação?"></textarea>
                    </div>
                </form>
            `;
        }

        function getFormResultadoCompeticao(competicaoId) {
            return `
                <form id="form-resultado">
                    <div class="form-group">
                        <label>Resultado *</label>
                        <input type="text" class="form-control" placeholder="Ex: 1º lugar, Menção Honrosa">
                    </div>
                    <div class="form-group">
                        <label>Alunos Premiados</label>
                        <select class="form-control" multiple size="4">
                            ${MOCK_DATA.alunos.map(a => `<option value="${a.id}">${a.nome}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Observações</label>
                        <textarea class="form-control" rows="3"></textarea>
                    </div>
                </form>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarCompeticoes,
            renderizarMinhasCompeticoes,
            getFormCompeticao,
            getFormInscricaoCompeticao,
            getFormResultadoCompeticao
        };
    })();

    window.MODULO_COMPETICOES = MODULO_COMPETICOES;
    console.log('✅ Módulo de Competições carregado');
}
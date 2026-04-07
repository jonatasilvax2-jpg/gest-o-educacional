// modulos/bolsas.js - Módulo de Bolsas e Auxílios
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_BOLSAS === 'undefined') {
    const MODULO_BOLSAS = (function() {
        'use strict';

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarBolsas(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const auxilios = MOCK_DATA.auxilios.filter(a => a.alunoId === usuario.id);

            return `
                <div class="bolsas-content">
                    <div class="content-header">
                        <h1><i class="fas fa-hand-holding-heart"></i> Bolsas e Auxílios</h1>
                        ${usuario.perfil === 'secretaria' ? `
                            <button class="btn btn-success" onclick="abrirModal('Novo Auxílio', getFormAuxilio())">
                                <i class="fas fa-plus"></i> Novo Auxílio
                            </button>
                        ` : ''}
                    </div>
                    
                    ${usuario.perfil === 'aluno' ? `
                        <div class="meus-auxilios">
                            <h2>Meus Auxílios</h2>
                            ${auxilios.length > 0 ? `
                                <div class="auxilios-lista">
                                    ${auxilios.map(aux => `
                                        <div class="auxilio-card">
                                            <div class="auxilio-header">
                                                <h3>${aux.tipo === 'bolsa_familia' ? 'Bolsa Família' : 
                                                      aux.tipo === 'transporte' ? 'Auxílio Transporte' : 
                                                      aux.tipo === 'material' ? 'Auxílio Material' : aux.tipo}</h3>
                                                <span class="status-badge ${aux.status}">${aux.status}</span>
                                            </div>
                                            <div class="auxilio-body">
                                                <p><strong>Valor:</strong> R$ ${aux.valor.toFixed(2)}</p>
                                                <p><strong>Início:</strong> ${new Date(aux.dataInicio).toLocaleDateString('pt-BR')}</p>
                                                ${aux.dataFim ? `<p><strong>Término:</strong> ${new Date(aux.dataFim).toLocaleDateString('pt-BR')}</p>` : ''}
                                                ${aux.observacoes ? `<p><strong>Obs:</strong> ${aux.observacoes}</p>` : ''}
                                            </div>
                                            <div class="auxilio-footer">
                                                <button class="btn btn-sm btn-primary" onclick="abrirModal('Detalhes', getDetalhesAuxilio(${aux.id}))">
                                                    <i class="fas fa-eye"></i> Detalhes
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <div class="no-data">
                                    <i class="fas fa-info-circle"></i>
                                    <p>Você não possui auxílios ativos no momento.</p>
                                </div>
                            `}
                        </div>
                    ` : `
                        <div class="todos-auxilios">
                            <h2>Gerenciar Auxílios</h2>
                            <div class="auxilios-lista">
                                ${MOCK_DATA.auxilios.map(aux => {
                                    const aluno = MOCK_DATA.alunos.find(a => a.id === aux.alunoId);
                                    return `
                                        <div class="auxilio-card">
                                            <div class="auxilio-header">
                                                <h3>${aluno ? aluno.nome : 'Aluno'}</h3>
                                                <span class="status-badge ${aux.status}">${aux.status}</span>
                                            </div>
                                            <div class="auxilio-body">
                                                <p><strong>Tipo:</strong> ${aux.tipo}</p>
                                                <p><strong>Valor:</strong> R$ ${aux.valor.toFixed(2)}</p>
                                                <p><strong>Início:</strong> ${new Date(aux.dataInicio).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                            <div class="auxilio-footer">
                                                <button class="btn btn-sm btn-primary" onclick="abrirModal('Editar', getFormAuxilio(${aux.id}))">
                                                    <i class="fas fa-edit"></i> Editar
                                                </button>
                                                <button class="btn btn-sm btn-danger" onclick="cancelarAuxilio(${aux.id})">
                                                    <i class="fas fa-times"></i> Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        
                        <div class="estatisticas-auxilios">
                            <h2>Estatísticas</h2>
                            <div class="stats-mini">
                                <div class="stat-mini-item">
                                    <span class="stat-mini-label">Total de Auxílios</span>
                                    <span class="stat-mini-value">${MOCK_DATA.auxilios.length}</span>
                                </div>
                                <div class="stat-mini-item">
                                    <span class="stat-mini-label">Valor Total Mensal</span>
                                    <span class="stat-mini-value">R$ ${MOCK_DATA.auxilios.reduce((acc, a) => acc + a.valor, 0).toFixed(2)}</span>
                                </div>
                                <div class="stat-mini-item">
                                    <span class="stat-mini-label">Alunos Beneficiados</span>
                                    <span class="stat-mini-value">${new Set(MOCK_DATA.auxilios.map(a => a.alunoId)).size}</span>
                                </div>
                            </div>
                        </div>
                    `}
                </div>
            `;
        }

        function renderizarSolicitacoes(secao) {
            return `
                <div class="solicitacoes-content">
                    <div class="content-header">
                        <h1><i class="fas fa-file-signature"></i> Solicitações de Auxílio</h1>
                        <button class="btn btn-success" onclick="abrirModal('Nova Solicitação', getFormSolicitacao())">
                            <i class="fas fa-plus"></i> Nova Solicitação
                        </button>
                    </div>
                    
                    <div class="solicitacoes-lista">
                        <!-- Lista de solicitações -->
                        <div class="solicitacao-card pendente">
                            <div class="solicitacao-header">
                                <h3>João Silva</h3>
                                <span class="status-badge pendente">Pendente</span>
                            </div>
                            <div class="solicitacao-body">
                                <p><strong>Tipo:</strong> Bolsa Família</p>
                                <p><strong>Data:</strong> 15/11/2023</p>
                                <p><strong>Documentos:</strong> RG, CPF, Comprovante de renda</p>
                            </div>
                            <div class="solicitacao-footer">
                                <button class="btn btn-sm btn-success" onclick="aprovarSolicitacao(1)">
                                    <i class="fas fa-check"></i> Aprovar
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="rejeitarSolicitacao(1)">
                                    <i class="fas fa-times"></i> Rejeitar
                                </button>
                                <button class="btn btn-sm btn-primary" onclick="abrirModal('Documentos', getDocumentosSolicitacao(1))">
                                    <i class="fas fa-file-pdf"></i> Ver Documentos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function getFormAuxilio(id = null) {
            if (id) {
                const aux = MOCK_DATA.auxilios.find(a => a.id === id);
                if (!aux) return '<p>Auxílio não encontrado</p>';

                return `
                    <form id="form-auxilio">
                        <div class="form-group">
                            <label>Aluno</label>
                            <select class="form-control">
                                ${MOCK_DATA.alunos.map(a => `
                                    <option value="${a.id}" ${a.id === aux.alunoId ? 'selected' : ''}>${a.nome}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Tipo de Auxílio</label>
                            <select class="form-control">
                                <option value="bolsa_familia" ${aux.tipo === 'bolsa_familia' ? 'selected' : ''}>Bolsa Família</option>
                                <option value="transporte" ${aux.tipo === 'transporte' ? 'selected' : ''}>Auxílio Transporte</option>
                                <option value="material" ${aux.tipo === 'material' ? 'selected' : ''}>Auxílio Material</option>
                                <option value="alimentacao" ${aux.tipo === 'alimentacao' ? 'selected' : ''}>Auxílio Alimentação</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Valor (R$)</label>
                            <input type="number" class="form-control" step="0.01" value="${aux.valor}">
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Data Início</label>
                                    <input type="date" class="form-control" value="${aux.dataInicio}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Data Fim</label>
                                    <input type="date" class="form-control" value="${aux.dataFim || ''}">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select class="form-control">
                                <option value="ativo" ${aux.status === 'ativo' ? 'selected' : ''}>Ativo</option>
                                <option value="inativo" ${aux.status === 'inativo' ? 'selected' : ''}>Inativo</option>
                                <option value="pendente" ${aux.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Observações</label>
                            <textarea class="form-control" rows="3">${aux.observacoes || ''}</textarea>
                        </div>
                    </form>
                `;
            }

            return `
                <form id="form-auxilio">
                    <div class="form-group">
                        <label>Aluno *</label>
                        <select class="form-control" required>
                            <option value="">Selecione...</option>
                            ${MOCK_DATA.alunos.map(a => `<option value="${a.id}">${a.nome}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tipo de Auxílio *</label>
                        <select class="form-control" required>
                            <option value="">Selecione...</option>
                            <option value="bolsa_familia">Bolsa Família</option>
                            <option value="transporte">Auxílio Transporte</option>
                            <option value="material">Auxílio Material</option>
                            <option value="alimentacao">Auxílio Alimentação</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Valor (R$) *</label>
                        <input type="number" class="form-control" step="0.01" required>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Data Início</label>
                                <input type="date" class="form-control">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Data Fim</label>
                                <input type="date" class="form-control">
                            </div>
                        </div>
                    </div>
                </form>
            `;
        }

        function getDetalhesAuxilio(id) {
            const aux = MOCK_DATA.auxilios.find(a => a.id === id);
            if (!aux) return '<p>Auxílio não encontrado</p>';

            const aluno = MOCK_DATA.alunos.find(a => a.id === aux.alunoId);

            return `
                <div class="detalhes-auxilio">
                    <h3>${aluno ? aluno.nome : 'Aluno'}</h3>
                    <p><strong>Tipo:</strong> ${aux.tipo}</p>
                    <p><strong>Valor:</strong> R$ ${aux.valor.toFixed(2)}</p>
                    <p><strong>Período:</strong> ${new Date(aux.dataInicio).toLocaleDateString('pt-BR')} - ${aux.dataFim ? new Date(aux.dataFim).toLocaleDateString('pt-BR') : 'Indeterminado'}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${aux.status}">${aux.status}</span></p>
                    ${aux.observacoes ? `<p><strong>Observações:</strong> ${aux.observacoes}</p>` : ''}
                </div>
            `;
        }

        function getFormSolicitacao() {
            return `
                <form id="form-solicitacao">
                    <div class="form-group">
                        <label>Tipo de Auxílio *</label>
                        <select class="form-control" required>
                            <option value="">Selecione...</option>
                            <option value="bolsa_familia">Bolsa Família</option>
                            <option value="transporte">Auxílio Transporte</option>
                            <option value="material">Auxílio Material</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Justificativa *</label>
                        <textarea class="form-control" rows="4" placeholder="Explique o motivo da solicitação..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Documentos</label>
                        <input type="file" class="form-control" multiple>
                        <small class="text-muted">Anexe RG, CPF, comprovante de renda, etc.</small>
                    </div>
                </form>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarBolsas,
            renderizarSolicitacoes,
            getFormAuxilio,
            getDetalhesAuxilio,
            getFormSolicitacao,
            getDocumentosSolicitacao: (id) => `<p>Documentos da solicitação ${id}</p>`
        };
    })();

    window.MODULO_BOLSAS = MODULO_BOLSAS;
    console.log('✅ Módulo de Bolsas e Auxílios carregado');
}
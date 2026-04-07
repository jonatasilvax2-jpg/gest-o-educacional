// modulos/documentos.js - Módulo de Documentos
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_DOCUMENTOS === 'undefined') {
    const MODULO_DOCUMENTOS = (function() {
        'use strict';

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarDocumentos(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const documentos = MOCK_DATA.documentos?.filter(d => d.alunoId === usuario.id) || [];

            return `
                <div class="documentos-content">
                    <div class="content-header">
                        <h1><i class="fas fa-file-alt"></i> Meus Documentos</h1>
                        <button class="btn btn-success" onclick="abrirModal('Solicitar Documento', getFormSolicitacaoDocumento())">
                            <i class="fas fa-plus"></i> Solicitar Documento
                        </button>
                    </div>
                    
                    <div class="documentos-grid">
                        <div class="documento-card">
                            <i class="fas fa-id-card documento-icon"></i>
                            <div class="documento-info">
                                <h3>Histórico Escolar</h3>
                                <p>2023 • 4º bimestre</p>
                                <p><small>Emissão: 15/11/2023</small></p>
                                <span class="status-badge disponivel">Disponível</span>
                            </div>
                            <div class="documento-acoes">
                                <button class="btn btn-sm btn-primary" onclick="baixarDocumento('historico')">
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="documento-card">
                            <i class="fas fa-file-signature documento-icon"></i>
                            <div class="documento-info">
                                <h3>Declaração de Matrícula</h3>
                                <p>2023 • Ensino Fundamental</p>
                                <p><small>Emissão: 10/11/2023</small></p>
                                <span class="status-badge disponivel">Disponível</span>
                            </div>
                            <div class="documento-acoes">
                                <button class="btn btn-sm btn-primary" onclick="baixarDocumento('declaracao')">
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="documento-card">
                            <i class="fas fa-file-pdf documento-icon"></i>
                            <div class="documento-info">
                                <h3>Transferência</h3>
                                <p>Solicitada em 05/11/2023</p>
                                <p><small>Em processamento</small></p>
                                <span class="status-badge pendente">Pendente</span>
                            </div>
                            <div class="documento-acoes">
                                <button class="btn btn-sm btn-secondary" disabled>
                                    <i class="fas fa-hourglass-half"></i>
                                </button>
                            </div>
                        </div>
                        
                        ${documentos.map(doc => `
                            <div class="documento-card">
                                <i class="fas fa-file-pdf documento-icon"></i>
                                <div class="documento-info">
                                    <h3>${doc.tipo}</h3>
                                    <p>${doc.ano}</p>
                                    <p><small>Emissão: ${new Date(doc.dataEmissao).toLocaleDateString('pt-BR')}</small></p>
                                    <span class="status-badge ${doc.validado ? 'disponivel' : 'pendente'}">
                                        ${doc.validado ? 'Disponível' : 'Pendente'}
                                    </span>
                                </div>
                                <div class="documento-acoes">
                                    ${doc.validado ? `
                                        <button class="btn btn-sm btn-primary" onclick="baixarDocumento(${doc.id})">
                                            <i class="fas fa-download"></i>
                                        </button>
                                    ` : `
                                        <button class="btn btn-sm btn-secondary" disabled>
                                            <i class="fas fa-hourglass-half"></i>
                                        </button>
                                    `}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function renderizarSolicitacoes(secao) {
            return `
                <div class="solicitacoes-documentos-content">
                    <div class="content-header">
                        <h1><i class="fas fa-clipboard-list"></i> Solicitações de Documentos</h1>
                    </div>
                    
                    <div class="solicitacoes-lista">
                        <div class="solicitacao-card">
                            <div class="solicitacao-header">
                                <h3>João Silva</h3>
                                <span class="status-badge pendente">Pendente</span>
                            </div>
                            <div class="solicitacao-body">
                                                            <p><strong>Documento:</strong> Histórico Escolar</p>
                                <p><strong>Data:</strong> 15/11/2023</p>
                                <p><strong>Finalidade:</strong> Transferência</p>
                            </div>
                            <div class="solicitacao-footer">
                                <button class="btn btn-sm btn-success" onclick="aprovarSolicitacao(1)">
                                    <i class="fas fa-check"></i> Aprovar
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="rejeitarSolicitacao(1)">
                                    <i class="fas fa-times"></i> Rejeitar
                                </button>
                                <button class="btn btn-sm btn-primary" onclick="abrirModal('Detalhes', getDetalhesSolicitacao(1))">
                                    <i class="fas fa-eye"></i> Detalhes
                                </button>
                            </div>
                        </div>
                        
                        <div class="solicitacao-card">
                            <div class="solicitacao-header">
                                <h3>Maria Santos</h3>
                                <span class="status-badge processando">Em Processamento</span>
                            </div>
                            <div class="solicitacao-body">
                                <p><strong>Documento:</strong> Declaração de Matrícula</p>
                                <p><strong>Data:</strong> 14/11/2023</p>
                                <p><strong>Finalidade:</strong> Bolsa de Estudos</p>
                            </div>
                            <div class="solicitacao-footer">
                                <button class="btn btn-sm btn-success" onclick="aprovarSolicitacao(2)">
                                    <i class="fas fa-check"></i> Aprovar
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="rejeitarSolicitacao(2)">
                                    <i class="fas fa-times"></i> Rejeitar
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="estatisticas-documentos">
                        <h2>Estatísticas</h2>
                        <div class="stats-mini">
                            <div class="stat-mini-item">
                                <span class="stat-mini-label">Solicitações Pendentes</span>
                                <span class="stat-mini-value">5</span>
                            </div>
                            <div class="stat-mini-item">
                                <span class="stat-mini-label">Documentos Emitidos</span>
                                <span class="stat-mini-value">127</span>
                            </div>
                            <div class="stat-mini-item">
                                <span class="stat-mini-label">Tempo Médio</span>
                                <span class="stat-mini-value">2 dias</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function getFormSolicitacaoDocumento() {
            return `
                <form id="form-solicitacao-documento">
                    <div class="form-group">
                        <label>Tipo de Documento *</label>
                        <select class="form-control" required>
                            <option value="">Selecione...</option>
                            <option value="historico">Histórico Escolar</option>
                            <option value="declaracao">Declaração de Matrícula</option>
                            <option value="transferencia">Transferência</option>
                            <option value="certificado">Certificado de Conclusão</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Finalidade *</label>
                        <textarea class="form-control" rows="3" placeholder="Para que será utilizado o documento?" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Observações</label>
                        <textarea class="form-control" rows="3" placeholder="Informações adicionais..."></textarea>
                    </div>
                </form>
            `;
        }

        function getDetalhesSolicitacao(id) {
            return `
                <div class="detalhes-solicitacao">
                    <h3>Solicitação #${id}</h3>
                    <p><strong>Aluno:</strong> João Silva</p>
                    <p><strong>Documento:</strong> Histórico Escolar</p>
                    <p><strong>Data:</strong> 15/11/2023</p>
                    <p><strong>Status:</strong> <span class="status-badge pendente">Pendente</span></p>
                    <p><strong>Finalidade:</strong> Transferência para outra escola</p>
                    <p><strong>Observações:</strong> Necessário com urgência</p>
                    <p><strong>Documentos Anexados:</strong></p>
                    <ul>
                        <li><i class="fas fa-file-pdf"></i> RG.pdf</li>
                        <li><i class="fas fa-file-image"></i> Comprovante_residencia.jpg</li>
                    </ul>
                </div>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarDocumentos,
            renderizarSolicitacoes,
            getFormSolicitacaoDocumento,
            getDetalhesSolicitacao
        };
    })();

    window.MODULO_DOCUMENTOS = MODULO_DOCUMENTOS;
    console.log('✅ Módulo de Documentos carregado');
}
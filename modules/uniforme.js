// modulos/uniforme.js - Módulo de Uniforme Escolar
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_UNIFORME === 'undefined') {
    const MODULO_UNIFORME = (function() {
        'use strict';

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarUniforme(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const modelos = MOCK_DATA.uniforme?.modelos || [];

            return `
                <div class="uniforme-content">
                    <div class="content-header">
                        <h1><i class="fas fa-tshirt"></i> Uniforme Escolar</h1>
                        <button class="btn btn-success" onclick="abrirModal('Solicitar Uniforme', getFormSolicitacaoUniforme())">
                            <i class="fas fa-plus"></i> Solicitar Uniforme
                        </button>
                    </div>
                    
                    <div class="modelos-grid">
                        ${modelos.map(modelo => `
                            <div class="modelo-card">
                                <div class="modelo-icon">
                                    <i class="fas fa-${modelo.tipo === 'camiseta' ? 'tshirt' : modelo.tipo === 'calça' ? 'user-tie' : 'shoe-prints'}"></i>
                                </div>
                                <div class="modelo-info">
                                    <h3>${modelo.descricao}</h3>
                                    <p><strong>Tipo:</strong> ${modelo.tipo}</p>
                                    <p><strong>Tamanhos:</strong> ${modelo.tamanhos.join(', ')}</p>
                                    <p><strong>Preço:</strong> R$ ${modelo.preco.toFixed(2)}</p>
                                    <p><strong>Disponível:</strong> ${modelo.disponivel ? 'Sim' : 'Não'}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="minhas-solicitacoes">
                        <h2>Minhas Solicitações</h2>
                        ${MOCK_DATA.uniforme?.solicitacoes?.filter(s => s.alunoId === usuario.id).map(sol => `
                            <div class="solicitacao-uniforme-card">
                                <div class="solicitacao-header">
                                    <h3>Solicitação #${sol.id}</h3>
                                    <span class="status-badge ${sol.status}">${sol.status}</span>
                                </div>
                                <div class="solicitacao-body">
                                    <p><strong>Data:</strong> ${new Date(sol.data).toLocaleDateString('pt-BR')}</p>
                                    <p><strong>Itens:</strong></p>
                                    <ul>
                                        ${sol.itens.map(item => `
                                            <li>${item.quantidade}x ${item.tipo} (${item.tamanho})</li>
                                        `).join('')}
                                    </ul>
                                    <p><strong>Valor Total:</strong> R$ ${sol.valorTotal.toFixed(2)}</p>
                                    <p><strong>Pagamento:</strong> <span class="${sol.pagamento === 'confirmado' ? 'text-success' : 'text-warning'}">${sol.pagamento}</span></p>
                                </div>
                            </div>
                        `).join('')}
                        
                        ${MOCK_DATA.uniforme?.solicitacoes?.filter(s => s.alunoId === usuario.id).length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Você não possui solicitações de uniforme.</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        function renderizarEstoqueUniforme(secao) {
            return `
                <div class="estoque-uniforme-content">
                    <div class="content-header">
                        <h1><i class="fas fa-boxes"></i> Estoque de Uniformes</h1>
                        <button class="btn btn-success" onclick="abrirModal('Adicionar ao Estoque', getFormEstoqueUniforme())">
                            <i class="fas fa-plus"></i> Adicionar
                        </button>
                    </div>
                    
                    <div class="estoque-grid">
                        <div class="estoque-categoria">
                            <h3>Camisetas</h3>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Tamanho</th>
                                        <th>Quantidade</th>
                                        <th>Estoque Mínimo</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>P</td>
                                        <td>25</td>
                                        <td>10</td>
                                        <td><button class="btn btn-sm btn-primary">Ajustar</button></td>
                                    </tr>
                                    <tr>
                                        <td>M</td>
                                        <td>32</td>
                                        <td>15</td>
                                        <td><button class="btn btn-sm btn-primary">Ajustar</button></td>
                                    </tr>
                                    <tr>
                                        <td>G</td>
                                        <td>18</td>
                                        <td>10</td>
                                        <td><button class="btn btn-sm btn-primary">Ajustar</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="estoque-categoria">
                            <h3>Calças</h3>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Tamanho</th>
                                        <th>Quantidade</th>
                                        <th>Estoque Mínimo</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>P</td>
                                        <td>15</td>
                                        <td>10</td>
                                        <td><button class="btn btn-sm btn-primary">Ajustar</button></td>
                                    </tr>
                                    <tr>
                                        <td>M</td>
                                        <td>22</td>
                                        <td>12</td>
                                        <td><button class="btn btn-sm btn-primary">Ajustar</button></td>
                                    </tr>
                                    <tr>
                                        <td>G</td>
                                        <td>12</td>
                                        <td>8</td>
                                        <td><button class="btn btn-sm btn-primary">Ajustar</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="alertas-estoque">
                        <h3><i class="fas fa-exclamation-triangle text-warning"></i> Alertas</h3>
                        <ul>
                            <li>Camiseta tamanho G - Estoque baixo (18 unidades)</li>
                            <li>Calça tamanho G - Estoque baixo (12 unidades)</li>
                        </ul>
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function getFormSolicitacaoUniforme() {
            return `
                <form id="form-solicitacao-uniforme">
                    <div class="form-group">
                        <label>Selecione os itens:</label>
                        <div class="itens-uniforme">
                            <div class="item-row">
                                <select class="form-control" style="width: 40%;">
                                    <option>Camiseta</option>
                                    <option>Calça</option>
                                    <option>Jaqueta</option>
                                    <option>Tênis</option>
                                </select>
                                <select class="form-control" style="width: 30%;">
                                    <option>P</option>
                                    <option>M</option>
                                    <option>G</option>
                                    <option>GG</option>
                                </select>
                                <input type="number" class="form-control" style="width: 20%;" min="1" value="1">
                                <button type="button" class="btn btn-sm btn-success" onclick="adicionarItemUniforme()">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Observações</label>
                        <textarea class="form-control" rows="3" placeholder="Alguma observação?"></textarea>
                    </div>
                    
                    <div class="total-pedido">
                        <p><strong>Total estimado:</strong> R$ 220,00</p>
                    </div>
                </form>
            `;
        }

        function getFormEstoqueUniforme() {
            return `
                <form id="form-estoque-uniforme">
                    <div class="form-group">
                        <label>Peça</label>
                        <select class="form-control">
                            <option>Camiseta</option>
                            <option>Calça</option>
                            <option>Jaqueta</option>
                            <option>Tênis</option>
                        </select>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Tamanho</label>
                                <select class="form-control">
                                    <option>P</option>
                                    <option>M</option>
                                    <option>G</option>
                                    <option>GG</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Quantidade</label>
                                <input type="number" class="form-control" min="1">
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Estoque Mínimo</label>
                        <input type="number" class="form-control" min="1" value="10">
                    </div>
                </form>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarUniforme,
            renderizarEstoqueUniforme,
            getFormSolicitacaoUniforme,
            getFormEstoqueUniforme
        };
    })();

    window.MODULO_UNIFORME = MODULO_UNIFORME;
    console.log('✅ Módulo de Uniforme carregado');
}
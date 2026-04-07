// modulos/merenda.js - Módulo da Merenda Escolar
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_MERENDA === 'undefined') {
    const MODULO_MERENDA = (function() {
        'use strict';

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarCardapio(secao) {
            const cardapios = MOCK_DATA.merenda.cardapios;
            const hoje = new Date().toISOString().split('T')[0];
            const cardapioHoje = cardapios.find(c => c.data === hoje);

            return `
                <div class="merenda-content">
                    <div class="content-header">
                        <h1><i class="fas fa-utensils"></i> Cardápio da Semana</h1>
                    </div>
                    
                    ${cardapioHoje ? `
                        <div class="cardapio-hoje">
                            <h2>Cardápio de Hoje</h2>
                            <div class="refeicoes-hoje">
                                <div class="refeicao-card">
                                    <h3><i class="fas fa-coffee"></i> Café da Manhã</h3>
                                    <p>${cardapioHoje.cafe}</p>
                                </div>
                                <div class="refeicao-card">
                                    <h3><i class="fas fa-utensils"></i> Almoço</h3>
                                    <p>${cardapioHoje.almoco}</p>
                                </div>
                                <div class="refeicao-card">
                                    <h3><i class="fas fa-apple-alt"></i> Lanche da Tarde</h3>
                                    <p>${cardapioHoje.lanche}</p>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="cardapio-semana">
                        <h2>Cardápio da Semana</h2>
                        <div class="dias-cardapio">
                            ${cardapios.map(cardapio => `
                                <div class="dia-cardapio ${cardapio.data === hoje ? 'hoje' : ''}">
                                    <h3>${cardapio.dia}</h3>
                                    <p class="data">${new Date(cardapio.data).toLocaleDateString('pt-BR')}</p>
                                    <div class="refeicao">
                                        <strong>Café:</strong>
                                        <p>${cardapio.cafe}</p>
                                    </div>
                                    <div class="refeicao">
                                        <strong>Almoço:</strong>
                                        <p>${cardapio.almoco}</p>
                                    </div>
                                    <div class="refeicao">
                                        <strong>Lanche:</strong>
                                        <p>${cardapio.lanche}</p>
                                    </div>
                                    ${cardapio.observacoes ? `
                                        <div class="observacoes">
                                            <i class="fas fa-info-circle"></i>
                                            ${cardapio.observacoes}
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        function renderizarDietasEspeciais(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const dietas = MOCK_DATA.merenda.alunosEspeciais.filter(d => d.alunoId === usuario.id);

            return `
                <div class="dietas-content">
                    <div class="content-header">
                        <h1><i class="fas fa-heartbeat"></i> Dietas Especiais</h1>
                    </div>
                    
                    ${dietas.length > 0 ? `
                        <div class="dietas-lista">
                            ${dietas.map(dieta => {
                                const aluno = MOCK_DATA.alunos.find(a => a.id === dieta.alunoId);
                                return `
                                    <div class="dieta-card">
                                        <h3>${aluno ? aluno.nome : 'Aluno'}</h3>
                                        <p><strong>Tipo de Dieta:</strong> ${dieta.tipoDieta}</p>
                                        <p><strong>Restrições:</strong> ${dieta.restricoes.join(', ')}</p>
                                        <p><strong>Observações:</strong> ${dieta.observacoes}</p>
                                        <p><strong>Data de Início:</strong> ${new Date(dieta.dataInicio).toLocaleDateString('pt-BR')}</p>
                                        <p><strong>Status:</strong> <span class="status-badge ${dieta.ativo ? 'ativo' : 'inativo'}">
                                            ${dieta.ativo ? 'Ativo' : 'Inativo'}
                                        </span></p>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : `
                        <div class="no-data">
                            <i class="fas fa-info-circle"></i>
                            <p>Não há dietas especiais cadastradas para você.</p>
                        </div>
                    `}
                </div>
            `;
        }

        function renderizarEstoque(secao) {
            if (secao === 'estoque') {
                const estoque = MOCK_DATA.merenda.estoque;

                return `
                    <div class="estoque-content">
                        <div class="content-header">
                            <h1><i class="fas fa-boxes"></i> Estoque de Alimentos</h1>
                            <button class="btn btn-success" onclick="abrirModal('Adicionar Item', getFormItemEstoque())">
                                <i class="fas fa-plus"></i> Adicionar Item
                            </button>
                        </div>
                        
                        <div class="estoque-grid">
                            ${estoque.map(item => {
                                const dataValidade = new Date(item.dataValidade);
                                const hoje = new Date();
                                const diasValidade = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));
                                
                                return `
                                    <div class="item-estoque-card ${diasValidade < 30 ? 'alerta' : ''}">
                                        <h3>${item.item}</h3>
                                        <p><strong>Quantidade:</strong> ${item.quantidade} ${item.unidade}</p>
                                        <p><strong>Validade:</strong> ${new Date(item.dataValidade).toLocaleDateString('pt-BR')}</p>
                                        ${diasValidade < 30 ? `
                                            <p class="text-warning">
                                                <i class="fas fa-exclamation-triangle"></i>
                                                Vence em ${diasValidade} dias
                                            </p>
                                        ` : ''}
                                        <p><strong>Fornecedor:</strong> ${item.fornecedor}</p>
                                        <p><strong>Lote:</strong> ${item.lote}</p>
                                        <p><strong>Local:</strong> ${item.localizacao}</p>
                                        <div class="item-acoes">
                                            <button class="btn btn-sm btn-primary" onclick="abrirModal('Editar', getFormItemEstoque(${item.id}))">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="removerItemEstoque(${item.id})">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        
                        <div class="alertas-estoque">
                            <h2><i class="fas fa-bell"></i> Alertas</h2>
                            <div class="alertas-lista">
                                ${estoque.filter(item => {
                                    const dataValidade = new Date(item.dataValidade);
                                    const hoje = new Date();
                                    const diasValidade = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));
                                    return diasValidade < 30;
                                }).map(item => `
                                    <div class="alerta-item warning">
                                        <i class="fas fa-exclamation-circle"></i>
                                        <span>${item.item} - Vence em ${Math.ceil((new Date(item.dataValidade) - new Date()) / (1000 * 60 * 60 * 24))} dias</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
            }

            return '<div>Seção não encontrada</div>';
        }

        function renderizarFornecedores(secao) {
            const fornecedores = MOCK_DATA.merenda.fornecedores;

            return `
                <div class="fornecedores-content">
                    <div class="content-header">
                        <h1><i class="fas fa-truck"></i> Fornecedores</h1>
                        <button class="btn btn-success" onclick="abrirModal('Novo Fornecedor', getFormFornecedor())">
                            <i class="fas fa-plus"></i> Novo Fornecedor
                        </button>
                    </div>
                    
                    <div class="fornecedores-lista">
                        ${fornecedores.map(fornecedor => `
                            <div class="fornecedor-card">
                                <h3>${fornecedor.nome}</h3>
                                <p><strong>Tipo:</strong> ${fornecedor.tipo}</p>
                                <p><i class="fas fa-phone"></i> ${fornecedor.contato}</p>
                                <p><i class="fas fa-envelope"></i> ${fornecedor.email}</p>
                                <div class="fornecedor-acoes">
                                    <button class="btn btn-sm btn-primary" onclick="abrirModal('Editar', getFormFornecedor(${fornecedor.id}))">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="removerFornecedor(${fornecedor.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function getFormItemEstoque(id = null) {
            if (id) {
                const item = MOCK_DATA.merenda.estoque.find(i => i.id === id);
                if (!item) return '<p>Item não encontrado</p>';

                return `
                    <form id="form-item-estoque">
                        <div class="form-group">
                            <label>Item</label>
                            <input type="text" class="form-control" value="${item.item}">
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Quantidade</label>
                                    <input type="number" class="form-control" value="${item.quantidade}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Unidade</label>
                                    <select class="form-control">
                                        <option value="kg" ${item.unidade === 'kg' ? 'selected' : ''}>kg</option>
                                        <option value="litros" ${item.unidade === 'litros' ? 'selected' : ''}>litros</option>
                                        <option value="unidades" ${item.unidade === 'unidades' ? 'selected' : ''}>unidades</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Data de Validade</label>
                            <input type="date" class="form-control" value="${item.dataValidade}">
                        </div>
                        <div class="form-group">
                            <label>Fornecedor</label>
                            <input type="text" class="form-control" value="${item.fornecedor}">
                        </div>
                        <div class="form-group">
                            <label>Lote</label>
                            <input type="text" class="form-control" value="${item.lote}">
                        </div>
                        <div class="form-group">
                            <label>Localização</label>
                            <input type="text" class="form-control" value="${item.localizacao}">
                        </div>
                    </form>
                `;
            }

            return `
                <form id="form-item-estoque">
                    <div class="form-group">
                        <label>Item *</label>
                        <input type="text" class="form-control" placeholder="Nome do item" required>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Quantidade *</label>
                                <input type="number" class="form-control" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Unidade</label>
                                <select class="form-control">
                                    <option value="kg">kg</option>
                                    <option value="litros">litros</option>
                                    <option value="unidades">unidades</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Data de Validade</label>
                        <input type="date" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Fornecedor</label>
                        <input type="text" class="form-control" placeholder="Nome do fornecedor">
                    </div>
                    <div class="form-group">
                        <label>Lote</label>
                        <input type="text" class="form-control" placeholder="Número do lote">
                    </div>
                </form>
            `;
        }

        function getFormFornecedor(id = null) {
            if (id) {
                const fornecedor = MOCK_DATA.merenda.fornecedores.find(f => f.id === id);
                if (!fornecedor) return '<p>Fornecedor não encontrado</p>';

                return `
                    <form id="form-fornecedor">
                        <div class="form-group">
                            <label>Nome</label>
                            <input type="text" class="form-control" value="${fornecedor.nome}">
                        </div>
                        <div class="form-group">
                            <label>Tipo</label>
                            <input type="text" class="form-control" value="${fornecedor.tipo}">
                        </div>
                        <div class="form-group">
                            <label>Contato</label>
                            <input type="text" class="form-control" value="${fornecedor.contato}">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" class="form-control" value="${fornecedor.email}">
                        </div>
                    </form>
                `;
            }

            return `
                <form id="form-fornecedor">
                    <div class="form-group">
                        <label>Nome *</label>
                        <input type="text" class="form-control" placeholder="Nome do fornecedor" required>
                    </div>
                    <div class="form-group">
                        <label>Tipo</label>
                        <input type="text" class="form-control" placeholder="Tipo de produto">
                    </div>
                    <div class="form-group">
                        <label>Contato</label>
                        <input type="text" class="form-control" placeholder="Telefone">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" class="form-control" placeholder="email@fornecedor.com">
                    </div>
                </form>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarCardapio,
            renderizarDietasEspeciais,
            renderizarEstoque,
            renderizarFornecedores,
            getFormItemEstoque,
            getFormFornecedor
        };
    })();

    window.MODULO_MERENDA = MODULO_MERENDA;
    console.log('✅ Módulo da Merenda carregado');
}
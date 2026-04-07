// modulos/biblioteca.js - Módulo da Biblioteca
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_BIBLIOTECA === 'undefined') {
    const MODULO_BIBLIOTECA = (function() {
        'use strict';

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarLivros(secao) {
            const livros = MOCK_DATA.biblioteca.livros;

            if (secao === 'listar') {
                return `
                    <div class="biblioteca-content">
                        <div class="content-header">
                            <h1><i class="fas fa-book"></i> Acervo da Biblioteca</h1>
                            <div class="busca-container">
                                <input type="text" class="form-control" placeholder="Buscar livro..." id="busca-livro">
                                <button class="btn btn-primary" onclick="buscarLivros()">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="filtros-biblioteca">
                            <select class="form-control" id="filtro-genero">
                                <option value="">Todos os gêneros</option>
                                <option value="Romance">Romance</option>
                                <option value="Infantil">Infantil</option>
                                <option value="Didático">Didático</option>
                                <option value="Pesquisa">Pesquisa</option>
                            </select>
                            <select class="form-control" id="filtro-disponibilidade">
                                <option value="">Todos</option>
                                <option value="disponivel">Disponíveis</option>
                                <option value="indisponivel">Indisponíveis</option>
                            </select>
                        </div>
                        
                        <div class="livros-grid">
                            ${livros.map(livro => `
                                <div class="livro-card">
                                    <div class="livro-capa">
                                        <i class="fas fa-book"></i>
                                    </div>
                                    <div class="livro-info">
                                        <h3 class="livro-titulo">${livro.titulo}</h3>
                                        <p class="livro-autor">${livro.autor}</p>
                                        <p>${livro.editora} • ${livro.ano}</p>
                                        <p class="livro-localizacao"><i class="fas fa-map-marker-alt"></i> ${livro.localizacao}</p>
                                        <div class="livro-disponibilidade">
                                            <span class="${livro.disponiveis > 0 ? 'disponivel' : 'indisponivel'}">
                                                ${livro.disponiveis} de ${livro.exemplares} disponíveis
                                            </span>
                                        </div>
                                        <div class="livro-acoes">
                                            ${livro.disponiveis > 0 ? 
                                                `<button class="btn btn-sm btn-success" onclick="abrirModal('Reservar', getFormReserva(${livro.id}))">
                                                    <i class="fas fa-hand-holding"></i> Reservar
                                                </button>` : 
                                                `<button class="btn btn-sm btn-secondary" disabled>
                                                    <i class="fas fa-times"></i> Indisponível
                                                </button>`
                                            }
                                            <button class="btn btn-sm btn-primary" onclick="abrirModal('${livro.titulo}', getDetalhesLivro(${livro.id}))">
                                                <i class="fas fa-eye"></i> Detalhes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            return '<div>Seção não encontrada</div>';
        }

        function renderizarMeusEmprestimos(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const emprestimos = MOCK_DATA.biblioteca.emprestimos.filter(e => e.alunoId === usuario.id);

            return `
                <div class="emprestimos-content">
                    <div class="content-header">
                        <h1><i class="fas fa-hand-holding"></i> Meus Empréstimos</h1>
                    </div>
                    
                    <div class="emprestimos-lista">
                        ${emprestimos.map(emp => {
                            const livro = MOCK_DATA.biblioteca.livros.find(l => l.id === emp.livroId);
                            const dataPrevista = new Date(emp.dataPrevista);
                            const hoje = new Date();
                            const diasAtraso = Math.ceil((hoje - dataPrevista) / (1000 * 60 * 60 * 24));
                            
                            return `
                                <div class="emprestimo-card ${emp.status}">
                                    <div class="emprestimo-info">
                                        <h3>${livro.titulo}</h3>
                                        <p>${livro.autor}</p>
                                        <p><i class="fas fa-calendar"></i> Empréstimo: ${new Date(emp.dataEmprestimo).toLocaleDateString('pt-BR')}</p>
                                        <p><i class="fas fa-clock"></i> Devolução: ${new Date(emp.dataPrevista).toLocaleDateString('pt-BR')}</p>
                                        ${emp.status === 'emprestado' && diasAtraso > 0 ? 
                                            `<p class="text-danger"><i class="fas fa-exclamation-triangle"></i> ${diasAtraso} dias de atraso</p>` : ''}
                                        ${emp.renovacoes > 0 ? `<p>Renovações: ${emp.renovacoes}</p>` : ''}
                                    </div>
                                    <div class="emprestimo-acoes">
                                        ${emp.status === 'emprestado' ? `
                                            <button class="btn btn-sm btn-warning" onclick="renovarEmprestimo(${emp.id})">
                                                <i class="fas fa-sync"></i> Renovar
                                            </button>
                                            <button class="btn btn-sm btn-success" onclick="abrirModal('Devolver', getFormDevolucao(${emp.id}))">
                                                <i class="fas fa-undo"></i> Devolver
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                        
                        ${emprestimos.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Você não possui empréstimos ativos.</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        function renderizarMinhasReservas(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const reservas = MOCK_DATA.biblioteca.reservas.filter(r => r.alunoId === usuario.id);

            return `
                <div class="reservas-content">
                    <div class="content-header">
                        <h1><i class="fas fa-calendar-check"></i> Minhas Reservas</h1>
                    </div>
                    
                    <div class="reservas-lista">
                        ${reservas.map(res => {
                            const livro = MOCK_DATA.biblioteca.livros.find(l => l.id === res.livroId);
                            const dataExpiracao = new Date(res.dataExpiracao);
                            
                            return `
                                <div class="reserva-card ${res.status}">
                                    <div class="reserva-info">
                                        <h3>${livro.titulo}</h3>
                                        <p>${livro.autor}</p>
                                        <p><i class="fas fa-calendar"></i> Reserva: ${new Date(res.dataReserva).toLocaleDateString('pt-BR')}</p>
                                        <p><i class="fas fa-clock"></i> Expira: ${new Date(res.dataExpiracao).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <div class="reserva-acoes">
                                        <button class="btn btn-sm btn-danger" onclick="cancelarReserva(${res.id})">
                                            <i class="fas fa-times"></i> Cancelar
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                        
                        ${reservas.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Você não possui reservas ativas.</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function getDetalhesLivro(id) {
            const livro = MOCK_DATA.biblioteca.livros.find(l => l.id === id);
            if (!livro) return '<p>Livro não encontrado</p>';

            return `
                <div class="detalhes-livro">
                    <h3>${livro.titulo}</h3>
                    <p><strong>Autor:</strong> ${livro.autor}</p>
                    <p><strong>Editora:</strong> ${livro.editora}</p>
                    <p><strong>Ano:</strong> ${livro.ano}</p>
                    <p><strong>ISBN:</strong> ${livro.isbn}</p>
                    <p><strong>Gênero:</strong> ${livro.genero}</p>
                    <p><strong>Páginas:</strong> ${livro.paginas}</p>
                    <p><strong>Localização:</strong> ${livro.localizacao}</p>
                    <p><strong>Exemplares:</strong> ${livro.exemplares}</p>
                    <p><strong>Disponíveis:</strong> <span class="${livro.disponiveis > 0 ? 'text-success' : 'text-danger'}">${livro.disponiveis}</span></p>
                    <p><strong>Aquisição:</strong> ${new Date(livro.dataAquisicao).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Estado:</strong> ${livro.estado}</p>
                </div>
            `;
        }

        function getFormReserva(livroId) {
            return `
                <form id="form-reserva">
                    <p>Confirmar reserva do livro?</p>
                    <p>Você terá 7 dias para retirar o livro na biblioteca.</p>
                    <input type="hidden" id="livro-id" value="${livroId}">
                </form>
            `;
        }

        function getFormDevolucao(emprestimoId) {
            return `
                <form id="form-devolucao">
                    <p>Confirmar devolução do livro?</p>
                    <div class="form-group">
                        <label>Estado do livro</label>
                        <select class="form-control">
                            <option value="bom">Bom estado</option>
                            <option value="regular">Regular</option>
                            <option value="danificado">Danificado</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Observações</label>
                        <textarea class="form-control" rows="3" placeholder="Observações sobre a devolução..."></textarea>
                    </div>
                </form>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarLivros,
            renderizarMeusEmprestimos,
            renderizarMinhasReservas,
            getDetalhesLivro,
            getFormReserva,
            getFormDevolucao
        };
    })();

    window.MODULO_BIBLIOTECA = MODULO_BIBLIOTECA;
    console.log('✅ Módulo da Biblioteca carregado');
}
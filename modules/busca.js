// modulos/busca.js - Sistema de Busca Avançada
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_BUSCA === 'undefined') {
    const MODULO_BUSCA = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            minimoCaracteres: 3,
            tempoDebounce: 300,
            maxResultados: 50,
            indices: ['alunos', 'professores', 'escolas', 'turmas', 'livros', 'documentos']
        };

        // ==================== ESTADO ====================
        let historicoBuscas = [];
        let favoritos = [];
        let indicesBusca = {};
        let timeoutDebounce = null;

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('🔍 Sistema de Busca Avançada inicializado');
            
            // Carregar dados salvos
            carregarHistorico();
            carregarFavoritos();
            
            // Construir índices de busca
            construirIndices();
            
            // Adicionar campo de busca no header
            adicionarCampoBusca();
        }

        // ==================== CONSTRUÇÃO DE ÍNDICES ====================
        function construirIndices() {
            // Índice de alunos
            indicesBusca.alunos = (MOCK_DATA.alunos || []).map(aluno => ({
                id: aluno.id,
                tipo: 'aluno',
                titulo: aluno.nome,
                subtitulo: `Matrícula: ${aluno.matricula} - Turma: ${aluno.turma}`,
                url: `/aluno/${aluno.id}`,
                icone: 'fa-user-graduate',
                termos: [
                    aluno.nome.toLowerCase(),
                    aluno.matricula.toLowerCase(),
                    aluno.turma.toLowerCase(),
                    aluno.responsavel.toLowerCase(),
                    aluno.email.toLowerCase()
                ],
                metadados: {
                    turma: aluno.turma,
                    matricula: aluno.matricula,
                    media: aluno.mediaGeral,
                    status: aluno.status
                }
            }));

            // Índice de professores
            indicesBusca.professores = (MOCK_DATA.professores || []).map(prof => ({
                id: prof.id,
                tipo: 'professor',
                titulo: prof.nome,
                subtitulo: `${prof.disciplina} - ${prof.formacao}`,
                url: `/professor/${prof.id}`,
                icone: 'fa-chalkboard-teacher',
                termos: [
                    prof.nome.toLowerCase(),
                    prof.disciplina.toLowerCase(),
                    prof.email.toLowerCase(),
                    prof.formacao.toLowerCase()
                ],
                metadados: {
                    disciplina: prof.disciplina,
                    email: prof.email,
                    status: prof.status
                }
            }));

            // Índice de escolas
            indicesBusca.escolas = (MOCK_DATA.escolas || []).map(escola => ({
                id: escola.id,
                tipo: 'escola',
                titulo: escola.nome,
                subtitulo: escola.endereco,
                url: `/escola/${escola.id}`,
                icone: 'fa-school',
                termos: [
                    escola.nome.toLowerCase(),
                    escola.endereco.toLowerCase(),
                    escola.bairro.toLowerCase(),
                    escola.diretor.toLowerCase()
                ],
                metadados: {
                    diretor: escola.diretor,
                    totalAlunos: escola.totalAlunos,
                    status: escola.status
                }
            }));

            // Índice de turmas
            indicesBusca.turmas = (MOCK_DATA.turmas || []).map(turma => {
                const escola = MOCK_DATA.escolas.find(e => e.id === turma.escolaId);
                const professor = MOCK_DATA.professores.find(p => p.id === turma.professorId);
                
                return {
                    id: turma.id,
                    tipo: 'turma',
                    titulo: `Turma ${turma.nome}`,
                    subtitulo: `${escola ? escola.nome : ''} - Prof. ${professor ? professor.nome : 'Não atribuído'}`,
                    url: `/turma/${turma.id}`,
                    icone: 'fa-users',
                    termos: [
                        turma.nome.toLowerCase(),
                        escola ? escola.nome.toLowerCase() : '',
                        professor ? professor.nome.toLowerCase() : '',
                        turma.periodo.toLowerCase()
                    ],
                    metadados: {
                        escola: escola ? escola.nome : '',
                        professor: professor ? professor.nome : '',
                        periodo: turma.periodo,
                        totalAlunos: turma.totalAlunos
                    }
                };
            });

            // Índice de livros
            indicesBusca.livros = (MOCK_DATA.biblioteca?.livros || []).map(livro => ({
                id: livro.id,
                tipo: 'livro',
                titulo: livro.titulo,
                subtitulo: `${livro.autor} - ${livro.editora}`,
                url: `/biblioteca/livro/${livro.id}`,
                icone: 'fa-book',
                termos: [
                    livro.titulo.toLowerCase(),
                    livro.autor.toLowerCase(),
                    livro.editora.toLowerCase(),
                    livro.genero.toLowerCase()
                ],
                metadados: {
                    autor: livro.autor,
                    editora: livro.editora,
                    ano: livro.ano,
                    disponivel: livro.disponivel
                }
            }));

            // Índice de documentos
            indicesBusca.documentos = (MOCK_DATA.documentos || []).map(doc => {
                const aluno = MOCK_DATA.alunos.find(a => a.id === doc.alunoId);
                
                return {
                    id: doc.id,
                    tipo: 'documento',
                    titulo: doc.tipo,
                    subtitulo: `${aluno ? aluno.nome : ''} - ${doc.ano}`,
                    url: `/documentos/${doc.id}`,
                    icone: 'fa-file-alt',
                    termos: [
                        doc.tipo.toLowerCase(),
                        aluno ? aluno.nome.toLowerCase() : '',
                        doc.ano.toString()
                    ],
                    metadados: {
                        aluno: aluno ? aluno.nome : '',
                        ano: doc.ano,
                        validado: doc.validado
                    }
                };
            });
        }

        // ==================== FUNÇÃO PRINCIPAL DE BUSCA ====================
        function buscar(termo, filtros = {}) {
            if (!termo || termo.length < CONFIG.minimoCaracteres) {
                return [];
            }

            const termoLower = termo.toLowerCase();
            let resultados = [];

            // Definir quais índices buscar
            let indicesParaBuscar = filtros.tipos || CONFIG.indices;

            // Buscar em cada índice
            indicesParaBuscar.forEach(tipo => {
                const itens = indicesBusca[tipo] || [];
                
                const encontrados = itens.filter(item => {
                    // Verificar termos
                    const correspondeTermos = item.termos.some(t => 
                        t.includes(termoLower)
                    );

                    if (!correspondeTermos) return false;

                    // Aplicar filtros adicionais
                    return aplicarFiltros(item, filtros);
                });

                // Calcular relevância
                const comRelevancia = encontrados.map(item => ({
                    ...item,
                    relevancia: calcularRelevancia(item, termoLower)
                }));

                resultados = resultados.concat(comRelevancia);
            });

            // Ordenar por relevância
            resultados.sort((a, b) => b.relevancia - a.relevancia);

            // Limitar resultados
            resultados = resultados.slice(0, CONFIG.maxResultados);

            // Registrar busca no histórico
            registrarBusca(termo, resultados.length);

            return resultados;
        }

        function calcularRelevancia(item, termo) {
            let relevancia = 0;

            // Título exato tem maior peso
            if (item.titulo.toLowerCase() === termo) {
                relevancia += 100;
            } else if (item.titulo.toLowerCase().includes(termo)) {
                relevancia += 50;
            }

            // Subtítulo
            if (item.subtitulo && item.subtitulo.toLowerCase().includes(termo)) {
                relevancia += 30;
            }

            // Termos exatos nos metadados
            Object.values(item.metadados || {}).forEach(valor => {
                if (valor && valor.toString().toLowerCase() === termo) {
                    relevancia += 40;
                }
            });

            return relevancia;
        }

        function aplicarFiltros(item, filtros) {
            // Filtrar por escola
            if (filtros.escolaId && item.metadados?.escolaId) {
                if (item.metadados.escolaId !== filtros.escolaId) return false;
            }

            // Filtrar por status
            if (filtros.status && item.metadados?.status) {
                if (item.metadados.status !== filtros.status) return false;
            }

            // Filtrar por data
            if (filtros.dataInicio && item.metadados?.data) {
                const data = new Date(item.metadados.data);
                if (data < new Date(filtros.dataInicio)) return false;
            }

            if (filtros.dataFim && item.metadados?.data) {
                const data = new Date(item.metadados.data);
                if (data > new Date(filtros.dataFim)) return false;
            }

            return true;
        }

        // ==================== INTERFACE DE BUSCA ====================
        function adicionarCampoBusca() {
            const headerLeft = document.querySelector('.header-left');
            if (!headerLeft) return;

            const buscaHTML = `
                <div class="busca-container">
                    <div class="busca-input-wrapper">
                        <i class="fas fa-search busca-icone"></i>
                        <input type="text" class="busca-input" id="busca-global" placeholder="Buscar...">
                        <div class="busca-filtros-btn" id="busca-filtros-btn">
                            <i class="fas fa-sliders-h"></i>
                        </div>
                    </div>
                    <div class="busca-resultados" id="busca-resultados"></div>
                    <div class="busca-filtros-panel" id="busca-filtros-panel">
                        <div class="filtros-header">
                            <h4>Filtros</h4>
                            <button class="btn-link" onclick="MODULO_BUSCA.limparFiltros()">Limpar</button>
                        </div>
                        <div class="filtros-tipos">
                            <label><input type="checkbox" value="alunos" checked> Alunos</label>
                            <label><input type="checkbox" value="professores" checked> Professores</label>
                            <label><input type="checkbox" value="escolas" checked> Escolas</label>
                            <label><input type="checkbox" value="turmas" checked> Turmas</label>
                            <label><input type="checkbox" value="livros" checked> Livros</label>
                            <label><input type="checkbox" value="documentos" checked> Documentos</label>
                        </div>
                        <div class="filtros-status">
                            <select id="filtro-status">
                                <option value="">Todos os status</option>
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                            </select>
                        </div>
                    </div>
                </div>
            `;

            headerLeft.insertAdjacentHTML('beforeend', buscaHTML);

            // Adicionar estilos
            adicionarEstilosBusca();

            // Configurar eventos
            configurarEventosBusca();
        }

        function adicionarEstilosBusca() {
            if (document.getElementById('style-busca')) return;

            const style = document.createElement('style');
            style.id = 'style-busca';
            style.textContent = `
                .busca-container {
                    position: relative;
                    margin-left: 20px;
                    width: 300px;
                }
                
                .busca-input-wrapper {
                    position: relative;
                }
                
                .busca-icone {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #999;
                }
                
                .busca-input {
                    width: 100%;
                    padding: 8px 35px 8px 35px;
                    border: 1px solid #ddd;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    transition: all 0.3s;
                }
                
                .busca-input:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 0 3px rgba(52,152,219,0.1);
                }
                
                .busca-filtros-btn {
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #999;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 50%;
                    transition: all 0.3s;
                }
                
                .busca-filtros-btn:hover {
                    background: #f0f0f0;
                    color: #3498db;
                }
                
                .busca-resultados {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
                    margin-top: 5px;
                    max-height: 400px;
                    overflow-y: auto;
                    display: none;
                    z-index: 1000;
                }
                
                .busca-resultados.ativo {
                    display: block;
                }
                
                .resultado-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 15px;
                    border-bottom: 1px solid #f0f0f0;
                    cursor: pointer;
                    transition: background 0.3s;
                }
                
                .resultado-item:hover {
                    background: #f8f9fa;
                }
                
                .resultado-item.selecionado {
                    background: #e3f0ff;
                }
                
                .resultado-icone {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #f0f0f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 12px;
                    color: white;
                }
                
                .icone-aluno { background: #3498db; }
                .icone-professor { background: #27ae60; }
                .icone-escola { background: #e67e22; }
                .icone-turma { background: #9b59b6; }
                .icone-livro { background: #e74c3c; }
                .icone-documento { background: #1abc9c; }
                
                .resultado-info {
                    flex: 1;
                }
                
                .resultado-titulo {
                    font-weight: 600;
                    color: #2c3e50;
                    margin-bottom: 3px;
                }
                
                .resultado-subtitulo {
                    font-size: 0.85rem;
                    color: #7f8c8d;
                }
                
                .resultado-badge {
                    font-size: 0.7rem;
                    padding: 2px 6px;
                    border-radius: 3px;
                    margin-left: 10px;
                }
                
                .badge-aluno { background: #e8f4fd; color: #3498db; }
                .badge-professor { background: #e1f7e8; color: #27ae60; }
                .badge-escola { background: #feeddb; color: #e67e22; }
                .badge-turma { background: #f0e4fc; color: #9b59b6; }
                .badge-livro { background: #fee4e2; color: #e74c3c; }
                .badge-documento { background: #d9f2f0; color: #1abc9c; }
                
                .resultado-sem-resultados {
                    padding: 30px;
                    text-align: center;
                    color: #999;
                }
                
                .busca-filtros-panel {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    width: 250px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
                    margin-top: 5px;
                    padding: 15px;
                    display: none;
                    z-index: 1000;
                }
                
                .busca-filtros-panel.ativo {
                    display: block;
                }
                
                .filtros-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                
                .filtros-header h4 {
                    margin: 0;
                }
                
                .filtros-tipos {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 15px;
                }
                
                .filtros-tipos label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .historico-buscas {
                    margin-top: 5px;
                    border-top: 1px solid #f0f0f0;
                }
                
                .historico-item {
                    padding: 8px 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                }
                
                .historico-item:hover {
                    background: #f8f9fa;
                }
                
                .historico-item i {
                    color: #999;
                    width: 16px;
                }
                
                .dicas-busca {
                    padding: 10px 15px;
                    background: #f8f9fa;
                    border-radius: 5px;
                    margin: 10px 0;
                    font-size: 0.85rem;
                    color: #666;
                }
                
                .atalhos-busca {
                    display: flex;
                    gap: 15px;
                    padding: 10px 15px;
                    border-top: 1px solid #f0f0f0;
                    font-size: 0.8rem;
                    color: #999;
                }
                
                .atalho {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                
                .atalho kbd {
                    background: #f0f0f0;
                    padding: 2px 6px;
                    border-radius: 3px;
                }
            `;

            document.head.appendChild(style);
        }

        function configurarEventosBusca() {
            const input = document.getElementById('busca-global');
            const resultados = document.getElementById('busca-resultados');
            const filtrosBtn = document.getElementById('busca-filtros-btn');
            const filtrosPanel = document.getElementById('busca-filtros-panel');

            if (!input) return;

            // Busca com debounce
            input.addEventListener('input', (e) => {
                if (timeoutDebounce) clearTimeout(timeoutDebounce);
                
                timeoutDebounce = setTimeout(() => {
                    const termo = e.target.value;
                    if (termo.length >= CONFIG.minimoCaracteres) {
                        const filtros = obterFiltrosAtivos();
                        const resultados = buscar(termo, filtros);
                        exibirResultados(resultados, termo);
                    } else {
                        esconderResultados();
                    }
                }, CONFIG.tempoDebounce);
            });

            // Teclas de atalho
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    esconderResultados();
                    input.blur();
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    navegarResultados('down');
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    navegarResultados('up');
                } else if (e.key === 'Enter') {
                    const selecionado = document.querySelector('.resultado-item.selecionado');
                    if (selecionado) {
                        selecionado.click();
                    }
                }
            });

            // Foco no input com Ctrl+K
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'k') {
                    e.preventDefault();
                    input.focus();
                }
            });

            // Fechar resultados ao clicar fora
            document.addEventListener('click', (e) => {
                if (!input.contains(e.target) && !resultados.contains(e.target)) {
                    esconderResultados();
                }
            });

            // Toggle filtros
            filtrosBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                filtrosPanel?.classList.toggle('ativo');
            });

            // Atualizar resultados quando filtros mudam
            document.querySelectorAll('.filtros-tipos input').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    const termo = input.value;
                    if (termo.length >= CONFIG.minimoCaracteres) {
                        const filtros = obterFiltrosAtivos();
                        const resultados = buscar(termo, filtros);
                        exibirResultados(resultados, termo);
                    }
                });
            });
        }

        function exibirResultados(resultados, termo) {
            const container = document.getElementById('busca-resultados');
            if (!container) return;

            if (resultados.length === 0) {
                container.innerHTML = `
                    <div class="resultado-sem-resultados">
                        <i class="fas fa-search" style="font-size: 2rem; color: #ccc; margin-bottom: 10px;"></i>
                        <p>Nenhum resultado encontrado para "${termo}"</p>
                        <div class="dicas-busca">
                            <strong>Dicas:</strong><br>
                            • Verifique a ortografia<br>
                            • Tente termos mais genéricos<br>
                            • Use palavras-chave diferentes
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = resultados.map((res, index) => `
                    <div class="resultado-item ${index === 0 ? 'selecionado' : ''}" data-url="${res.url}" data-tipo="${res.tipo}">
                        <div class="resultado-icone icone-${res.tipo}">
                            <i class="fas ${res.icone}"></i>
                        </div>
                        <div class="resultado-info">
                            <div class="resultado-titulo">${res.titulo}</div>
                            <div class="resultado-subtitulo">${res.subtitulo}</div>
                        </div>
                        <span class="resultado-badge badge-${res.tipo}">${res.tipo}</span>
                    </div>
                `).join('');

                // Adicionar eventos de clique
                container.querySelectorAll('.resultado-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const url = item.dataset.url;
                        if (url) {
                            navegarParaResultado(url);
                        }
                    });
                });
            }

            // Mostrar histórico também
            if (historicoBuscas.length > 0) {
                container.innerHTML += `
                    <div class="historico-buscas">
                        <div class="historico-item">
                            <i class="fas fa-history"></i>
                            <span>Buscas recentes</span>
                        </div>
                        ${historicoBuscas.slice(0, 3).map(h => `
                            <div class="historico-item" onclick="MODULO_BUSCA.repetirBusca('${h.termo}')">
                                <i class="fas fa-search"></i>
                                <span>${h.termo}</span>
                                <small>${h.resultados} resultados</small>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            container.classList.add('ativo');
        }

        function esconderResultados() {
            const container = document.getElementById('busca-resultados');
            if (container) {
                container.classList.remove('ativo');
            }
        }

        function navegarResultados(direcao) {
            const itens = document.querySelectorAll('.resultado-item');
            if (itens.length === 0) return;

            const selecionado = document.querySelector('.resultado-item.selecionado');
            let index = -1;

            if (selecionado) {
                index = Array.from(itens).indexOf(selecionado);
                selecionado.classList.remove('selecionado');
            }

            if (direcao === 'down') {
                index = (index + 1) % itens.length;
            } else if (direcao === 'up') {
                index = index - 1 < 0 ? itens.length - 1 : index - 1;
            }

            itens[index].classList.add('selecionado');
            itens[index].scrollIntoView({ block: 'nearest' });
        }

        // ==================== FILTROS ====================
        function obterFiltrosAtivos() {
            const filtros = {
                tipos: []
            };

            // Tipos selecionados
            document.querySelectorAll('.filtros-tipos input:checked').forEach(cb => {
                filtros.tipos.push(cb.value);
            });

            // Status
            const status = document.getElementById('filtro-status')?.value;
            if (status) filtros.status = status;

            return filtros;
        }

        function limparFiltros() {
            document.querySelectorAll('.filtros-tipos input').forEach(cb => {
                cb.checked = true;
            });
            document.getElementById('filtro-status').value = '';

            const input = document.getElementById('busca-global');
            if (input && input.value.length >= CONFIG.minimoCaracteres) {
                const resultados = buscar(input.value, obterFiltrosAtivos());
                exibirResultados(resultados, input.value);
            }
        }

        // ==================== HISTÓRICO ====================
        function registrarBusca(termo, numResultados) {
            historicoBuscas.unshift({
                termo: termo,
                resultados: numResultados,
                data: new Date().toISOString()
            });

            // Manter apenas últimos 20
            if (historicoBuscas.length > 20) {
                historicoBuscas = historicoBuscas.slice(0, 20);
            }

            salvarHistorico();
        }

        function repetirBusca(termo) {
            const input = document.getElementById('busca-global');
            if (input) {
                input.value = termo;
                const resultados = buscar(termo, obterFiltrosAtivos());
                exibirResultados(resultados, termo);
            }
        }

        // ==================== FAVORITOS ====================
        function adicionarFavorito(item) {
            if (!favoritos.some(f => f.id === item.id && f.tipo === item.tipo)) {
                favoritos.push({
                    id: item.id,
                    tipo: item.tipo,
                    titulo: item.titulo,
                    url: item.url,
                    icone: item.icone
                });
                salvarFavoritos();
                return true;
            }
            return false;
        }

        function removerFavorito(id, tipo) {
            favoritos = favoritos.filter(f => !(f.id === id && f.tipo === tipo));
            salvarFavoritos();
        }

        function getFavoritos() {
            return favoritos;
        }

        // ==================== PERSISTÊNCIA ====================
        function salvarHistorico() {
            try {
                localStorage.setItem('sme_historico_busca', JSON.stringify(historicoBuscas));
            } catch (e) {
                console.error('Erro ao salvar histórico:', e);
            }
        }

        function carregarHistorico() {
            try {
                const saved = localStorage.getItem('sme_historico_busca');
                if (saved) {
                    historicoBuscas = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar histórico:', e);
            }
        }

        function salvarFavoritos() {
            try {
                localStorage.setItem('sme_favoritos_busca', JSON.stringify(favoritos));
            } catch (e) {
                console.error('Erro ao salvar favoritos:', e);
            }
        }

        function carregarFavoritos() {
            try {
                const saved = localStorage.getItem('sme_favoritos_busca');
                if (saved) {
                    favoritos = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar favoritos:', e);
            }
        }

        // ==================== NAVEGAÇÃO ====================
        function navegarParaResultado(url) {
            // Aqui você implementaria a navegação real
            console.log('Navegando para:', url);
            
            // Esconder resultados
            esconderResultados();
            
            // Mostrar mensagem temporária
            SISTEMA.mostrarMensagem(`Navegando para ${url}`, 'info');
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            buscar,
            adicionarFavorito,
            removerFavorito,
            getFavoritos,
            repetirBusca,
            limparFiltros
        };
    })();

    // Inicializar quando o sistema estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            if (typeof SISTEMA !== 'undefined' && SISTEMA.getEstado().autenticado) {
                MODULO_BUSCA.init();
            }
        }, 2000);
    });

    window.MODULO_BUSCA = MODULO_BUSCA;
    console.log('✅ Módulo de Busca Avançada carregado');
}
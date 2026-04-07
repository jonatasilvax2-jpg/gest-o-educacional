// modulos/api.js - API REST Simulada
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_API === 'undefined') {
    const MODULO_API = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            baseURL: '/api/v1',
            timeout: 5000,
            delaySimulado: 300, // ms
            versao: '1.0.0'
        };

        // ==================== ESTADO ====================
        let interceptors = {
            request: [],
            response: []
        };
        let cache = {};

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('🌐 API REST Simulada inicializada');
            
            // Configurar rotas
            configurarRotas();
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    'API simulada inicializada',
                    MODULO_AUDITORIA.categorias.SISTEMA,
                    MODULO_AUDITORIA.niveis.INFO
                );
            }
        }

        // ==================== CONFIGURAÇÃO DE ROTAS ====================
        function configurarRotas() {
            // Rotas de alunos
            registrarRota('GET', '/alunos', listarAlunos);
            registrarRota('GET', '/alunos/:id', obterAluno);
            registrarRota('POST', '/alunos', criarAluno);
            registrarRota('PUT', '/alunos/:id', atualizarAluno);
            registrarRota('DELETE', '/alunos/:id', deletarAluno);
            
            // Rotas de professores
            registrarRota('GET', '/professores', listarProfessores);
            registrarRota('GET', '/professores/:id', obterProfessor);
            registrarRota('POST', '/professores', criarProfessor);
            registrarRota('PUT', '/professores/:id', atualizarProfessor);
            registrarRota('DELETE', '/professores/:id', deletarProfessor);
            
            // Rotas de escolas
            registrarRota('GET', '/escolas', listarEscolas);
            registrarRota('GET', '/escolas/:id', obterEscola);
            registrarRota('POST', '/escolas', criarEscola);
            registrarRota('PUT', '/escolas/:id', atualizarEscola);
            
            // Rotas de turmas
            registrarRota('GET', '/turmas', listarTurmas);
            registrarRota('GET', '/turmas/:id', obterTurma);
            registrarRota('POST', '/turmas', criarTurma);
            
            // Rotas de notas
            registrarRota('GET', '/notas', listarNotas);
            registrarRota('GET', '/alunos/:alunoId/notas', obterNotasAluno);
            registrarRota('POST', '/notas', criarNota);
            
            // Rotas de frequência
            registrarRota('GET', '/frequencia', listarFrequencia);
            registrarRota('GET', '/alunos/:alunoId/frequencia', obterFrequenciaAluno);
            
            // Rotas de biblioteca
            registrarRota('GET', '/biblioteca/livros', listarLivros);
            registrarRota('GET', '/biblioteca/livros/:id', obterLivro);
            registrarRota('POST', '/biblioteca/emprestimos', criarEmprestimo);
            
            // Rotas de autenticação
            registrarRota('POST', '/auth/login', login);
            registrarRota('POST', '/auth/logout', logout);
            registrarRota('GET', '/auth/me', obterUsuarioAtual);
            
            // Rotas de relatórios
            registrarRota('GET', '/relatorios/alunos', relatorioAlunos);
            registrarRota('GET', '/relatorios/desempenho', relatorioDesempenho);
            registrarRota('GET', '/relatorios/frequencia', relatorioFrequencia);
        }

        // ==================== REGISTRO DE ROTAS ====================
        const rotas = [];

        function registrarRota(metodo, path, handler) {
            rotas.push({
                metodo,
                path,
                handler,
                regex: pathToRegex(path),
                params: extractParams(path)
            });
        }

        function pathToRegex(path) {
            const pattern = path.replace(/:([^/]+)/g, '([^/]+)');
            return new RegExp(`^${pattern}$`);
        }

        function extractParams(path) {
            const matches = path.match(/:([^/]+)/g) || [];
            return matches.map(p => p.substring(1));
        }

        // ==================== FUNÇÃO PRINCIPAL DE REQUISIÇÃO ====================
        async function request(endpoint, options = {}) {
            const metodo = options.method || 'GET';
            const url = typeof endpoint === 'string' ? endpoint : endpoint.url;
            const corpo = options.body || options.data;

            try {
                // Aplicar interceptors de request
                let config = { metodo, url, corpo, headers: options.headers || {} };
                for (const interceptor of interceptors.request) {
                    config = await interceptor(config);
                }

                // Simular delay de rede
                await delay(CONFIG.delaySimulado);

                // Encontrar rota correspondente
                const rota = encontrarRota(metodo, url);
                
                if (!rota) {
                    throw new Error(`Rota não encontrada: ${metodo} ${url}`);
                }

                // Extrair parâmetros da URL
                const params = extrairParametros(rota, url);

                // Executar handler
                let resultado = await rota.handler({
                    params,
                    query: parseQueryString(url),
                    body: corpo,
                    headers: config.headers
                });

                // Aplicar interceptors de response
                for (const interceptor of interceptors.response) {
                    resultado = await interceptor(resultado);
                }

                return resultado;

            } catch (erro) {
                console.error('Erro na requisição API:', erro);
                
                return {
                    sucesso: false,
                    erro: erro.message,
                    status: erro.status || 500
                };
            }
        }

        function encontrarRota(metodo, url) {
            const path = url.split('?')[0];
            return rotas.find(r => 
                r.metodo === metodo && r.regex.test(path)
            );
        }

        function extrairParametros(rota, url) {
            const path = url.split('?')[0];
            const matches = path.match(rota.regex);
            
            if (!matches) return {};

            const params = {};
            rota.params.forEach((param, index) => {
                params[param] = matches[index + 1];
            });

            return params;
        }

        function parseQueryString(url) {
            const query = {};
            const queryString = url.split('?')[1];
            
            if (queryString) {
                queryString.split('&').forEach(pair => {
                    const [key, value] = pair.split('=');
                    query[key] = decodeURIComponent(value || '');
                });
            }
            
            return query;
        }

        // ==================== INTERCEPTORS ====================
        function addRequestInterceptor(interceptor) {
            interceptors.request.push(interceptor);
        }

        function addResponseInterceptor(interceptor) {
            interceptors.response.push(interceptor);
        }

        // ==================== MÉTODOS HTTP ====================
        async function get(url, options = {}) {
            return request(url, { ...options, method: 'GET' });
        }

        async function post(url, data, options = {}) {
            return request(url, { ...options, method: 'POST', body: data });
        }

        async function put(url, data, options = {}) {
            return request(url, { ...options, method: 'PUT', body: data });
        }

        async function del(url, options = {}) {
            return request(url, { ...options, method: 'DELETE' });
        }

        // ==================== HANDLERS DE ROTAS ====================
        async function listarAlunos({ query }) {
            let alunos = [...(MOCK_DATA.alunos || [])];
            
            // Aplicar filtros
            if (query.turma) {
                alunos = alunos.filter(a => a.turma === query.turma);
            }
            
            if (query.status) {
                alunos = alunos.filter(a => a.status === query.status);
            }
            
            if (query.busca) {
                const termo = query.busca.toLowerCase();
                alunos = alunos.filter(a => 
                    a.nome.toLowerCase().includes(termo) ||
                    a.matricula.includes(termo)
                );
            }

            // Paginação
            const pagina = parseInt(query.pagina) || 1;
            const limite = parseInt(query.limite) || 10;
            const inicio = (pagina - 1) * limite;
            const total = alunos.length;
            
            alunos = alunos.slice(inicio, inicio + limite);

            return {
                sucesso: true,
                dados: alunos,
                paginacao: {
                    pagina,
                    limite,
                    total,
                    totalPaginas: Math.ceil(total / limite)
                }
            };
        }

        async function obterAluno({ params }) {
            const aluno = (MOCK_DATA.alunos || []).find(a => a.id === parseInt(params.id));
            
            if (!aluno) {
                throw { status: 404, message: 'Aluno não encontrado' };
            }

            return {
                sucesso: true,
                dados: aluno
            };
        }

        async function criarAluno({ body }) {
            const novoAluno = {
                id: Date.now(),
                ...body,
                dataCadastro: new Date().toISOString()
            };

            if (!MOCK_DATA.alunos) MOCK_DATA.alunos = [];
            MOCK_DATA.alunos.push(novoAluno);

            return {
                sucesso: true,
                dados: novoAluno,
                mensagem: 'Aluno criado com sucesso'
            };
        }

        async function atualizarAluno({ params, body }) {
            const index = (MOCK_DATA.alunos || []).findIndex(a => a.id === parseInt(params.id));
            
            if (index === -1) {
                throw { status: 404, message: 'Aluno não encontrado' };
            }

            MOCK_DATA.alunos[index] = {
                ...MOCK_DATA.alunos[index],
                ...body,
                id: parseInt(params.id)
            };

            return {
                sucesso: true,
                dados: MOCK_DATA.alunos[index],
                mensagem: 'Aluno atualizado com sucesso'
            };
        }

        async function deletarAluno({ params }) {
            const index = (MOCK_DATA.alunos || []).findIndex(a => a.id === parseInt(params.id));
            
            if (index === -1) {
                throw { status: 404, message: 'Aluno não encontrado' };
            }

            MOCK_DATA.alunos.splice(index, 1);

            return {
                sucesso: true,
                mensagem: 'Aluno deletado com sucesso'
            };
        }

        async function listarProfessores({ query }) {
            let professores = [...(MOCK_DATA.professores || [])];
            
            if (query.disciplina) {
                professores = professores.filter(p => p.disciplina === query.disciplina);
            }

            return {
                sucesso: true,
                dados: professores
            };
        }

        async function obterProfessor({ params }) {
            const professor = (MOCK_DATA.professores || []).find(p => p.id === parseInt(params.id));
            
            if (!professor) {
                throw { status: 404, message: 'Professor não encontrado' };
            }

            return {
                sucesso: true,
                dados: professor
            };
        }

        async function criarProfessor({ body }) {
            const novoProfessor = {
                id: Date.now(),
                ...body,
                dataCadastro: new Date().toISOString()
            };

            if (!MOCK_DATA.professores) MOCK_DATA.professores = [];
            MOCK_DATA.professores.push(novoProfessor);

            return {
                sucesso: true,
                dados: novoProfessor
            };
        }

        async function listarEscolas() {
            return {
                sucesso: true,
                dados: MOCK_DATA.escolas || []
            };
        }

        async function obterEscola({ params }) {
            const escola = (MOCK_DATA.escolas || []).find(e => e.id === parseInt(params.id));
            
            if (!escola) {
                throw { status: 404, message: 'Escola não encontrada' };
            }

            return {
                sucesso: true,
                dados: escola
            };
        }

        async function listarTurmas({ query }) {
            let turmas = [...(MOCK_DATA.turmas || [])];
            
            if (query.escolaId) {
                turmas = turmas.filter(t => t.escolaId === parseInt(query.escolaId));
            }

            return {
                sucesso: true,
                dados: turmas
            };
        }

        async function obterNotasAluno({ params }) {
            const notas = (MOCK_DATA.notas || []).filter(n => n.alunoId === parseInt(params.alunoId));
            
            return {
                sucesso: true,
                dados: notas
            };
        }

        async function criarNota({ body }) {
            const novaNota = {
                id: Date.now(),
                ...body
            };

            if (!MOCK_DATA.notas) MOCK_DATA.notas = [];
            MOCK_DATA.notas.push(novaNota);

            return {
                sucesso: true,
                dados: novaNota
            };
        }

        async function listarLivros({ query }) {
            let livros = [...(MOCK_DATA.biblioteca?.livros || [])];
            
            if (query.genero) {
                livros = livros.filter(l => l.genero === query.genero);
            }

            return {
                sucesso: true,
                dados: livros
            };
        }

        async function criarEmprestimo({ body }) {
            const emprestimo = {
                id: Date.now(),
                ...body,
                dataEmprestimo: new Date().toISOString(),
                status: 'ativo'
            };

            if (!MOCK_DATA.biblioteca) MOCK_DATA.biblioteca = {};
            if (!MOCK_DATA.biblioteca.emprestimos) MOCK_DATA.biblioteca.emprestimos = [];
            
            MOCK_DATA.biblioteca.emprestimos.push(emprestimo);

            return {
                sucesso: true,
                dados: emprestimo
            };
        }

        async function login({ body }) {
            const { email, senha } = body;
            
            const usuario = (MOCK_DATA.usuarios || []).find(u => 
                u.email === email && u.senha === senha
            );

            if (!usuario) {
                throw { status: 401, message: 'Credenciais inválidas' };
            }

            // Gerar token simulado
            const token = btoa(JSON.stringify({
                id: usuario.id,
                email: usuario.email,
                exp: Date.now() + 24 * 60 * 60 * 1000
            }));

            return {
                sucesso: true,
                dados: {
                    usuario: {
                        id: usuario.id,
                        nome: usuario.nome,
                        email: usuario.email,
                        perfil: usuario.perfil
                    },
                    token
                }
            };
        }

        async function obterUsuarioAtual({ headers }) {
            const token = headers.Authorization?.replace('Bearer ', '');
            
            if (!token) {
                throw { status: 401, message: 'Não autorizado' };
            }

            try {
                const payload = JSON.parse(atob(token));
                const usuario = (MOCK_DATA.usuarios || []).find(u => u.id === payload.id);
                
                if (!usuario) {
                    throw new Error('Usuário não encontrado');
                }

                return {
                    sucesso: true,
                    dados: usuario
                };
            } catch (erro) {
                throw { status: 401, message: 'Token inválido' };
            }
        }

        async function relatorioAlunos({ query }) {
            const alunos = MOCK_DATA.alunos || [];
            
            const estatisticas = {
                total: alunos.length,
                ativos: alunos.filter(a => a.status === 'ativo').length,
                inativos: alunos.filter(a => a.status === 'inativo').length,
                porTurma: {},
                porIdade: {}
            };

            alunos.forEach(aluno => {
                // Por turma
                estatisticas.porTurma[aluno.turma] = (estatisticas.porTurma[aluno.turma] || 0) + 1;
            });

            return {
                sucesso: true,
                dados: estatisticas
            };
        }

        async function relatorioDesempenho() {
            const notas = MOCK_DATA.notas || [];
            
            const estatisticas = {
                mediaGeral: 0,
                porDisciplina: {},
                aprovados: 0,
                recuperacao: 0,
                reprovados: 0
            };

            if (notas.length > 0) {
                const soma = notas.reduce((acc, n) => acc + n.media, 0);
                estatisticas.mediaGeral = (soma / notas.length).toFixed(2);

                notas.forEach(n => {
                    estatisticas.porDisciplina[n.disciplina] = {
                        media: (estatisticas.porDisciplina[n.disciplina]?.media || 0) + n.media,
                        count: (estatisticas.porDisciplina[n.disciplina]?.count || 0) + 1
                    };

                    if (n.media >= 7) estatisticas.aprovados++;
                    else if (n.media >= 5) estatisticas.recuperacao++;
                    else estatisticas.reprovados++;
                });

                // Calcular média por disciplina
                Object.keys(estatisticas.porDisciplina).forEach(disp => {
                    const d = estatisticas.porDisciplina[disp];
                    d.media = (d.media / d.count).toFixed(2);
                });
            }

            return {
                sucesso: true,
                dados: estatisticas
            };
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            request,
            get,
            post,
            put,
            delete: del,
            addRequestInterceptor,
            addResponseInterceptor
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_API.init();
        }, 4000);
    });

    window.MODULO_API = MODULO_API;
    console.log('✅ Módulo de API REST Simulada carregado');
}
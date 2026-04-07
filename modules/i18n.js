// modulos/i18n.js - Sistema Multi-idioma
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_I18N === 'undefined') {
    const MODULO_I18N = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            idiomaPadrao: 'pt-BR',
            idiomasDisponiveis: ['pt-BR', 'en-US', 'es-ES'],
            localStorageKey: 'sme_idioma'
        };

        // ==================== TRADUÇÕES ====================
        const traducoes = {
            'pt-BR': {
                // Geral
                'app.nome': 'Sistema de Gestão Educacional Municipal',
                'app.carregando': 'Carregando...',
                'app.erro': 'Erro',
                'app.sucesso': 'Sucesso',
                'app.aviso': 'Aviso',
                'app.info': 'Informação',
                
                // Menu
                'menu.dashboard': 'Dashboard',
                'menu.escolas': 'Escolas',
                'menu.professores': 'Professores',
                'menu.alunos': 'Alunos',
                'menu.turmas': 'Turmas',
                'menu.biblioteca': 'Biblioteca',
                'menu.merenda': 'Merenda',
                'menu.transporte': 'Transporte',
                'menu.ocorrencias': 'Ocorrências',
                'menu.reunioes': 'Reuniões',
                'menu.projetos': 'Projetos',
                'menu.saude': 'Saúde',
                'menu.bolsas': 'Bolsas',
                'menu.estagio': 'Estágio',
                'menu.monitoria': 'Monitoria',
                'menu.competicoes': 'Competições',
                'menu.horas': 'Horas Complementares',
                'menu.pesquisas': 'Pesquisas',
                'menu.documentos': 'Documentos',
                'menu.uniforme': 'Uniforme',
                'menu.cursos': 'Cursos',
                'menu.feedback': 'Feedback',
                'menu.relatorios': 'Relatórios',
                'menu.perfil': 'Meu Perfil',
                
                // Ações
                'acao.salvar': 'Salvar',
                'acao.cancelar': 'Cancelar',
                'acao.editar': 'Editar',
                'acao.excluir': 'Excluir',
                'acao.visualizar': 'Visualizar',
                'acao.adicionar': 'Adicionar',
                'acao.buscar': 'Buscar',
                'acao.filtrar': 'Filtrar',
                'acao.exportar': 'Exportar',
                'acao.imprimir': 'Imprimir',
                'acao.voltar': 'Voltar',
                'acao.confirmar': 'Confirmar',
                
                // Login
                'login.titulo': 'Entrar no Sistema',
                'login.usuario': 'Usuário',
                'login.senha': 'Senha',
                'login.perfil': 'Perfil',
                'login.entrar': 'Entrar',
                'login.esqueceu': 'Esqueceu a senha?',
                'login.demo': 'Credenciais de Demonstração',
                
                // Dashboard
                'dashboard.bemvindo': 'Bem-vindo(a)',
                'dashboard.estatisticas': 'Estatísticas',
                'dashboard.acoesrapidas': 'Ações Rápidas',
                'dashboard.atividades': 'Atividades Recentes',
                
                // Alunos
                'alunos.titulo': 'Alunos',
                'alunos.nome': 'Nome',
                'alunos.matricula': 'Matrícula',
                'alunos.turma': 'Turma',
                'alunos.responsavel': 'Responsável',
                'alunos.telefone': 'Telefone',
                'alunos.media': 'Média',
                'alunos.faltas': 'Faltas',
                'alunos.status': 'Status',
                
                // Professores
                'professores.titulo': 'Professores',
                'professores.nome': 'Nome',
                'professores.email': 'E-mail',
                'professores.disciplina': 'Disciplina',
                'professores.formacao': 'Formação',
                
                // Escolas
                'escolas.titulo': 'Escolas',
                'escolas.nome': 'Nome',
                'escolas.endereco': 'Endereço',
                'escolas.telefone': 'Telefone',
                'escolas.diretor': 'Diretor',
                
                // Mensagens
                'msg.operacao_sucesso': 'Operação realizada com sucesso!',
                'msg.operacao_erro': 'Erro ao realizar operação.',
                'msg.confirmar_exclusao': 'Deseja realmente excluir este item?',
                'msg.campos_obrigatorios': 'Preencha todos os campos obrigatórios.',
                
                // Períodos
                'periodo.manha': 'Manhã',
                'periodo.tarde': 'Tarde',
                'periodo.noite': 'Noite',
                
                // Status
                'status.ativo': 'Ativo',
                'status.inativo': 'Inativo',
                'status.pendente': 'Pendente',
                'status.concluido': 'Concluído'
            },
            
            'en-US': {
                // General
                'app.nome': 'Municipal Educational Management System',
                'app.carregando': 'Loading...',
                'app.erro': 'Error',
                'app.sucesso': 'Success',
                'app.aviso': 'Warning',
                'app.info': 'Information',
                
                // Menu
                'menu.dashboard': 'Dashboard',
                'menu.escolas': 'Schools',
                'menu.professores': 'Teachers',
                'menu.alunos': 'Students',
                'menu.turmas': 'Classes',
                'menu.biblioteca': 'Library',
                'menu.merenda': 'School Meals',
                'menu.transporte': 'Transport',
                'menu.ocorrencias': 'Occurrences',
                'menu.reunioes': 'Meetings',
                'menu.projetos': 'Projects',
                'menu.saude': 'Health',
                'menu.bolsas': 'Scholarships',
                'menu.estagio': 'Internship',
                'menu.monitoria': 'Monitoring',
                'menu.competicoes': 'Competitions',
                'menu.horas': 'Complementary Hours',
                'menu.pesquisas': 'Research',
                'menu.documentos': 'Documents',
                'menu.uniforme': 'Uniform',
                'menu.cursos': 'Courses',
                'menu.feedback': 'Feedback',
                'menu.relatorios': 'Reports',
                'menu.perfil': 'My Profile',
                
                // Actions
                'acao.salvar': 'Save',
                'acao.cancelar': 'Cancel',
                'acao.editar': 'Edit',
                'acao.excluir': 'Delete',
                'acao.visualizar': 'View',
                'acao.adicionar': 'Add',
                'acao.buscar': 'Search',
                'acao.filtrar': 'Filter',
                'acao.exportar': 'Export',
                'acao.imprimir': 'Print',
                'acao.voltar': 'Back',
                'acao.confirmar': 'Confirm',
                
                // Login
                'login.titulo': 'Login',
                'login.usuario': 'Username',
                'login.senha': 'Password',
                'login.perfil': 'Profile',
                'login.entrar': 'Sign In',
                'login.esqueceu': 'Forgot password?',
                'login.demo': 'Demo Credentials',
                
                // Dashboard
                'dashboard.bemvindo': 'Welcome',
                'dashboard.estatisticas': 'Statistics',
                'dashboard.acoesrapidas': 'Quick Actions',
                'dashboard.atividades': 'Recent Activities',
                
                // Students
                'alunos.titulo': 'Students',
                'alunos.nome': 'Name',
                'alunos.matricula': 'Registration',
                'alunos.turma': 'Class',
                'alunos.responsavel': 'Guardian',
                'alunos.telefone': 'Phone',
                'alunos.media': 'Average',
                'alunos.faltas': 'Absences',
                'alunos.status': 'Status',
                
                // Teachers
                'professores.titulo': 'Teachers',
                'professores.nome': 'Name',
                'professores.email': 'Email',
                'professores.disciplina': 'Subject',
                'professores.formacao': 'Education',
                
                // Schools
                'escolas.titulo': 'Schools',
                'escolas.nome': 'Name',
                'escolas.endereco': 'Address',
                'escolas.telefone': 'Phone',
                'escolas.diretor': 'Principal',
                
                // Messages
                'msg.operacao_sucesso': 'Operation completed successfully!',
                'msg.operacao_erro': 'Error performing operation.',
                'msg.confirmar_exclusao': 'Are you sure you want to delete this item?',
                'msg.campos_obrigatorios': 'Please fill in all required fields.',
                
                // Periods
                'periodo.manha': 'Morning',
                'periodo.tarde': 'Afternoon',
                'periodo.noite': 'Evening',
                
                // Status
                'status.ativo': 'Active',
                'status.inativo': 'Inactive',
                'status.pendente': 'Pending',
                'status.concluido': 'Completed'
            },
            
            'es-ES': {
                // General
                'app.nome': 'Sistema Municipal de Gestión Educativa',
                'app.carregando': 'Cargando...',
                'app.erro': 'Error',
                'app.sucesso': 'Éxito',
                'app.aviso': 'Aviso',
                'app.info': 'Información',
                
                // Menu
                'menu.dashboard': 'Panel',
                'menu.escolas': 'Escuelas',
                'menu.professores': 'Profesores',
                'menu.alunos': 'Estudiantes',
                'menu.turmas': 'Clases',
                'menu.biblioteca': 'Biblioteca',
                'menu.merenda': 'Comedor',
                'menu.transporte': 'Transporte',
                'menu.ocorrencias': 'Incidencias',
                'menu.reunioes': 'Reuniones',
                'menu.projetos': 'Proyectos',
                'menu.saude': 'Salud',
                'menu.bolsas': 'Becas',
                'menu.estagio': 'Prácticas',
                'menu.monitoria': 'Monitoría',
                'menu.competicoes': 'Competiciones',
                'menu.horas': 'Horas Complementarias',
                'menu.pesquisas': 'Investigaciones',
                'menu.documentos': 'Documentos',
                'menu.uniforme': 'Uniforme',
                'menu.cursos': 'Cursos',
                'menu.feedback': 'Feedback',
                'menu.relatorios': 'Informes',
                'menu.perfil': 'Mi Perfil',
                
                // Actions
                'acao.salvar': 'Guardar',
                'acao.cancelar': 'Cancelar',
                'acao.editar': 'Editar',
                'acao.excluir': 'Eliminar',
                'acao.visualizar': 'Ver',
                'acao.adicionar': 'Añadir',
                'acao.buscar': 'Buscar',
                'acao.filtrar': 'Filtrar',
                'acao.exportar': 'Exportar',
                'acao.imprimir': 'Imprimir',
                'acao.voltar': 'Volver',
                'acao.confirmar': 'Confirmar',
                
                // Login
                'login.titulo': 'Iniciar Sesión',
                'login.usuario': 'Usuario',
                'login.senha': 'Contraseña',
                'login.perfil': 'Perfil',
                'login.entrar': 'Entrar',
                'login.esqueceu': '¿Olvidó su contraseña?',
                'login.demo': 'Credenciales de Demostración',
                
                // Dashboard
                'dashboard.bemvindo': 'Bienvenido(a)',
                'dashboard.estatisticas': 'Estadísticas',
                'dashboard.acoesrapidas': 'Acciones Rápidas',
                'dashboard.atividades': 'Actividades Recientes',
                
                // Students
                'alunos.titulo': 'Estudiantes',
                'alunos.nome': 'Nombre',
                'alunos.matricula': 'Matrícula',
                'alunos.turma': 'Clase',
                'alunos.responsavel': 'Responsable',
                'alunos.telefone': 'Teléfono',
                'alunos.media': 'Promedio',
                'alunos.faltas': 'Faltas',
                'alunos.status': 'Estado',
                
                // Teachers
                'professores.titulo': 'Profesores',
                'professores.nome': 'Nombre',
                'professores.email': 'Email',
                'professores.disciplina': 'Asignatura',
                'professores.formacao': 'Formación',
                
                // Schools
                'escolas.titulo': 'Escuelas',
                'escolas.nome': 'Nombre',
                'escolas.endereco': 'Dirección',
                'escolas.telefone': 'Teléfono',
                'escolas.diretor': 'Director',
                
                // Messages
                'msg.operacao_sucesso': '¡Operación realizada con éxito!',
                'msg.operacao_erro': 'Error al realizar la operación.',
                'msg.confirmar_exclusao': '¿Está seguro de eliminar este elemento?',
                'msg.campos_obrigatorios': 'Complete todos los campos obligatorios.',
                
                // Periods
                'periodo.manha': 'Mañana',
                'periodo.tarde': 'Tarde',
                'periodo.noite': 'Noche',
                
                // Status
                'status.ativo': 'Activo',
                'status.inativo': 'Inactivo',
                'status.pendente': 'Pendiente',
                'status.concluido': 'Completado'
            }
        };

        // ==================== ESTADO ====================
        let idiomaAtual = CONFIG.idiomaPadrao;
        let observers = [];

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('🌍 Sistema Multi-idioma inicializado');
            
            // Carregar idioma salvo
            carregarIdioma();
            
            // Detectar idioma do navegador
            if (!idiomaSalvo()) {
                detectarIdiomaNavegador();
            }
        }

        // ==================== FUNÇÕES PRINCIPAIS ====================
        function t(chave, params = {}) {
            const traducao = traducoes[idiomaAtual]?.[chave] || traducoes['pt-BR'][chave] || chave;
            
            // Substituir parâmetros
            return traducao.replace(/\{(\w+)\}/g, (match, key) => {
                return params[key] !== undefined ? params[key] : match;
            });
        }

        function setIdioma(idioma) {
            if (!CONFIG.idiomasDisponiveis.includes(idioma)) {
                console.warn(`Idioma não suportado: ${idioma}`);
                return false;
            }

            idiomaAtual = idioma;
            salvarIdioma(idioma);
            
            // Notificar observers
            notificarObservers();
            
            // Atualizar interface
            atualizarInterface();
            
            return true;
        }

        function getIdioma() {
            return idiomaAtual;
        }

        function getIdiomasDisponiveis() {
            return CONFIG.idiomasDisponiveis.map(codigo => ({
                codigo,
                nome: obterNomeIdioma(codigo)
            }));
        }

        function obterNomeIdioma(codigo) {
            const nomes = {
                'pt-BR': 'Português',
                'en-US': 'English',
                'es-ES': 'Español'
            };
            return nomes[codigo] || codigo;
        }

        // ==================== DETECÇÃO ====================
        function detectarIdiomaNavegador() {
            const langs = navigator.languages || [navigator.language];
            
            for (const lang of langs) {
                const codigo = lang.split('-')[0];
                
                if (codigo === 'pt') {
                    setIdioma('pt-BR');
                    return;
                } else if (codigo === 'en') {
                    setIdioma('en-US');
                    return;
                } else if (codigo === 'es') {
                    setIdioma('es-ES');
                    return;
                }
            }
        }

        // ==================== INTERFACE ====================
        function adicionarSeletorIdioma() {
            const headerRight = document.querySelector('.header-right');
            if (!headerRight) return;

            const seletorHTML = `
                <div class="idioma-dropdown">
                    <button class="btn-icon" id="idioma-toggle" title="Idioma">
                        <i class="fas fa-globe"></i>
                        <span class="idioma-atual">${obterNomeIdioma(idiomaAtual)}</span>
                    </button>
                    <div class="idioma-painel" id="idioma-painel">
                        ${CONFIG.idiomasDisponiveis.map(codigo => `
                            <div class="idioma-opcao ${codigo === idiomaAtual ? 'ativo' : ''}" 
                                 onclick="MODULO_I18N.setIdioma('${codigo}')">
                                <span class="idioma-nome">${obterNomeIdioma(codigo)}</span>
                                <span class="idioma-codigo">${codigo}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            headerRight.insertAdjacentHTML('afterbegin', seletorHTML);

            // Adicionar estilos
            adicionarEstilosIdioma();

            // Configurar eventos
            document.getElementById('idioma-toggle')?.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('idioma-painel')?.classList.toggle('ativo');
            });

            document.addEventListener('click', (e) => {
                const painel = document.getElementById('idioma-painel');
                const toggle = document.getElementById('idioma-toggle');
                
                if (painel && toggle && !toggle.contains(e.target) && !painel.contains(e.target)) {
                    painel.classList.remove('ativo');
                }
            });
        }

        function adicionarEstilosIdioma() {
            if (document.getElementById('style-i18n')) return;

            const style = document.createElement('style');
            style.id = 'style-i18n';
            style.textContent = `
                .idioma-dropdown {
                    position: relative;
                }
                
                .idioma-atual {
                    margin-left: 5px;
                    font-size: 0.9rem;
                }
                
                .idioma-painel {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    width: 180px;
                    background: var(--tema-surface);
                    border: 1px solid var(--tema-border);
                    border-radius: 8px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
                    margin-top: 10px;
                    display: none;
                    z-index: 1000;
                }
                
                .idioma-painel.ativo {
                    display: block;
                }
                
                .idioma-opcao {
                    padding: 10px 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    transition: background 0.3s;
                }
                
                .idioma-opcao:hover {
                    background: var(--tema-cardHover);
                }
                
                .idioma-opcao.ativo {
                    background: var(--tema-primary);
                    color: white;
                }
                
                .idioma-opcao.ativo .idioma-codigo {
                    color: rgba(255,255,255,0.8);
                }
                
                .idioma-nome {
                    font-weight: 500;
                }
                
                .idioma-codigo {
                    font-size: 0.8rem;
                    color: var(--tema-textSecondary);
                }
            `;

            document.head.appendChild(style);
        }

        function atualizarInterface() {
            // Atualizar texto do seletor
            const span = document.querySelector('.idioma-atual');
            if (span) {
                span.textContent = obterNomeIdioma(idiomaAtual);
            }

            // Atualizar classes das opções
            document.querySelectorAll('.idioma-opcao').forEach(opt => {
                opt.classList.remove('ativo');
            });

            const opcaoAtiva = document.querySelector(`.idioma-opcao[onclick*="'${idiomaAtual}'"]`);
            if (opcaoAtiva) {
                opcaoAtiva.classList.add('ativo');
            }

            // Disparar evento de mudança de idioma
            document.dispatchEvent(new CustomEvent('idiomaChange', { 
                detail: { idioma: idiomaAtual } 
            }));
        }

        // ==================== OBSERVERS ====================
        function observar(callback) {
            observers.push(callback);
            
            // Chamar imediatamente com idioma atual
            callback(idiomaAtual);
            
            return () => {
                observers = observers.filter(cb => cb !== callback);
            };
        }

        function notificarObservers() {
            observers.forEach(cb => {
                try {
                    cb(idiomaAtual);
                } catch (e) {
                    console.error('Erro ao notificar observer:', e);
                }
            });
        }

        // ==================== PERSISTÊNCIA ====================
        function salvarIdioma(idioma) {
            try {
                localStorage.setItem(CONFIG.localStorageKey, idioma);
            } catch (e) {
                console.error('Erro ao salvar idioma:', e);
            }
        }

        function carregarIdioma() {
            try {
                const saved = localStorage.getItem(CONFIG.localStorageKey);
                if (saved && CONFIG.idiomasDisponiveis.includes(saved)) {
                    idiomaAtual = saved;
                }
            } catch (e) {
                console.error('Erro ao carregar idioma:', e);
            }
        }

        function idiomaSalvo() {
            return !!localStorage.getItem(CONFIG.localStorageKey);
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            t,
            setIdioma,
            getIdioma,
            getIdiomasDisponiveis,
            adicionarSeletorIdioma,
            observar
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_I18N.init();
            
            // Adicionar seletor após outros elementos
            setTimeout(() => {
                MODULO_I18N.adicionarSeletorIdioma();
            }, 500);
        }, 4500);
    });

    window.MODULO_I18N = MODULO_I18N;
    console.log('✅ Módulo Multi-idioma carregado');
}
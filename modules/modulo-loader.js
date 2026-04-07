// modulos/modulo-loader.js - Gerenciador de Carregamento de Módulos
// VERSÃO ULTRA-ESTÁVEL - SEM RECURSÃO INFINITA

if (typeof MODULO_LOADER === 'undefined') {
    const MODULO_LOADER = (function() {
        'use strict';

        // ==================== CONTROLE DE RECURSÃO ====================
        const _stackControl = {
            emExecucao: false,
            profundidade: 0,
            maxProfundidade: 5,
            ultimaChamada: null,
            chamadasPorSegundo: {}
        };

        // Cache global para resultados
        const _cache = new Map();

        // ==================== MAPA DE TODOS OS MÓDULOS (58) ====================
        const modulos = {
            // FASE 1 - BÁSICOS (24)
            SECRETARIA: { nome: 'MODULO_SECRETARIA', carregado: false },
            DIRETOR: { nome: 'MODULO_DIRETOR', carregado: false },
            PROFESSOR: { nome: 'MODULO_PROFESSOR', carregado: false },
            ALUNO: { nome: 'MODULO_ALUNO', carregado: false },
            BIBLIOTECA: { nome: 'MODULO_BIBLIOTECA', carregado: false },
            MERENDA: { nome: 'MODULO_MERENDA', carregado: false },
            TRANSPORTE: { nome: 'MODULO_TRANSPORTE', carregado: false },
            OCORRENCIAS: { nome: 'MODULO_OCORRENCIAS', carregado: false },
            COMUNICACAO: { nome: 'MODULO_COMUNICACAO', carregado: false },
            ATIVIDADES: { nome: 'MODULO_ATIVIDADES', carregado: false },
            VAGAS: { nome: 'MODULO_VAGAS', carregado: false },
            REUNIOES: { nome: 'MODULO_REUNIOES', carregado: false },
            PROJETOS: { nome: 'MODULO_PROJETOS', carregado: false },
            SAUDE: { nome: 'MODULO_SAUDE', carregado: false },
            BOLSAS: { nome: 'MODULO_BOLSAS', carregado: false },
            ESTAGIO: { nome: 'MODULO_ESTAGIO', carregado: false },
            MONITORIA: { nome: 'MODULO_MONITORIA', carregado: false },
            COMPETICOES: { nome: 'MODULO_COMPETICOES', carregado: false },
            HORAS: { nome: 'MODULO_HORAS', carregado: false },
            PESQUISAS: { nome: 'MODULO_PESQUISAS', carregado: false },
            DOCUMENTOS: { nome: 'MODULO_DOCUMENTOS', carregado: false },
            UNIFORME: { nome: 'MODULO_UNIFORME', carregado: false },
            CURSOS: { nome: 'MODULO_CURSOS', carregado: false },
            FEEDBACK: { nome: 'MODULO_FEEDBACK', carregado: false },
            RELATORIOS: { nome: 'MODULO_RELATORIOS', carregado: false },
            
            // FASE 2 - MELHORIAS (7)
            NOTIFICACOES: { nome: 'MODULO_NOTIFICACOES', carregado: false },
            GRAFICOS: { nome: 'MODULO_GRAFICOS', carregado: false },
            BUSCA: { nome: 'MODULO_BUSCA', carregado: false },
            TEMAS: { nome: 'MODULO_TEMAS', carregado: false },
            PWA: { nome: 'MODULO_PWA', carregado: false },
            EXPORTACAO: { nome: 'MODULO_EXPORTACAO', carregado: false },
            BACKUP: { nome: 'MODULO_BACKUP', carregado: false },
            
            // FASE 3 - AVANÇADOS (7)
            AUDITORIA: { nome: 'MODULO_AUDITORIA', carregado: false },
            DOISFA: { nome: 'MODULO_2FA', carregado: false },
            API: { nome: 'MODULO_API', carregado: false },
            I18N: { nome: 'MODULO_I18N', carregado: false },
            ACESSIBILIDADE: { nome: 'MODULO_ACESSIBILIDADE', carregado: false },
            CACHE: { nome: 'MODULO_CACHE', carregado: false },
            DASHBOARD_CUSTOM: { nome: 'MODULO_DASHBOARD_CUSTOM', carregado: false },
            
            // FASE 4 - IA (4)
            IA_PREVISAO: { nome: 'MODULO_IA_PREVISAO', carregado: false },
            IA_RECOMENDACAO: { nome: 'MODULO_IA_RECOMENDACAO', carregado: false },
            IA_EVASAO: { nome: 'MODULO_IA_EVASAO', carregado: false },
            CHATBOT: { nome: 'MODULO_CHATBOT', carregado: false },
            
            // FASE 5 - OTIMIZAÇÃO (4)
            CACHE_AVANCADO: { nome: 'MODULO_CACHE_AVANCADO', carregado: false },
            OTIMIZACAO: { nome: 'MODULO_OTIMIZACAO', carregado: false },
            OFFLINE: { nome: 'MODULO_OFFLINE', carregado: false },
            SINCRONIZACAO: { nome: 'MODULO_SINCRONIZACAO', carregado: false },
            
            // FASE 6 - SEGURANÇA (4)
            LGPD: { nome: 'MODULO_LGPD', carregado: false },
            AUDITORIA_AVANCADA: { nome: 'MODULO_AUDITORIA_AVANCADA', carregado: false },
            ACESSO_GRANULAR: { nome: 'MODULO_ACESSO_GRANULAR', carregado: false },
            BACKUP_NUVEM: { nome: 'MODULO_BACKUP_NUVEM', carregado: false },
            
            // FASE 7 - EXPERIÊNCIA (4)
            TUTORIAL: { nome: 'MODULO_TUTORIAL', carregado: false },
            FEEDBACK_USUARIO: { nome: 'MODULO_FEEDBACK_USUARIO', carregado: false },
            GAMIFICACAO: { nome: 'MODULO_GAMIFICACAO', carregado: false },
            NOTIFICACOES_PUSH: { nome: 'MODULO_NOTIFICACOES_PUSH', carregado: false },
            
            // FASE 8 - INTEGRAÇÕES (4)
            API_GOVERNO: { nome: 'MODULO_API_GOVERNO', carregado: false },
            INTEGRACOES_EXTERNAS: { nome: 'MODULO_INTEGRACOES_EXTERNAS', carregado: false },
            IMPORTACAO_EXPORTACAO: { nome: 'MODULO_IMPORTACAO_EXPORTACAO', carregado: false },
            WEBHOOKS: { nome: 'MODULO_WEBHOOKS', carregado: false }
        };

        // ==================== FUNÇÃO SEGURA - SEM RECURSÃO ====================
       function executarFuncao(moduloNome, funcaoNome, ...args) {
    // PREVENIR RECURSÃO - VERIFICAR SE JÁ ESTÁ EM EXECUÇÃO
    if (_stackControl.emExecucao) {
        console.warn(`⚠️ Prevenida chamada recursiva em ${moduloNome}.${funcaoNome}`);
        return gerarHTMLSeguro(moduloNome, funcaoNome);
    }

            // Verificar profundidade
            _stackControl.profundidade++;
            if (_stackControl.profundidade > _stackControl.maxProfundidade) {
                console.error(`❌ Profundidade máxima excedida em ${moduloNome}.${funcaoNome}`);
                _stackControl.profundidade = 0;
                _stackControl.emExecucao = false;
                return gerarHTMLSeguro(moduloNome, funcaoNome);
            }

            _stackControl.emExecucao = true;

            try {
                // Gerar chave de cache
                const cacheKey = `${moduloNome}_${funcaoNome}_${JSON.stringify(args)}`;
                
                // Verificar cache
                if (_cache.has(cacheKey)) {
                    _stackControl.emExecucao = false;
                    _stackControl.profundidade--;
                    return _cache.get(cacheKey);
                }

                // Verificar módulo
                if (!modulos[moduloNome]) {
                    const erro = `Módulo ${moduloNome} não encontrado`;
                    _cache.set(cacheKey, gerarHTMLSeguro(moduloNome, funcaoNome));
                    _stackControl.emExecucao = false;
                    _stackControl.profundidade--;
                    return gerarHTMLSeguro(moduloNome, funcaoNome);
                }

                const moduloGlobal = window[modulos[moduloNome].nome];

                // Verificar se módulo existe e tem a função
                if (!moduloGlobal || typeof moduloGlobal[funcaoNome] !== 'function') {
                    const resultado = gerarHTMLSeguro(moduloNome, funcaoNome);
                    _cache.set(cacheKey, resultado);
                    _stackControl.emExecucao = false;
                    _stackControl.profundidade--;
                    return resultado;
                }

                // Executar função (SEM chamar o loader novamente)
                const resultado = moduloGlobal[funcaoNome](...args);
                
                // Cachear resultado
                if (resultado !== undefined) {
                    _cache.set(cacheKey, resultado);
                }

                _stackControl.emExecucao = false;
                _stackControl.profundidade--;
                return resultado;

            } catch (erro) {
                console.error(`❌ Erro em ${moduloNome}.${funcaoNome}:`, erro);
                _stackControl.emExecucao = false;
                _stackControl.profundidade--;
                return gerarHTMLSeguro(moduloNome, funcaoNome);
            }
        }

        function gerarHTMLSeguro(moduloNome, funcaoNome) {
            return `
                <div style="text-align: center; padding: 40px; background: white; border-radius: 8px; margin: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <i class="fas fa-code" style="font-size: 64px; color: #3498db; margin-bottom: 20px;"></i>
                    <h3 style="color: #2c3e50; margin-bottom: 15px;">Funcionalidade em Desenvolvimento</h3>
                    <p style="color: #7f8c8d; margin-bottom: 10px;"><strong>${moduloNome}</strong> - ${funcaoNome}</p>
                    <p style="color: #95a5a6; font-size: 0.9rem;">Esta funcionalidade estará disponível em breve.</p>
                    <p style="color: #bdc3c7; font-size: 0.8rem; margin-top: 20px;">Versão de Demonstração para Investidores</p>
                    <button class="btn btn-primary" onclick="navegarPara('dashboard', 'home')" style="margin-top: 20px;">
                        <i class="fas fa-home"></i> Voltar ao Dashboard
                    </button>
                </div>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            executarFuncao: executarFuncao,
            getModulosCarregados: () => {
                return Object.values(modulos).filter(m => m.carregado).length;
            }
        };
    })();

    window.MODULO_LOADER = MODULO_LOADER;
    console.log('✅ Gerenciador de Módulos carregado');
}
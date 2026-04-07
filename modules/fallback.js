// modulos/fallback.js - Versão ULTRA-ESTÁVEL para todos os 58 módulos

(function() {
    'use strict';

    // ==================== FUNÇÃO GERADORA DE FALLBACK ====================
    function criarFallback(moduloNome, funcoes) {
        const modulo = {};
        
        funcoes.forEach(nomeFuncao => {
            modulo[nomeFuncao] = function() {
                // Retorna HTML direto SEM chamar o loader
                return `
                    <div style="text-align: center; padding: 40px; background: white; border-radius: 8px; margin: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <i class="fas fa-code" style="font-size: 64px; color: #3498db; margin-bottom: 20px;"></i>
                        <h3 style="color: #2c3e50; margin-bottom: 15px;">Módulo ${moduloNome}</h3>
                        <p style="color: #7f8c8d; margin-bottom: 10px;">Funcionalidade <strong>${nomeFuncao}</strong></p>
                        <p style="color: #95a5a6; font-size: 0.9rem;">Em desenvolvimento</p>
                        <p style="color: #bdc3c7; font-size: 0.8rem; margin-top: 20px;">Versão de Demonstração</p>
                        <button class="btn btn-primary" onclick="navegarPara('dashboard', 'home')" style="margin-top: 20px;">
                            <i class="fas fa-home"></i> Voltar ao Dashboard
                        </button>
                    </div>
                `;
            };
        });
        
        return modulo;
    }

    // ==================== MÓDULO SECRETARIA ====================
    if (typeof MODULO_SECRETARIA === 'undefined') {
        window.MODULO_SECRETARIA = criarFallback('Secretaria', [
            'renderizarEscolas', 'renderizarProfessores', 'renderizarAlunos', 'renderizarTurmas'
        ]);
    }

    // ==================== MÓDULO DIRETOR ====================
    if (typeof MODULO_DIRETOR === 'undefined') {
        window.MODULO_DIRETOR = criarFallback('Diretor', [
            'renderizarMinhaEscola', 'renderizarOcorrencias', 'renderizarReunioes', 'renderizarProjetos'
        ]);
    }

    // ==================== MÓDULO PROFESSOR ====================
    if (typeof MODULO_PROFESSOR === 'undefined') {
        window.MODULO_PROFESSOR = criarFallback('Professor', [
            'renderizarMinhasTurmas', 'renderizarLancarNotas', 'renderizarRegistrarFrequencia',
            'renderizarMeusAlunos', 'renderizarHorario', 'renderizarAtividades'
        ]);
    }

    // ==================== MÓDULO ALUNO ====================
    if (typeof MODULO_ALUNO === 'undefined') {
        window.MODULO_ALUNO = criarFallback('Aluno', [
            'renderizarBoletim', 'renderizarMinhasNotas', 'renderizarMinhasFaltas',
            'renderizarMeuHorario', 'renderizarAtividadesPendentes'
        ]);
    }

    // ==================== MÓDULO BIBLIOTECA ====================
    if (typeof MODULO_BIBLIOTECA === 'undefined') {
        window.MODULO_BIBLIOTECA = criarFallback('Biblioteca', [
            'renderizarLivros', 'renderizarMeusEmprestimos', 'renderizarMinhasReservas'
        ]);
    }

    // ==================== MÓDULO MERENDA ====================
    if (typeof MODULO_MERENDA === 'undefined') {
        window.MODULO_MERENDA = criarFallback('Merenda', [
            'renderizarCardapio', 'renderizarDietasEspeciais', 'renderizarEstoque', 'renderizarFornecedores'
        ]);
    }

    // ==================== MÓDULO TRANSPORTE ====================
    if (typeof MODULO_TRANSPORTE === 'undefined') {
        window.MODULO_TRANSPORTE = criarFallback('Transporte', [
            'renderizarRotas', 'renderizarMeuTransporte', 'renderizarVeiculos', 'renderizarMotoristas'
        ]);
    }

    // ==================== MÓDULO COMUNICAÇÃO ====================
    if (typeof MODULO_COMUNICACAO === 'undefined') {
        window.MODULO_COMUNICACAO = criarFallback('Comunicação', [
            'renderizarMensagens', 'renderizarAvisos', 'renderizarGrupos'
        ]);
    }

    // ==================== MÓDULO ATIVIDADES ====================
    if (typeof MODULO_ATIVIDADES === 'undefined') {
        window.MODULO_ATIVIDADES = criarFallback('Atividades', [
            'renderizarAtividades'
        ]);
    }

    // ==================== MÓDULO VAGAS ====================
    if (typeof MODULO_VAGAS === 'undefined') {
        window.MODULO_VAGAS = criarFallback('Vagas', [
            'renderizarVagas'
        ]);
    }

    // ==================== MÓDULO SAÚDE ====================
    if (typeof MODULO_SAUDE === 'undefined') {
        window.MODULO_SAUDE = criarFallback('Saúde', [
            'renderizarSaudeAlunos', 'renderizarOcorrenciasSaude', 'renderizarVacinas', 'renderizarExames'
        ]);
    }

    // ==================== MÓDULO BOLSAS ====================
    if (typeof MODULO_BOLSAS === 'undefined') {
        window.MODULO_BOLSAS = criarFallback('Bolsas', [
            'renderizarBolsas', 'renderizarSolicitacoes'
        ]);
    }

    // ==================== MÓDULO ESTÁGIO ====================
    if (typeof MODULO_ESTAGIO === 'undefined') {
        window.MODULO_ESTAGIO = criarFallback('Estágio', [
            'renderizarMeuEstagio', 'renderizarVagasEstagio', 'renderizarOrientacoes'
        ]);
    }

    // ==================== MÓDULO MONITORIA ====================
    if (typeof MODULO_MONITORIA === 'undefined') {
        window.MODULO_MONITORIA = criarFallback('Monitoria', [
            'renderizarMonitorias', 'renderizarMinhasMonitorias'
        ]);
    }

    // ==================== MÓDULO COMPETIÇÕES ====================
    if (typeof MODULO_COMPETICOES === 'undefined') {
        window.MODULO_COMPETICOES = criarFallback('Competições', [
            'renderizarCompeticoes', 'renderizarMinhasCompeticoes'
        ]);
    }

    // ==================== MÓDULO HORAS ====================
    if (typeof MODULO_HORAS === 'undefined') {
        window.MODULO_HORAS = criarFallback('Horas Complementares', [
            'renderizarHorasComplementares', 'renderizarTiposAtividades'
        ]);
    }

    // ==================== MÓDULO PESQUISAS ====================
    if (typeof MODULO_PESQUISAS === 'undefined') {
        window.MODULO_PESQUISAS = criarFallback('Pesquisas', [
            'renderizarPesquisas', 'renderizarResultados'
        ]);
    }

    // ==================== MÓDULO DOCUMENTOS ====================
    if (typeof MODULO_DOCUMENTOS === 'undefined') {
        window.MODULO_DOCUMENTOS = criarFallback('Documentos', [
            'renderizarDocumentos', 'renderizarSolicitacoes'
        ]);
    }

    // ==================== MÓDULO UNIFORME ====================
    if (typeof MODULO_UNIFORME === 'undefined') {
        window.MODULO_UNIFORME = criarFallback('Uniforme', [
            'renderizarUniforme', 'renderizarEstoqueUniforme'
        ]);
    }

    // ==================== MÓDULO CURSOS ====================
    if (typeof MODULO_CURSOS === 'undefined') {
        window.MODULO_CURSOS = criarFallback('Cursos', [
            'renderizarCursos', 'renderizarMeusCursos'
        ]);
    }

    // ==================== MÓDULO FEEDBACK ====================
    if (typeof MODULO_FEEDBACK === 'undefined') {
        window.MODULO_FEEDBACK = criarFallback('Feedback', [
            'renderizarFeedbacks', 'renderizarAvaliacoesInstitucionais'
        ]);
    }

    // ==================== MÓDULO RELATÓRIOS ====================
    if (typeof MODULO_RELATORIOS === 'undefined') {
        window.MODULO_RELATORIOS = criarFallback('Relatórios', [
            'renderizarRelatorios'
        ]);
    }

    console.log('✅ Todos os módulos de fallback carregados com segurança');
})();
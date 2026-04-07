// modulos/relatorios.js - Módulo de Relatórios
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_RELATORIOS === 'undefined') {
    const MODULO_RELATORIOS = (function() {
        'use strict';

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarRelatorios(secao) {
            return `
                <div class="relatorios-content">
                    <div class="content-header">
                        <h1><i class="fas fa-chart-bar"></i> Relatórios</h1>
                        <button class="btn btn-success" onclick="abrirModal('Novo Relatório', getFormRelatorio())">
                            <i class="fas fa-plus"></i> Gerar Relatório
                        </button>
                    </div>
                    
                    <div class="relatorios-grid">
                        <div class="relatorio-card" onclick="gerarRelatorio('desempenho')">
                            <i class="fas fa-chart-line"></i>
                            <h3>Desempenho Escolar</h3>
                            <p>Análise completa do desempenho dos alunos por turma e disciplina</p>
                            <span class="badge">Última atualização: hoje</span>
                        </div>
                        
                        <div class="relatorio-card" onclick="gerarRelatorio('frequencia')">
                            <i class="fas fa-calendar-check"></i>
                            <h3>Frequência</h3>
                            <p>Relatório detalhado de frequência por turma e aluno</p>
                            <span class="badge">Última atualização: ontem</span>
                        </div>
                        
                        <div class="relatorio-card" onclick="gerarRelatorio('professores')">
                            <i class="fas fa-chalkboard-teacher"></i>
                            <h3>Corpo Docente</h3>
                            <p>Informações completas sobre professores, turmas e disciplinas</p>
                            <span class="badge">45 professores ativos</span>
                        </div>
                        
                        <div class="relatorio-card" onclick="gerarRelatorio('alunos')">
                            <i class="fas fa-graduation-cap"></i>
                            <h3>Corpo Discente</h3>
                            <p>Dados completos dos alunos por turma, idade e desempenho</p>
                            <span class="badge">1230 alunos ativos</span>
                        </div>
                        
                        <div class="relatorio-card" onclick="gerarRelatorio('turmas')">
                            <i class="fas fa-users"></i>
                            <h3>Turmas</h3>
                            <p>Distribuição de alunos por turma e análise de capacidade</p>
                            <span class="badge">32 turmas ativas</span>
                        </div>
                        
                        <div class="relatorio-card" onclick="gerarRelatorio('financeiro')">
                            <i class="fas fa-dollar-sign"></i>
                            <h3>Financeiro</h3>
                            <p>Bolsas, auxílios e investimentos por escola</p>
                            <span class="badge">R$ 150k em auxílios</span>
                        </div>
                    </div>
                    
                    <div class="relatorios-recentes">
                        <h2>Relatórios Recentes</h2>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Período</th>
                                    <th>Data de Geração</th>
                                    <th>Tamanho</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Desempenho Escolar</td>
                                    <td>4º Bimestre 2023</td>
                                    <td>15/11/2023</td>
                                    <td>2.5 MB</td>
                                    <td>
                                        <button class="btn btn-sm btn-primary" onclick="baixarRelatorio(1)">
                                            <i class="fas fa-download"></i>
                                        </button>
                                        <button class="btn btn-sm btn-secondary" onclick="abrirModal('Visualizar', getVisualizacaoRelatorio(1))">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Frequência</td>
                                    <td>Novembro 2023</td>
                                    <td>10/11/2023</td>
                                    <td>1.8 MB</td>
                                    <td>
                                        <button class="btn btn-sm btn-primary" onclick="baixarRelatorio(2)">
                                            <i class="fas fa-download"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function getFormRelatorio() {
            return `
                <form id="form-relatorio">
                    <div class="form-group">
                        <label>Tipo de Relatório *</label>
                        <select class="form-control" required>
                            <option value="">Selecione...</option>
                            <option value="desempenho">Desempenho Escolar</option>
                            <option value="frequencia">Frequência</option>
                            <option value="professores">Professores</option>
                            <option value="alunos">Alunos</option>
                            <option value="turmas">Turmas</option>
                            <option value="financeiro">Financeiro</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Período</label>
                        <select class="form-control">
                            <option>1º Bimestre 2023</option>
                            <option>2º Bimestre 2023</option>
                            <option>3º Bimestre 2023</option>
                            <option>4º Bimestre 2023</option>
                            <option>Anual 2023</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Escola (opcional)</label>
                        <select class="form-control">
                            <option value="">Todas as escolas</option>
                            ${MOCK_DATA.escolas.map(e => `<option value="${e.id}">${e.nome}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Formato</label>
                        <select class="form-control">
                            <option value="pdf">PDF</option>
                            <option value="excel">Excel</option>
                            <option value="csv">CSV</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Incluir gráficos?</label>
                        <div class="radio-group">
                            <label><input type="radio" name="graficos" value="sim" checked> Sim</label>
                            <label><input type="radio" name="graficos" value="nao"> Não</label>
                        </div>
                    </div>
                </form>
            `;
        }

        function getVisualizacaoRelatorio(id) {
            return `
                <div class="visualizacao-relatorio">
                    <iframe src="#" style="width:100%; height:500px;"></iframe>
                </div>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarRelatorios,
            getFormRelatorio,
            getVisualizacaoRelatorio
        };
    })();

    window.MODULO_RELATORIOS = MODULO_RELATORIOS;
    console.log('✅ Módulo de Relatórios carregado');
}
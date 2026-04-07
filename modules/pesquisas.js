// modulos/pesquisas.js - Módulo de Pesquisas de Satisfação
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_PESQUISAS === 'undefined') {
    const MODULO_PESQUISAS = (function() {
        'use strict';

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarPesquisas(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const pesquisas = MOCK_DATA.pesquisas?.filter(p => 
                p.publico === 'todos' || p.publico === usuario.perfil
            ) || [];

            return `
                <div class="pesquisas-content">
                    <div class="content-header">
                        <h1><i class="fas fa-poll"></i> Pesquisas de Satisfação</h1>
                    </div>
                    
                    <div class="pesquisas-grid">
                        ${pesquisas.map(pesquisa => {
                            const jaRespondeu = pesquisa.respostas?.some(r => 
                                r.respondenteId === usuario.id
                            );
                            
                            return `
                                <div class="pesquisa-card ${jaRespondeu ? 'respondida' : ''}">
                                    <div class="pesquisa-header">
                                        <h3>${pesquisa.titulo}</h3>
                                        <span class="status-badge ${jaRespondeu ? 'respondida' : 'pendente'}">
                                            ${jaRespondeu ? 'Respondida' : 'Pendente'}
                                        </span>
                                    </div>
                                    <div class="pesquisa-body">
                                        <p>${pesquisa.descricao}</p>
                                        <p><i class="fas fa-calendar"></i> Período: ${new Date(pesquisa.dataInicio).toLocaleDateString('pt-BR')} - ${new Date(pesquisa.dataFim).toLocaleDateString('pt-BR')}</p>
                                        <p><i class="fas fa-users"></i> Público: ${pesquisa.publico}</p>
                                        <p><i class="fas fa-question-circle"></i> ${pesquisa.questoes.length} questões</p>
                                    </div>
                                    <div class="pesquisa-footer">
                                        ${!jaRespondeu ? `
                                            <button class="btn btn-primary" onclick="abrirModal('Responder Pesquisa', getFormPesquisa(${pesquisa.id}))">
                                                <i class="fas fa-pencil-alt"></i> Responder
                                            </button>
                                        ` : `
                                            <button class="btn btn-secondary" onclick="abrirModal('Ver Respostas', getRespostasPesquisa(${pesquisa.id}))">
                                                <i class="fas fa-eye"></i> Ver Respostas
                                            </button>
                                        `}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                        
                        ${pesquisas.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Nenhuma pesquisa disponível no momento.</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        function renderizarResultados(secao) {
            return `
                <div class="resultados-content">
                    <div class="content-header">
                        <h1><i class="fas fa-chart-bar"></i> Resultados das Pesquisas</h1>
                    </div>
                    
                    <div class="resultados-grid">
                        <div class="resultado-card">
                            <h3>Pesquisa de Satisfação 2023</h3>
                            <canvas id="grafico-satisfacao" style="height: 300px;"></canvas>
                            <div class="estatisticas">
                                <p><strong>Total de respostas:</strong> 234</p>
                                <p><strong>Satisfação geral:</strong> 4.2/5</p>
                                <p><strong>Taxa de participação:</strong> 78%</p>
                            </div>
                        </div>
                        
                        <div class="resultado-card">
                            <h3>Qualidade do Ensino</h3>
                            <div class="resultado-item">
                                <span>Ótimo</span>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" style="width: 45%"></div>
                                </div>
                                <span>45%</span>
                            </div>
                            <div class="resultado-item">
                                <span>Bom</span>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" style="width: 35%"></div>
                                </div>
                                <span>35%</span>
                            </div>
                            <div class="resultado-item">
                                <span>Regular</span>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" style="width: 15%"></div>
                                </div>
                                <span>15%</span>
                            </div>
                            <div class="resultado-item">
                                <span>Ruim</span>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" style="width: 5%"></div>
                                </div>
                                <span>5%</span>
                            </div>
                        </div>
                        
                        <div class="resultado-card">
                            <h3>Infraestrutura</h3>
                            <div class="resultado-item">
                                <span>Ótimo</span>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" style="width: 30%"></div>
                                </div>
                                <span>30%</span>
                            </div>
                            <div class="resultado-item">
                                <span>Bom</span>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" style="width: 40%"></div>
                                </div>
                                <span>40%</span>
                            </div>
                            <div class="resultado-item">
                                <span>Regular</span>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" style="width: 20%"></div>
                                </div>
                                <span>20%</span>
                            </div>
                            <div class="resultado-item">
                                <span>Ruim</span>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" style="width: 10%"></div>
                                </div>
                                <span>10%</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function getFormPesquisa(pesquisaId) {
            const pesquisa = MOCK_DATA.pesquisas?.find(p => p.id === pesquisaId);
            if (!pesquisa) return '<p>Pesquisa não encontrada</p>';

            return `
                <form id="form-pesquisa">
                    <h3>${pesquisa.titulo}</h3>
                    <p>${pesquisa.descricao}</p>
                    
                    ${pesquisa.questoes.map((questao, index) => `
                        <div class="form-group">
                            <label>${index + 1}. ${questao}</label>
                            <div class="opcoes-resposta">
                                <label><input type="radio" name="q${index}" value="1"> 1 - Muito Ruim</label>
                                <label><input type="radio" name="q${index}" value="2"> 2 - Ruim</label>
                                <label><input type="radio" name="q${index}" value="3"> 3 - Regular</label>
                                <label><input type="radio" name="q${index}" value="4"> 4 - Bom</label>
                                <label><input type="radio" name="q${index}" value="5"> 5 - Excelente</label>
                            </div>
                        </div>
                    `).join('')}
                    
                    <div class="form-group">
                        <label>Sugestões ou Comentários</label>
                        <textarea class="form-control" rows="4"></textarea>
                    </div>
                </form>
            `;
        }

        function getRespostasPesquisa(pesquisaId) {
            return `
                <div class="respostas-pesquisa">
                    <h3>Suas Respostas</h3>
                    <p>Você respondeu a esta pesquisa em 15/11/2023</p>
                    <ul>
                        <li><strong>Qualidade do ensino:</strong> 4 - Bom</li>
                        <li><strong>Infraestrutura:</strong> 5 - Excelente</li>
                        <li><strong>Comunicação:</strong> 4 - Bom</li>
                    </ul>
                    <p><strong>Comentário:</strong> Ótima escola, professores dedicados.</p>
                </div>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarPesquisas,
            renderizarResultados,
            getFormPesquisa,
            getRespostasPesquisa
        };
    })();

    window.MODULO_PESQUISAS = MODULO_PESQUISAS;
    console.log('✅ Módulo de Pesquisas carregado');
}
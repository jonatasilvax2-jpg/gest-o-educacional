// modulos/feedback.js - Módulo de Feedback e Avaliações
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_FEEDBACK === 'undefined') {
    const MODULO_FEEDBACK = (function() {
        'use strict';

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarFeedbacks(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const avaliacoes = MOCK_DATA.avaliacoes?.filter(a => 
                a.avaliadorId === usuario.id || a.avaliado === usuario.id
            ) || [];

            return `
                <div class="feedback-content">
                    <div class="content-header">
                        <h1><i class="fas fa-star"></i> Feedbacks e Avaliações</h1>
                        <button class="btn btn-success" onclick="abrirModal('Nova Avaliação', getFormAvaliacao())">
                            <i class="fas fa-plus"></i> Nova Avaliação
                        </button>
                    </div>
                    
                    <div class="feedback-stats">
                        <div class="stat-card">
                            <h3>Minhas Avaliações</h3>
                            <p class="stat-number">${avaliacoes.length}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Média Recebida</h3>
                            <p class="stat-number">4.5</p>
                            <div class="estrelas">
                                <i class="fas fa-star text-warning"></i>
                                <i class="fas fa-star text-warning"></i>
                                <i class="fas fa-star text-warning"></i>
                                <i class="fas fa-star text-warning"></i>
                                <i class="fas fa-star-half-alt text-warning"></i>
                            </div>
                        </div>
                        <div class="stat-card">
                            <h3>Taxa de Resposta</h3>
                            <p class="stat-number">85%</p>
                        </div>
                    </div>
                    
                    <div class="feedbacks-grid">
                        <div class="feedback-section">
                            <h2><i class="fas fa-pencil-alt"></i> Avaliações que Fiz</h2>
                            ${avaliacoes.filter(a => a.avaliadorId === usuario.id).map(av => `
                                <div class="feedback-card">
                                    <div class="feedback-header">
                                        <h3>Avaliação para ${av.avaliadoNome}</h3>
                                        <span class="data">${new Date(av.data).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div class="feedback-body">
                                        <div class="notas">
                                            ${Object.entries(av.notas).map(([criterio, nota]) => `
                                                <div class="nota-item">
                                                    <span>${criterio}:</span>
                                                    <span class="estrelas">
                                                        ${Array(5).fill(0).map((_, i) => `
                                                            <i class="fas fa-star ${i < nota ? 'text-warning' : 'text-muted'}"></i>
                                                        `).join('')}
                                                    </span>
                                                </div>
                                            `).join('')}
                                        </div>
                                        <p><strong>Média:</strong> ${av.media}</p>
                                        ${av.comentario ? `<p><i class="fas fa-comment"></i> ${av.comentario}</p>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="feedback-section">
                            <h2><i class="fas fa-star"></i> Avaliações que Recebi</h2>
                            ${avaliacoes.filter(a => a.avaliado === usuario.id).map(av => `
                                <div class="feedback-card">
                                    <div class="feedback-header">
                                        <h3>Avaliação de ${av.avaliadorNome}</h3>
                                        <span class="data">${new Date(av.data).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div class="feedback-body">
                                        <div class="notas">
                                            ${Object.entries(av.notas).map(([criterio, nota]) => `
                                                <div class="nota-item">
                                                    <span>${criterio}:</span>
                                                    <span class="estrelas">
                                                        ${Array(5).fill(0).map((_, i) => `
                                                            <i class="fas fa-star ${i < nota ? 'text-warning' : 'text-muted'}"></i>
                                                        `).join('')}
                                                    </span>
                                                </div>
                                            `).join('')}
                                        </div>
                                        <p><strong>Média:</strong> ${av.media}</p>
                                        ${av.comentario ? `<p><i class="fas fa-comment"></i> ${av.comentario}</p>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        function renderizarAvaliacoesInstitucionais(secao) {
            return `
                <div class="avaliacoes-institucionais-content">
                    <div class="content-header">
                        <h1><i class="fas fa-chart-bar"></i> Avaliações Institucionais</h1>
                    </div>
                    
                    <div class="avaliacoes-grid">
                        <div class="avaliacao-card">
                            <h3>Avaliação da Escola</h3>
                            <canvas id="grafico-escola" style="height: 200px;"></canvas>
                            <div class="resultados">
                                <p><strong>Média Geral:</strong> 8.2</p>
                                <p><strong>Total de Avaliações:</strong> 127</p>
                                <p><strong>Período:</strong> 4º Bimestre 2023</p>
                            </div>
                        </div>
                        
                        <div class="avaliacao-card">
                            <h3>Avaliação dos Professores</h3>
                            <div class="professores-avaliacao">
                                <div class="professor-item">
                                    <span>Carlos Santos</span>
                                    <span class="media">9.0</span>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar" style="width: 90%"></div>
                                    </div>
                                </div>
                                <div class="professor-item">
                                    <span>Ana Paula</span>
                                    <span class="media">8.5</span>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar" style="width: 85%"></div>
                                    </div>
                                </div>
                                <div class="professor-item">
                                    <span>Roberto Lima</span>
                                    <span class="media">7.8</span>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar" style="width: 78%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="avaliacao-card">
                            <h3>Infraestrutura</h3>
                            <div class="criterios">
                                <div class="criterio-item">
                                    <span>Salas de Aula</span>
                                    <span class="nota">8</span>
                                </div>
                                <div class="criterio-item">
                                    <span>Biblioteca</span>
                                    <span class="nota">9</span>
                                </div>
                                <div class="criterio-item">
                                    <span>Laboratórios</span>
                                    <span class="nota">7</span>
                                </div>
                                <div class="criterio-item">
                                    <span>Área de Lazer</span>
                                    <span class="nota">8</span>
                                </div>
                                <div class="criterio-item">
                                    <span>Refeitório</span>
                                    <span class="nota">8</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function getFormAvaliacao() {
            return `
                <form id="form-avaliacao">
                    <div class="form-group">
                        <label>Avaliar *</label>
                        <select class="form-control" required>
                            <option value="">Selecione...</option>
                            <option value="professor">Professor</option>
                            <option value="escola">Escola</option>
                            <option value="curso">Curso</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Didática</label>
                        <div class="estrelas-input">
                            ${[1,2,3,4,5].map(i => `
                                <i class="far fa-star" onclick="selecionarEstrela(this, 1)"></i>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Pontualidade</label>
                        <div class="estrelas-input">
                            ${[1,2,3,4,5].map(i => `
                                <i class="far fa-star" onclick="selecionarEstrela(this, 2)"></i>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Relacionamento</label>
                        <div class="estrelas-input">
                            ${[1,2,3,4,5].map(i => `
                                <i class="far fa-star" onclick="selecionarEstrela(this, 3)"></i>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Comentário</label>
                        <textarea class="form-control" rows="4"></textarea>
                    </div>
                </form>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarFeedbacks,
            renderizarAvaliacoesInstitucionais,
            getFormAvaliacao
        };
    })();

    window.MODULO_FEEDBACK = MODULO_FEEDBACK;
    console.log('✅ Módulo de Feedback carregado');
}
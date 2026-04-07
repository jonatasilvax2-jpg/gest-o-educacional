// modulos/horas.js - Módulo de Horas Complementares
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_HORAS === 'undefined') {
    const MODULO_HORAS = (function() {
        'use strict';

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarHorasComplementares(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const horas = MOCK_DATA.horasComplementares?.filter(h => h.alunoId === usuario.id) || [];
            
            const horasTotais = 100; // Total necessário
            const horasCumpridas = horas.reduce((acc, h) => acc + h.horas, 0);
            const horasRestantes = horasTotais - horasCumpridas;

            return `
                <div class="horas-content">
                    <div class="content-header">
                        <h1><i class="fas fa-clock"></i> Horas Complementares</h1>
                        <button class="btn btn-success" onclick="abrirModal('Registrar Atividade', getFormHora())">
                            <i class="fas fa-plus"></i> Registrar Atividade
                        </button>
                    </div>
                    
                    <div class="progresso-horas">
                        <h2>Seu Progresso</h2>
                        <div class="progresso-container">
                            <div class="progresso-info">
                                <span>${horasCumpridas}h cumpridas</span>
                                <span>${horasRestantes}h restantes</span>
                            </div>
                            <div class="progress-bar-container">
                                <div class="progress-bar" style="width: ${(horasCumpridas/horasTotais)*100}%"></div>
                            </div>
                            <p class="progresso-percentual">${Math.round((horasCumpridas/horasTotais)*100)}% concluído</p>
                        </div>
                    </div>
                    
                    <div class="horas-lista">
                        <h2>Atividades Registradas</h2>
                        ${horas.map(h => `
                            <div class="hora-card">
                                <div class="hora-header">
                                    <h3>${h.atividade}</h3>
                                    <span class="status-badge ${h.status}">${h.status}</span>
                                </div>
                                <div class="hora-body">
                                    <p><i class="fas fa-tag"></i> Tipo: ${h.tipo}</p>
                                    <p><i class="fas fa-clock"></i> Horas: ${h.horas}h</p>
                                    <p><i class="fas fa-calendar"></i> Data: ${new Date(h.data).toLocaleDateString('pt-BR')}</p>
                                    ${h.observacoes ? `<p><i class="fas fa-comment"></i> ${h.observacoes}</p>` : ''}
                                </div>
                                <div class="hora-footer">
                                    ${h.status === 'pendente' ? `
                                        <button class="btn btn-sm btn-danger" onclick="cancelarRegistroHora(${h.id})">
                                            <i class="fas fa-times"></i> Cancelar
                                        </button>
                                    ` : ''}
                                    ${h.comprovante ? `
                                        <button class="btn btn-sm btn-primary" onclick="abrirModal('Comprovante', getComprovanteHora(${h.id}))">
                                            <i class="fas fa-file-pdf"></i> Ver Comprovante
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                        
                        ${horas.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Nenhuma atividade registrada ainda.</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        function renderizarTiposAtividades(secao) {
            return `
                <div class="tipos-atividades-content">
                    <div class="content-header">
                        <h1><i class="fas fa-list"></i> Tipos de Atividades</h1>
                    </div>
                    
                    <div class="tipos-grid">
                        <div class="tipo-card">
                            <i class="fas fa-microphone-alt"></i>
                            <h3>Palestras</h3>
                            <p>Até 10 horas</p>
                            <ul>
                                <li>Palestras educacionais</li>
                                <li>Seminários</li>
                                <li>Congressos</li>
                            </ul>
                        </div>
                        
                        <div class="tipo-card">
                            <i class="fas fa-briefcase"></i>
                            <h3>Estágio</h3>
                            <p>Até 40 horas</p>
                            <ul>
                                <li>Estágio extracurricular</li>
                                <li>Experiência profissional</li>
                            </ul>
                        </div>
                        
                        <div class="tipo-card">
                            <i class="fas fa-chalkboard-teacher"></i>
                            <h3>Cursos</h3>
                            <p>Até 30 horas</p>
                            <ul>
                                <li>Cursos de idiomas</li>
                                <li>Cursos profissionalizantes</li>
                                <li>Workshops</li>
                            </ul>
                        </div>
                        
                        <div class="tipo-card">
                            <i class="fas fa-hands-helping"></i>
                            <h3>Voluntariado</h3>
                            <p>Até 20 horas</p>
                            <ul>
                                <li>Trabalho voluntário</li>
                                <li>Ações sociais</li>
                            </ul>
                        </div>
                        
                        <div class="tipo-card">
                            <i class="fas fa-trophy"></i>
                            <h3>Competições</h3>
                            <p>Até 15 horas</p>
                            <ul>
                                <li>Olimpíadas</li>
                                <li>Competições esportivas</li>
                                <li>Feiras de ciências</li>
                            </ul>
                        </div>
                        
                        <div class="tipo-card">
                            <i class="fas fa-book"></i>
                            <h3>Publicações</h3>
                            <p>Até 15 horas</p>
                            <ul>
                                <li>Artigos acadêmicos</li>
                                <li>Pesquisas</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <h3><i class="fas fa-info-circle"></i> Informações Importantes</h3>
                        <ul>
                            <li>Total mínimo necessário: 100 horas</li>
                            <li>As atividades devem ser realizadas durante o ano letivo</li>
                            <li>Comprovantes devem ser anexados para validação</li>
                            <li>Atividades serão validadas pela coordenação</li>
                        </ul>
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function getFormHora() {
            return `
                <form id="form-hora">
                    <div class="form-group">
                        <label>Tipo de Atividade *</label>
                        <select class="form-control" required>
                            <option value="">Selecione...</option>
                            <option value="palestra">Palestra</option>
                            <option value="curso">Curso</option>
                            <option value="estagio">Estágio</option>
                            <option value="voluntariado">Voluntariado</option>
                            <option value="competicao">Competição</option>
                            <option value="publicacao">Publicação</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Título da Atividade *</label>
                        <input type="text" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Descrição *</label>
                        <textarea class="form-control" rows="4" required></textarea>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Data de Realização *</label>
                                <input type="date" class="form-control" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Horas *</label>
                                <input type="number" class="form-control" min="1" max="40" required>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Instituição/Organização</label>
                        <input type="text" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Comprovante</label>
                        <input type="file" class="form-control" accept=".pdf,.jpg,.jpeg,.png">
                    </div>
                </form>
            `;
        }

        function getComprovanteHora(id) {
            return `
                <div class="comprovante">
                    <p><i class="fas fa-file-pdf"></i> Comprovante de Atividade</p>
                    <iframe src="#" style="width:100%; height:500px;"></iframe>
                </div>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarHorasComplementares,
            renderizarTiposAtividades,
            getFormHora,
            getComprovanteHora
        };
    })();

    window.MODULO_HORAS = MODULO_HORAS;
    console.log('✅ Módulo de Horas Complementares carregado');
}
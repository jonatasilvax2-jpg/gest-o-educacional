// modulos/cursos.js - Módulo de Cursos e Formação
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_CURSOS === 'undefined') {
    const MODULO_CURSOS = (function() {
        'use strict';

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarCursos(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const cursos = MOCK_DATA.cursos || [];

            return `
                <div class="cursos-content">
                    <div class="content-header">
                        <h1><i class="fas fa-graduation-cap"></i> Cursos e Formação</h1>
                        ${usuario.perfil !== 'aluno' ? `
                            <button class="btn btn-success" onclick="abrirModal('Novo Curso', getFormCurso())">
                                <i class="fas fa-plus"></i> Novo Curso
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="cursos-grid">
                        ${cursos.map(curso => {
                            const inscrito = curso.inscritos?.includes(usuario.id);
                            return `
                                <div class="curso-card">
                                    <div class="curso-header">
                                        <h3>${curso.titulo}</h3>
                                        <span class="status-badge ${curso.status}">${curso.status}</span>
                                    </div>
                                    <div class="curso-body">
                                        <p>${curso.descricao}</p>
                                        <p><i class="fas fa-clock"></i> Carga Horária: ${curso.cargaHoraria}h</p>
                                        <p><i class="fas fa-calendar"></i> Período: ${new Date(curso.dataInicio).toLocaleDateString('pt-BR')} - ${new Date(curso.dataFim).toLocaleDateString('pt-BR')}</p>
                                        <p><i class="fas fa-users"></i> Inscritos: ${curso.inscritos?.length || 0}</p>
                                        <p><i class="fas fa-chalkboard-teacher"></i> Instrutor: ${curso.instrutor}</p>
                                        ${curso.certificado ? '<p><i class="fas fa-certificate"></i> Certificado incluso</p>' : ''}
                                    </div>
                                    <div class="curso-footer">
                                        ${usuario.perfil === 'professor' && !inscrito && curso.status === 'em_andamento' ? `
                                            <button class="btn btn-sm btn-primary" onclick="abrirModal('Inscrever-se', getFormInscricaoCurso(${curso.id}))">
                                                <i class="fas fa-pencil-alt"></i> Inscrever-se
                                            </button>
                                        ` : inscrito ? `
                                            <span class="inscrito-badge"><i class="fas fa-check"></i> Inscrito</span>
                                        ` : ''}
                                        
                                        ${usuario.perfil !== 'aluno' ? `
                                            <button class="btn btn-sm btn-secondary" onclick="abrirModal('Editar', getFormCurso(${curso.id}))">
                                                <i class="fas fa-edit"></i> Editar
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                        
                        ${cursos.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Nenhum curso disponível no momento.</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        function renderizarMeusCursos(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const cursos = MOCK_DATA.cursos?.filter(c => c.inscritos?.includes(usuario.id)) || [];

            return `
                <div class="meus-cursos-content">
                    <div class="content-header">
                        <h1><i class="fas fa-book-open"></i> Meus Cursos</h1>
                    </div>
                    
                    <div class="cursos-lista">
                        ${cursos.map(curso => {
                            const progresso = Math.floor(Math.random() * 100);
                            return `
                                <div class="curso-andamento-card">
                                    <h3>${curso.titulo}</h3>
                                    <p><i class="fas fa-clock"></i> Carga Horária: ${curso.cargaHoraria}h</p>
                                    <p><i class="fas fa-calendar"></i> Período: ${new Date(curso.dataInicio).toLocaleDateString('pt-BR')} - ${new Date(curso.dataFim).toLocaleDateString('pt-BR')}</p>
                                    
                                    <div class="progresso-container">
                                        <div class="progresso-label">Progresso</div>
                                        <div class="progress-bar-container">
                                            <div class="progress-bar" style="width: ${progresso}%"></div>
                                        </div>
                                        <span class="progresso-valor">${progresso}%</span>
                                    </div>
                                    
                                    ${curso.status === 'concluido' ? `
                                        <button class="btn btn-sm btn-success" onclick="baixarCertificado(${curso.id})">
                                            <i class="fas fa-certificate"></i> Certificado
                                        </button>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                        
                        ${cursos.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Você não está inscrito em nenhum curso.</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function getFormCurso(id = null) {
            if (id) {
                const curso = MOCK_DATA.cursos?.find(c => c.id === id);
                if (!curso) return '<p>Curso não encontrado</p>';

                return `
                    <form id="form-curso">
                        <div class="form-group">
                            <label>Título do Curso</label>
                            <input type="text" class="form-control" value="${curso.titulo}">
                        </div>
                        <div class="form-group">
                            <label>Descrição</label>
                            <textarea class="form-control" rows="4">${curso.descricao}</textarea>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Carga Horária</label>
                                    <input type="number" class="form-control" value="${curso.cargaHoraria}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Instrutor</label>
                                    <input type="text" class="form-control" value="${curso.instrutor}">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Data Início</label>
                                    <input type="date" class="form-control" value="${curso.dataInicio}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Data Fim</label>
                                    <input type="date" class="form-control" value="${curso.dataFim}">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select class="form-control">
                                <option value="em_andamento" ${curso.status === 'em_andamento' ? 'selected' : ''}>Em Andamento</option>
                                <option value="concluido" ${curso.status === 'concluido' ? 'selected' : ''}>Concluído</option>
                            </select>
                        </div>
                    </form>
                `;
            }

            return `
                <form id="form-curso">
                    <div class="form-group">
                        <label>Título do Curso *</label>
                        <input type="text" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Descrição *</label>
                        <textarea class="form-control" rows="4" required></textarea>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Carga Horária *</label>
                                <input type="number" class="form-control" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Instrutor</label>
                                <input type="text" class="form-control">
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Data Início</label>
                                <input type="date" class="form-control">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Data Fim</label>
                                <input type="date" class="form-control">
                            </div>
                        </div>
                    </div>
                </form>
            `;
        }

        function getFormInscricaoCurso(cursoId) {
            return `
                <form id="form-inscricao-curso">
                    <p><strong>Confirmar inscrição?</strong></p>
                    <p>Ao se inscrever, você concorda em participar do curso conforme cronograma estabelecido.</p>
                    <div class="form-group">
                        <label>Observações</label>
                        <textarea class="form-control" rows="3"></textarea>
                    </div>
                </form>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarCursos,
            renderizarMeusCursos,
            getFormCurso,
            getFormInscricaoCurso
        };
    })();

    window.MODULO_CURSOS = MODULO_CURSOS;
    console.log('✅ Módulo de Cursos carregado');
}
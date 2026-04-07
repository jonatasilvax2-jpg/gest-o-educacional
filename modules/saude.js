// modulos/saude.js - Módulo de Saúde Escolar
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_SAUDE === 'undefined') {
    const MODULO_SAUDE = (function() {
        'use strict';

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarSaudeAlunos(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const alunos = usuario.perfil === 'aluno' 
                ? [MOCK_DATA.alunos.find(a => a.id === usuario.id)]
                : MOCK_DATA.alunos;

            return `
                <div class="saude-content">
                    <div class="content-header">
                        <h1><i class="fas fa-heartbeat"></i> Saúde dos Alunos</h1>
                        ${usuario.perfil !== 'aluno' ? `
                            <button class="btn btn-success" onclick="abrirModal('Novo Registro', getFormSaude())">
                                <i class="fas fa-plus"></i> Novo Registro
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="saude-grid">
                        ${alunos.map(aluno => {
                            const saude = MOCK_DATA.saude.alunos.find(s => s.alunoId === aluno.id);
                            if (!saude && usuario.perfil !== 'aluno') return '';

                            return `
                                <div class="saude-card">
                                    <h3>${aluno.nome}</h3>
                                    <p><strong>Turma:</strong> ${aluno.turma}</p>
                                    
                                    ${saude ? `
                                        <div class="saude-info">
                                            <p><i class="fas fa-tint"></i> Tipo Sanguíneo: <strong>${saude.tipoSanguineo || 'Não informado'}</strong></p>
                                            
                                            ${saude.alergias && saude.alergias.length > 0 ? `
                                                <div class="alergias">
                                                    <p><strong><i class="fas fa-exclamation-triangle text-warning"></i> Alergias:</strong></p>
                                                    ${saude.alergias.map(alg => `
                                                        <span class="alergia-tag">${alg}</span>
                                                    `).join('')}
                                                </div>
                                            ` : ''}
                                            
                                            ${saude.medicamentos && saude.medicamentos.length > 0 ? `
                                                <div class="medicamentos">
                                                    <p><strong><i class="fas fa-pills"></i> Medicamentos:</strong></p>
                                                    <ul>
                                                        ${saude.medicamentos.map(med => `<li>${med}</li>`).join('')}
                                                    </ul>
                                                </div>
                                            ` : ''}
                                            
                                            <p><i class="fas fa-phone"></i> Contato Emergência: ${saude.contatoEmergencia || 'Não informado'}</p>
                                            <p><i class="fas fa-id-card"></i> Plano de Saúde: ${saude.planoSaude || 'SUS'}</p>
                                            ${saude.observacoes ? `<p><i class="fas fa-comment"></i> Obs: ${saude.observacoes}</p>` : ''}
                                        </div>
                                    ` : `
                                        <div class="no-data">
                                            <p>Nenhum dado de saúde cadastrado.</p>
                                        </div>
                                    `}
                                    
                                    ${usuario.perfil !== 'aluno' ? `
                                        <div class="saude-acoes">
                                            <button class="btn btn-sm btn-primary" onclick="abrirModal('Editar', getFormSaude(${aluno.id}))">
                                                <i class="fas fa-edit"></i> Editar
                                            </button>
                                            <button class="btn btn-sm btn-info" onclick="navegarPara('ocorrencias', 'saude', ${aluno.id})">
                                                <i class="fas fa-history"></i> Histórico
                                            </button>
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        function renderizarOcorrenciasSaude(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const ocorrencias = MOCK_DATA.saude.ocorrenciasSaude;

            return `
                <div class="ocorrencias-saude-content">
                    <div class="content-header">
                        <h1><i class="fas fa-notes-medical"></i> Ocorrências de Saúde</h1>
                        <button class="btn btn-success" onclick="abrirModal('Nova Ocorrência', getFormOcorrenciaSaude())">
                            <i class="fas fa-plus"></i> Registrar Ocorrência
                        </button>
                    </div>
                    
                    <div class="ocorrencias-lista">
                        ${ocorrencias.map(occ => {
                            const aluno = MOCK_DATA.alunos.find(a => a.id === occ.alunoId);
                            return `
                                <div class="ocorrencia-saude-card">
                                    <div class="ocorrencia-header">
                                        <h3>${aluno ? aluno.nome : 'Aluno'}</h3>
                                        <span class="data">${new Date(occ.data).toLocaleDateString('pt-BR')} às ${occ.hora}</span>
                                    </div>
                                    <div class="ocorrencia-body">
                                        <p><strong>Tipo:</strong> ${occ.tipo}</p>
                                        <p><strong>Descrição:</strong> ${occ.descricao}</p>
                                        <p><strong>Atendimento:</strong> ${occ.atendimento}</p>
                                        <p><strong>Profissional:</strong> ${occ.profissional}</p>
                                        <p><strong>Medidas:</strong> ${occ.medidas}</p>
                                        <p><strong>Status:</strong> <span class="status-badge ${occ.status}">${occ.status}</span></p>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        function renderizarVacinas(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const vacinas = MOCK_DATA.saude.vacinas.filter(v => v.alunoId === usuario.id);

            return `
                <div class="vacinas-content">
                    <div class="content-header">
                        <h1><i class="fas fa-syringe"></i> Minhas Vacinas</h1>
                    </div>
                    
                    <div class="vacinas-grid">
                        ${vacinas.map(vacina => {
                            const proxima = new Date(vacina.proxima);
                            const hoje = new Date();
                            const diasRestantes = Math.ceil((proxima - hoje) / (1000 * 60 * 60 * 24));
                            
                            return `
                                <div class="vacina-card">
                                    <h3>${vacina.vacina}</h3>
                                    <p><strong>Dose:</strong> ${vacina.dose}</p>
                                    <p><strong>Data:</strong> ${new Date(vacina.data).toLocaleDateString('pt-BR')}</p>
                                    <p><strong>Próxima dose:</strong> ${new Date(vacina.proxima).toLocaleDateString('pt-BR')}</p>
                                    ${diasRestantes < 30 ? `
                                        <p class="text-warning">
                                            <i class="fas fa-exclamation-triangle"></i>
                                            Próxima dose em ${diasRestantes} dias
                                        </p>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                        
                        ${vacinas.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Nenhuma vacina registrada.</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        function renderizarExames(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const exames = MOCK_DATA.saude.exames.filter(e => e.alunoId === usuario.id);

            return `
                <div class="exames-content">
                    <div class="content-header">
                        <h1><i class="fas fa-microscope"></i> Meus Exames</h1>
                    </div>
                    
                    <div class="exames-lista">
                        ${exames.map(exame => `
                            <div class="exame-card">
                                <h3>${exame.tipo}</h3>
                                <p><strong>Data:</strong> ${new Date(exame.data).toLocaleDateString('pt-BR')}</p>
                                <p><strong>Resultado:</strong> <span class="${exame.resultado === 'Normal' ? 'text-success' : 'text-warning'}">${exame.resultado}</span></p>
                                ${exame.observacoes ? `<p><strong>Obs:</strong> ${exame.observacoes}</p>` : ''}
                                <button class="btn btn-sm btn-primary" onclick="abrirModal('Resultado', getDetalhesExame(${exame.id}))">
                                    <i class="fas fa-file-pdf"></i> Ver Resultado
                                </button>
                            </div>
                        `).join('')}
                        
                        ${exames.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Nenhum exame registrado.</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function getFormSaude(alunoId = null) {
            if (alunoId) {
                const saude = MOCK_DATA.saude.alunos.find(s => s.alunoId === alunoId);
                
                return `
                    <form id="form-saude">
                        <div class="form-group">
                            <label>Tipo Sanguíneo</label>
                            <select class="form-control">
                                <option value="A+" ${saude?.tipoSanguineo === 'A+' ? 'selected' : ''}>A+</option>
                                <option value="A-" ${saude?.tipoSanguineo === 'A-' ? 'selected' : ''}>A-</option>
                                <option value="B+" ${saude?.tipoSanguineo === 'B+' ? 'selected' : ''}>B+</option>
                                <option value="B-" ${saude?.tipoSanguineo === 'B-' ? 'selected' : ''}>B-</option>
                                <option value="AB+" ${saude?.tipoSanguineo === 'AB+' ? 'selected' : ''}>AB+</option>
                                <option value="AB-" ${saude?.tipoSanguineo === 'AB-' ? 'selected' : ''}>AB-</option>
                                <option value="O+" ${saude?.tipoSanguineo === 'O+' ? 'selected' : ''}>O+</option>
                                <option value="O-" ${saude?.tipoSanguineo === 'O-' ? 'selected' : ''}>O-</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Alergias (separadas por vírgula)</label>
                            <input type="text" class="form-control" value="${saude?.alergias ? saude.alergias.join(', ') : ''}" placeholder="Ex: poeira, amendoim, lactose">
                        </div>
                        
                        <div class="form-group">
                            <label>Medicamentos de uso contínuo</label>
                            <input type="text" class="form-control" value="${saude?.medicamentos ? saude.medicamentos.join(', ') : ''}" placeholder="Ex: Ritalina, Dipirona">
                        </div>
                        
                        <div class="form-group">
                            <label>Contato de Emergência</label>
                            <input type="text" class="form-control" value="${saude?.contatoEmergencia || ''}" placeholder="(00) 00000-0000">
                        </div>
                        
                        <div class="form-group">
                            <label>Plano de Saúde</label>
                            <input type="text" class="form-control" value="${saude?.planoSaude || ''}" placeholder="Nome do plano ou SUS">
                        </div>
                        
                        <div class="form-group">
                            <label>Observações</label>
                            <textarea class="form-control" rows="3">${saude?.observacoes || ''}</textarea>
                        </div>
                    </form>
                `;
            }

            return `
                <form id="form-saude">
                    <div class="form-group">
                        <label>Aluno</label>
                        <select class="form-control" required>
                            <option value="">Selecione...</option>
                            ${MOCK_DATA.alunos.map(a => `<option value="${a.id}">${a.nome}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tipo Sanguíneo</label>
                        <select class="form-control">
                            <option value="">Selecione...</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Alergias</label>
                        <input type="text" class="form-control" placeholder="Ex: poeira, amendoim">
                    </div>
                    <div class="form-group">
                        <label>Medicamentos</label>
                        <input type="text" class="form-control" placeholder="Ex: Ritalina">
                    </div>
                    <div class="form-group">
                        <label>Contato de Emergência</label>
                        <input type="text" class="form-control" placeholder="(00) 00000-0000">
                    </div>
                </form>
            `;
        }

        function getFormOcorrenciaSaude() {
            return `
                <form id="form-ocorrencia-saude">
                    <div class="form-group">
                        <label>Aluno *</label>
                        <select class="form-control" required>
                            <option value="">Selecione...</option>
                            ${MOCK_DATA.alunos.map(a => `<option value="${a.id}">${a.nome}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tipo *</label>
                        <input type="text" class="form-control" placeholder="Ex: Dor de cabeça, Febre" required>
                    </div>
                    <div class="form-group">
                        <label>Descrição *</label>
                        <textarea class="form-control" rows="4" placeholder="Descreva a ocorrência..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Medidas Adotadas</label>
                        <textarea class="form-control" rows="3" placeholder="Medidas tomadas..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Profissional Responsável</label>
                        <input type="text" class="form-control" placeholder="Nome do profissional">
                    </div>
                </form>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarSaudeAlunos,
            renderizarOcorrenciasSaude,
            renderizarVacinas,
            renderizarExames,
            getFormSaude,
            getFormOcorrenciaSaude,
            getDetalhesExame: (id) => `<p>Detalhes do exame ${id}</p>`
        };
    })();

    window.MODULO_SAUDE = MODULO_SAUDE;
    console.log('✅ Módulo de Saúde carregado');
}
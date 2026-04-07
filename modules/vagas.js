// modulos/vagas.js - Módulo de Vagas e Matrículas
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_VAGAS === 'undefined') {
    const MODULO_VAGAS = (function() {
        'use strict';

        // ==================== DADOS LOCAIS ====================
        let vagas = MOCK_DATA.vagas || {
            turmas: [],
            inscricoes: [],
            rematriculas: []
        };

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarVagas(secao) {
            const usuario = SISTEMA.getEstado().usuario;

            if (secao === 'listar' || usuario.perfil === 'secretaria') {
                return renderizarGerenciamentoVagas();
            } else if (usuario.perfil === 'aluno' || usuario.perfil === 'responsavel') {
                return renderizarVagasDisponiveis();
            } else {
                return renderizarVagasEscola();
            }
        }

        function renderizarGerenciamentoVagas() {
            const todasTurmas = MOCK_DATA.turmas.map(turma => {
                const vagasTurma = vagas.turmas?.find(v => v.id === turma.id) || {
                    id: turma.id,
                    nome: turma.nome,
                    totalVagas: 35,
                    ocupadas: turma.totalAlunos,
                    disponiveis: 35 - turma.totalAlunos,
                    listaEspera: 0
                };
                return vagasTurma;
            });

            return `
                <div class="vagas-content">
                    <div class="content-header">
                        <h1><i class="fas fa-door-open"></i> Gerenciamento de Vagas</h1>
                        <button class="btn btn-success" onclick="abrirModal('Configurar Vagas', getFormConfigurarVagas())">
                            <i class="fas fa-cog"></i> Configurar
                        </button>
                    </div>
                    
                    <div class="vagas-stats">
                        <div class="stat-card">
                            <div class="stat-icon bg-primary">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Total de Vagas</h3>
                                <p class="stat-number">${todasTurmas.reduce((acc, t) => acc + t.totalVagas, 0)}</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon bg-success">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Vagas Ocupadas</h3>
                                <p class="stat-number">${todasTurmas.reduce((acc, t) => acc + t.ocupadas, 0)}</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon bg-warning">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Vagas Disponíveis</h3>
                                <p class="stat-number">${todasTurmas.reduce((acc, t) => acc + t.disponiveis, 0)}</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon bg-info">
                                <i class="fas fa-list"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Lista de Espera</h3>
                                <p class="stat-number">${vagas.inscricoes?.filter(i => i.status === 'lista_espera').length || 0}</p>
                            </div>
                        </div>
                    </div>
                    
                    <h2><i class="fas fa-chart-bar"></i> Ocupação por Turma</h2>
                    <div class="vagas-turmas">
                        ${todasTurmas.map(turma => {
                            const percentual = (turma.ocupadas / turma.totalVagas) * 100;
                            return `
                                <div class="vaga-turma-card">
                                    <div class="turma-header">
                                        <h3>Turma ${turma.nome}</h3>
                                        <span class="badge ${turma.disponiveis > 0 ? 'badge-success' : 'badge-danger'}">
                                            ${turma.disponiveis} vagas
                                        </span>
                                    </div>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar" style="width: ${percentual}%"></div>
                                    </div>
                                    <div class="turma-stats">
                                        <span>${turma.ocupadas}/${turma.totalVagas} alunos</span>
                                        <span>${turma.listaEspera > 0 ? `${turma.listaEspera} na espera` : ''}</span>
                                    </div>
                                    <div class="turma-actions">
                                        <button class="btn btn-sm btn-primary" onclick="abrirModal('Ajustar Vagas', getFormAjustarVagas(${turma.id}))">
                                            <i class="fas fa-sliders-h"></i> Ajustar
                                        </button>
                                        <button class="btn btn-sm btn-info" onclick="abrirModal('Lista de Espera', getListaEspera(${turma.id}))">
                                            <i class="fas fa-list"></i> Ver Espera
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <h2 style="margin-top: 40px;"><i class="fas fa-file-signature"></i> Solicitações de Matrícula</h2>
                    <div class="solicitacoes-lista">
                        ${vagas.inscricoes?.map(inscricao => `
                            <div class="solicitacao-card">
                                <div class="solicitacao-header">
                                    <h3>${inscricao.nomeAluno}</h3>
                                    <span class="status-badge ${inscricao.status}">${inscricao.status}</span>
                                </div>
                                <div class="solicitacao-body">
                                    <p><strong>Turma Desejada:</strong> ${inscricao.turmaDesejada}</p>
                                    <p><strong>Data:</strong> ${new Date(inscricao.data).toLocaleDateString('pt-BR')}</p>
                                    <p><strong>Responsável:</strong> ${inscricao.responsavel}</p>
                                    <p><strong>Telefone:</strong> ${inscricao.telefone}</p>
                                </div>
                                <div class="solicitacao-footer">
                                    <button class="btn btn-sm btn-success" onclick="aprovarInscricao(${inscricao.id})">
                                        <i class="fas fa-check"></i> Aprovar
                                    </button>
                                    <button class="btn btn-sm btn-warning" onclick="colocarEspera(${inscricao.id})">
                                        <i class="fas fa-clock"></i> Lista de Espera
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="rejeitarInscricao(${inscricao.id})">
                                        <i class="fas fa-times"></i> Rejeitar
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                        
                        ${(!vagas.inscricoes || vagas.inscricoes.length === 0) ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Nenhuma solicitação pendente</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        function renderizarVagasDisponiveis() {
            const turmasDisponiveis = MOCK_DATA.turmas.filter(t => {
                const vagasTurma = vagas.turmas?.find(v => v.id === t.id);
                return vagasTurma ? vagasTurma.disponiveis > 0 : true;
            });

            return `
                <div class="vagas-content">
                    <div class="content-header">
                        <h1><i class="fas fa-search"></i> Vagas Disponíveis</h1>
                        <button class="btn btn-success" onclick="abrirModal('Solicitar Matrícula', getFormSolicitacaoMatricula())">
                            <i class="fas fa-plus"></i> Solicitar Matrícula
                        </button>
                    </div>
                    
                    <div class="vagas-grid">
                        ${turmasDisponiveis.map(turma => {
                            const vagasTurma = vagas.turmas?.find(v => v.id === turma.id) || {
                                disponiveis: 35 - turma.totalAlunos,
                                totalVagas: 35
                            };
                            
                            if (vagasTurma.disponiveis <= 0) return '';
                            
                            return `
                                <div class="vaga-card">
                                    <h3>Turma ${turma.nome}</h3>
                                    <p><i class="fas fa-clock"></i> Período: ${turma.periodo}</p>
                                    <p><i class="fas fa-users"></i> Vagas: ${vagasTurma.disponiveis} de ${vagasTurma.totalVagas}</p>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar" style="width: ${((turma.totalAlunos || 0) / vagasTurma.totalVagas) * 100}%"></div>
                                    </div>
                                    <button class="btn btn-primary btn-block" onclick="abrirModal('Solicitar Matrícula', getFormSolicitacaoMatricula(${turma.id}))">
                                        Solicitar Vaga
                                    </button>
                                </div>
                            `;
                        }).join('')}
                        
                        ${turmasDisponiveis.filter(t => {
                            const vagasTurma = vagas.turmas?.find(v => v.id === t.id);
                            return vagasTurma ? vagasTurma.disponiveis > 0 : true;
                        }).length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Não há vagas disponíveis no momento</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        function renderizarVagasEscola() {
            const usuario = SISTEMA.getEstado().usuario;
            const escola = MOCK_DATA.escolas.find(e => e.id === usuario.escolaId);
            const turmasEscola = MOCK_DATA.turmas.filter(t => t.escolaId === escola?.id);

            return `
                <div class="vagas-content">
                    <div class="content-header">
                        <h1><i class="fas fa-door-open"></i> Vagas - ${escola?.nome}</h1>
                    </div>
                    
                    <div class="vagas-turmas">
                        ${turmasEscola.map(turma => {
                            const vagasTurma = vagas.turmas?.find(v => v.id === turma.id) || {
                                disponiveis: 35 - turma.totalAlunos,
                                totalVagas: 35,
                                listaEspera: 0
                            };
                            return `
                                <div class="vaga-turma-card">
                                    <h3>Turma ${turma.nome}</h3>
                                    <p>Vagas: ${vagasTurma.disponiveis}/${vagasTurma.totalVagas}</p>
                                    <p>Lista de Espera: ${vagasTurma.listaEspera || 0}</p>
                                    <button class="btn btn-sm btn-info" onclick="abrirModal('Ver Solicitantes', getSolicitantesTurma(${turma.id}))">
                                        Ver Solicitantes
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES DE FORMULÁRIO ====================
        function getFormSolicitacaoMatricula(turmaId = null) {
            return `
                <form id="form-solicitacao-matricula" onsubmit="event.preventDefault(); enviarSolicitacaoMatricula()">
                    <div class="form-group">
                        <label>Nome do Aluno *</label>
                        <input type="text" class="form-control" id="sol-nome" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Data de Nascimento *</label>
                        <input type="date" class="form-control" id="sol-nascimento" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Turma Desejada *</label>
                        <select class="form-control" id="sol-turma" required>
                            <option value="">Selecione...</option>
                            ${MOCK_DATA.turmas.map(t => `
                                <option value="${t.id}" ${turmaId === t.id ? 'selected' : ''}>${t.nome} - ${t.periodo}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Nome do Responsável *</label>
                        <input type="text" class="form-control" id="sol-responsavel" required>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Telefone *</label>
                                <input type="tel" class="form-control" id="sol-telefone" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>E-mail</label>
                                <input type="email" class="form-control" id="sol-email">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Endereço</label>
                        <input type="text" class="form-control" id="sol-endereco">
                    </div>
                    
                    <div class="form-group">
                        <label>Documentos</label>
                        <input type="file" class="form-control" id="sol-documentos" multiple>
                        <small class="text-muted">RG, CPF, Comprovante de residência</small>
                    </div>
                </form>
            `;
        }

        function getFormConfigurarVagas() {
            return `
                <form id="form-configurar-vagas" onsubmit="event.preventDefault(); configurarVagas()">
                    <p>Configure a capacidade padrão das turmas:</p>
                    
                    <div class="form-group">
                        <label>Vagas por Turma (Ensino Fundamental I)</label>
                        <input type="number" class="form-control" id="vagas-fund1" value="35" min="20" max="40">
                    </div>
                    
                    <div class="form-group">
                        <label>Vagas por Turma (Ensino Fundamental II)</label>
                        <input type="number" class="form-control" id="vagas-fund2" value="40" min="20" max="45">
                    </div>
                    
                    <div class="form-group">
                        <label>Vagas por Turma (Ensino Médio)</label>
                        <input type="number" class="form-control" id="vagas-medio" value="45" min="20" max="50">
                    </div>
                    
                    <hr>
                    
                    <p>Ajuste individual por turma:</p>
                    ${MOCK_DATA.turmas.map(turma => `
                        <div class="form-group">
                            <label>Turma ${turma.nome}</label>
                            <input type="number" class="form-control" id="vaga-${turma.id}" value="35" min="20" max="50">
                        </div>
                    `).join('')}
                </form>
            `;
        }

        function getFormAjustarVagas(turmaId) {
            const turma = MOCK_DATA.turmas.find(t => t.id === turmaId);
            const vagasTurma = vagas.turmas?.find(v => v.id === turmaId) || {
                totalVagas: 35,
                ocupadas: turma?.totalAlunos || 0
            };

            return `
                <form id="form-ajustar-vagas" onsubmit="event.preventDefault(); ajustarVagas(${turmaId})">
                    <h3>Turma ${turma?.nome}</h3>
                    
                    <div class="form-group">
                        <label>Total de Vagas</label>
                        <input type="number" class="form-control" id="ajuste-total" value="${vagasTurma.totalVagas}" min="${vagasTurma.ocupadas}" max="50">
                    </div>
                    
                    <div class="form-group">
                        <label>Vagas Ocupadas Atualmente</label>
                        <input type="number" class="form-control" value="${vagasTurma.ocupadas}" readonly disabled>
                    </div>
                    
                    <div class="form-group">
                        <label>Novas Vagas Disponíveis</label>
                        <input type="number" class="form-control" id="ajuste-disponiveis" value="${vagasTurma.totalVagas - vagasTurma.ocupadas}" readonly disabled>
                    </div>
                    
                    <p class="text-info">
                        <i class="fas fa-info-circle"></i>
                        Alunos na lista de espera: ${vagasTurma.listaEspera || 0}
                    </p>
                </form>
            `;
        }

        function getListaEspera(turmaId) {
            const turma = MOCK_DATA.turmas.find(t => t.id === turmaId);
            const espera = vagas.inscricoes?.filter(i => 
                i.turmaDesejada === turma?.nome && i.status === 'lista_espera'
            ) || [];

            return `
                <div class="lista-espera">
                    <h3>Lista de Espera - Turma ${turma?.nome}</h3>
                    
                    ${espera.length > 0 ? `
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Aluno</th>
                                    <th>Data</th>
                                    <th>Responsável</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${espera.map((e, index) => `
                                    <tr>
                                        <td>${e.nomeAluno}</td>
                                        <td>${new Date(e.data).toLocaleDateString('pt-BR')}</td>
                                        <td>${e.responsavel}</td>
                                        <td>
                                            <button class="btn btn-sm btn-success" onclick="chamarDaEspera(${e.id})">
                                                Chamar
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : `
                        <p>Nenhum aluno na lista de espera</p>
                    `}
                </div>
            `;
        }

        function getSolicitantesTurma(turmaId) {
            const turma = MOCK_DATA.turmas.find(t => t.id === turmaId);
            const solicitantes = vagas.inscricoes?.filter(i => 
                i.turmaDesejada === turma?.nome && i.status === 'pendente'
            ) || [];

            return `
                <div class="solicitantes">
                    <h3>Solicitantes - Turma ${turma?.nome}</h3>
                    
                    ${solicitantes.map(s => `
                        <div class="solicitante-card">
                            <h4>${s.nomeAluno}</h4>
                            <p>Responsável: ${s.responsavel}</p>
                            <p>Telefone: ${s.telefone}</p>
                            <p>Data: ${new Date(s.data).toLocaleDateString('pt-BR')}</p>
                            <div class="actions">
                                <button class="btn btn-sm btn-success" onclick="aprovarInscricao(${s.id})">Aprovar</button>
                                <button class="btn btn-sm btn-warning" onclick="colocarEspera(${s.id})">Espera</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // ==================== FUNÇÕES DE AÇÃO ====================
        function enviarSolicitacaoMatricula() {
            const nome = document.getElementById('sol-nome')?.value;
            const nascimento = document.getElementById('sol-nascimento')?.value;
            const turma = document.getElementById('sol-turma')?.value;
            const responsavel = document.getElementById('sol-responsavel')?.value;
            const telefone = document.getElementById('sol-telefone')?.value;

            if (!nome || !nascimento || !turma || !responsavel || !telefone) {
                mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
                return;
            }

            const turmaObj = MOCK_DATA.turmas.find(t => t.id === parseInt(turma));

            const novaInscricao = {
                id: Date.now(),
                nomeAluno: nome,
                dataNascimento: nascimento,
                turmaDesejada: turmaObj?.nome,
                data: new Date().toISOString().split('T')[0],
                status: 'pendente',
                responsavel: responsavel,
                telefone: telefone,
                email: document.getElementById('sol-email')?.value,
                endereco: document.getElementById('sol-endereco')?.value
            };

            if (!vagas.inscricoes) vagas.inscricoes = [];
            vagas.inscricoes.push(novaInscricao);
            
            salvarDados();
            fecharModal();
            mostrarMensagem('Solicitação enviada com sucesso! Aguarde contato.', 'success');
        }

        function aprovarInscricao(id) {
            const inscricao = vagas.inscricoes?.find(i => i.id === id);
            if (!inscricao) return;

            inscricao.status = 'aprovado';
            
            // Encontrar turma
            const turma = MOCK_DATA.turmas.find(t => t.nome === inscricao.turmaDesejada);
            if (turma) {
                // Atualizar vagas
                const vagasTurma = vagas.turmas?.find(v => v.id === turma.id);
                if (vagasTurma) {
                    vagasTurma.ocupadas += 1;
                    vagasTurma.disponiveis -= 1;
                }
            }

            salvarDados();
            mostrarMensagem('Matrícula aprovada!', 'success');
            fecharModal();
        }

        function colocarEspera(id) {
            const inscricao = vagas.inscricoes?.find(i => i.id === id);
            if (!inscricao) return;

            inscricao.status = 'lista_espera';
            
            const turma = MOCK_DATA.turmas.find(t => t.nome === inscricao.turmaDesejada);
            if (turma) {
                const vagasTurma = vagas.turmas?.find(v => v.id === turma.id);
                if (vagasTurma) {
                    vagasTurma.listaEspera = (vagasTurma.listaEspera || 0) + 1;
                }
            }

            salvarDados();
            mostrarMensagem('Aluno adicionado à lista de espera', 'info');
        }

        function rejeitarInscricao(id) {
            if (confirm('Deseja realmente rejeitar esta solicitação?')) {
                vagas.inscricoes = vagas.inscricoes?.filter(i => i.id !== id);
                salvarDados();
                mostrarMensagem('Solicitação rejeitada', 'info');
            }
        }

        function chamarDaEspera(id) {
            const inscricao = vagas.inscricoes?.find(i => i.id === id);
            if (!inscricao) return;

            inscricao.status = 'pendente';
            
            const turma = MOCK_DATA.turmas.find(t => t.nome === inscricao.turmaDesejada);
            if (turma) {
                const vagasTurma = vagas.turmas?.find(v => v.id === turma.id);
                if (vagasTurma) {
                    vagasTurma.listaEspera = Math.max(0, (vagasTurma.listaEspera || 0) - 1);
                }
            }

            salvarDados();
            mostrarMensagem('Aluno removido da lista de espera', 'success');
        }

        function ajustarVagas(turmaId) {
            const totalVagas = document.getElementById('ajuste-total')?.value;
            if (!totalVagas) return;

            const turma = MOCK_DATA.turmas.find(t => t.id === turmaId);
            if (!turma) return;

            if (!vagas.turmas) vagas.turmas = [];
            
            let vagasTurma = vagas.turmas.find(v => v.id === turmaId);
            if (!vagasTurma) {
                vagasTurma = {
                    id: turmaId,
                    nome: turma.nome,
                    totalVagas: parseInt(totalVagas),
                    ocupadas: turma.totalAlunos,
                    disponiveis: parseInt(totalVagas) - turma.totalAlunos,
                    listaEspera: 0
                };
                vagas.turmas.push(vagasTurma);
            } else {
                vagasTurma.totalVagas = parseInt(totalVagas);
                vagasTurma.disponiveis = vagasTurma.totalVagas - vagasTurma.ocupadas;
            }

            salvarDados();
            fecharModal();
            mostrarMensagem('Vagas ajustadas com sucesso!', 'success');
        }

        function configurarVagas() {
            const vagasFund1 = document.getElementById('vagas-fund1')?.value;
            const vagasFund2 = document.getElementById('vagas-fund2')?.value;
            const vagasMedio = document.getElementById('vagas-medio')?.value;

            MOCK_DATA.turmas.forEach(turma => {
                let totalVagas = 35;
                if (turma.nome.includes('6º') || turma.nome.includes('7º') || 
                    turma.nome.includes('8º') || turma.nome.includes('9º')) {
                    totalVagas = parseInt(vagasFund2);
                } else if (turma.nome.includes('1º') || turma.nome.includes('2º') || turma.nome.includes('3º')) {
                    totalVagas = parseInt(vagasMedio);
                } else {
                    totalVagas = parseInt(vagasFund1);
                }

                if (!vagas.turmas) vagas.turmas = [];
                
                let vagasTurma = vagas.turmas.find(v => v.id === turma.id);
                if (!vagasTurma) {
                    vagas.turmas.push({
                        id: turma.id,
                        nome: turma.nome,
                        totalVagas: totalVagas,
                        ocupadas: turma.totalAlunos,
                        disponiveis: totalVagas - turma.totalAlunos,
                        listaEspera: 0
                    });
                } else {
                    vagasTurma.totalVagas = totalVagas;
                    vagasTurma.disponiveis = totalVagas - vagasTurma.ocupadas;
                }
            });

            salvarDados();
            fecharModal();
            mostrarMensagem('Configuração salva com sucesso!', 'success');
        }

        function salvarDados() {
            if (!MOCK_DATA.vagas) MOCK_DATA.vagas = {};
            MOCK_DATA.vagas = vagas;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarVagas,
            getFormSolicitacaoMatricula,
            getFormConfigurarVagas,
            getFormAjustarVagas,
            getListaEspera,
            enviarSolicitacaoMatricula,
            aprovarInscricao,
            colocarEspera,
            rejeitarInscricao,
            chamarDaEspera,
            ajustarVagas,
            configurarVagas
        };
    })();

    window.MODULO_VAGAS = MODULO_VAGAS;
    console.log('✅ Módulo de Vagas e Matrículas carregado');
}
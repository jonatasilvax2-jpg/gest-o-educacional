// modulos/estagio.js - Módulo de Estágio
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_ESTAGIO === 'undefined') {
    const MODULO_ESTAGIO = (function() {
        'use strict';

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarMeuEstagio(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const estagio = MOCK_DATA.estagios.find(e => e.alunoId === usuario.id);

            if (!estagio) {
                return `
                    <div class="estagio-content">
                        <div class="content-header">
                            <h1><i class="fas fa-briefcase"></i> Meu Estágio</h1>
                        </div>
                        <div class="no-data">
                            <i class="fas fa-info-circle"></i>
                            <p>Você não possui estágio cadastrado.</p>
                            <button class="btn btn-primary" onclick="abrirModal('Cadastrar Estágio', getFormEstagio())">
                                <i class="fas fa-plus"></i> Cadastrar Estágio
                            </button>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="estagio-content">
                    <div class="content-header">
                        <h1><i class="fas fa-briefcase"></i> Meu Estágio</h1>
                    </div>
                    
                    <div class="estagio-card">
                        <div class="estagio-header">
                            <h2>${estagio.empresa}</h2>
                            <span class="status-badge ${estagio.status}">${estagio.status}</span>
                        </div>
                        
                        <div class="estagio-body">
                            <div class="info-grid">
                                <div class="info-item">
                                    <i class="fas fa-building"></i>
                                    <div>
                                        <strong>Empresa</strong>
                                        <p>${estagio.empresa}</p>
                                    </div>
                                </div>
                                
                                <div class="info-item">
                                    <i class="fas fa-tasks"></i>
                                    <div>
                                        <strong>Área</strong>
                                        <p>${estagio.area}</p>
                                    </div>
                                </div>
                                
                                <div class="info-item">
                                    <i class="fas fa-user-tie"></i>
                                    <div>
                                        <strong>Orientador</strong>
                                        <p>${estagio.orientadorNome}</p>
                                    </div>
                                </div>
                                
                                <div class="info-item">
                                    <i class="fas fa-clock"></i>
                                    <div>
                                        <strong>Carga Horária</strong>
                                        <p>${estagio.cargaHoraria} horas/semana</p>
                                    </div>
                                </div>
                                
                                <div class="info-item">
                                    <i class="fas fa-calendar"></i>
                                    <div>
                                        <strong>Período</strong>
                                        <p>${new Date(estagio.dataInicio).toLocaleDateString('pt-BR')} - ${new Date(estagio.dataFim).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                </div>
                                
                                <div class="info-item">
                                    <i class="fas fa-star"></i>
                                    <div>
                                        <strong>Avaliação</strong>
                                        <p>${estagio.avaliacao || 'Não avaliado'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <h3 style="margin-top: 30px;">Relatórios de Estágio</h3>
                            <div class="relatorios-lista">
                                ${[1, 2, 3].map(mes => `
                                    <div class="relatorio-item">
                                        <span><i class="fas fa-file-alt"></i> Relatório do ${mes}º mês</span>
                                        <span class="status-badge ${mes <= 2 ? 'entregue' : 'pendente'}">
                                            ${mes <= 2 ? 'Entregue' : 'Pendente'}
                                        </span>
                                        ${mes <= 2 ? `
                                            <button class="btn btn-sm btn-primary">
                                                <i class="fas fa-eye"></i> Ver
                                            </button>
                                        ` : `
                                            <button class="btn btn-sm btn-success" onclick="abrirModal('Entregar Relatório', getFormRelatorio(${mes}))">
                                                <i class="fas fa-upload"></i> Entregar
                                            </button>
                                        `}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderizarVagasEstagio(secao) {
            const vagas = [
                {
                    id: 1,
                    empresa: 'Tech Solutions',
                    area: 'Desenvolvimento',
                    cargaHoraria: 20,
                    valor: 800.00,
                    requisitos: ['Cursando TI', 'Conhecimento em JavaScript'],
                    descricao: 'Estágio em desenvolvimento web'
                },
                {
                    id: 2,
                    empresa: 'Escritório Modelo',
                    area: 'Administração',
                    cargaHoraria: 25,
                    valor: 650.00,
                    requisitos: ['Cursando Administração', 'Pacote Office'],
                    descricao: 'Auxiliar administrativo'
                }
            ];

            return `
                <div class="vagas-estagio-content">
                    <div class="content-header">
                        <h1><i class="fas fa-search"></i> Vagas de Estágio</h1>
                    </div>
                    
                    <div class="vagas-grid">
                        ${vagas.map(vaga => `
                            <div class="vaga-card">
                                <h3>${vaga.empresa}</h3>
                                <p><strong>Área:</strong> ${vaga.area}</p>
                                <p><strong>Carga Horária:</strong> ${vaga.cargaHoraria}h/semana</p>
                                <p><strong>Bolsa:</strong> R$ ${vaga.valor.toFixed(2)}</p>
                                <p><strong>Requisitos:</strong></p>
                                <ul>
                                    ${vaga.requisitos.map(r => `<li>${r}</li>`).join('')}
                                </ul>
                                <p>${vaga.descricao}</p>
                                <button class="btn btn-primary" onclick="abrirModal('Candidatar-se', getFormCandidatura(${vaga.id}))">
                                    <i class="fas fa-paper-plane"></i> Candidatar-se
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function renderizarOrientacoes(secao) {
            return `
                <div class="orientacoes-content">
                    <div class="content-header">
                        <h1><i class="fas fa-chalkboard-teacher"></i> Orientações de Estágio</h1>
                    </div>
                    
                    <div class="orientacoes-lista">
                        <div class="orientacao-card">
                            <h3>Documentação Necessária</h3>
                            <ul>
                                <li>Termo de Compromisso de Estágio</li>
                                <li>Plano de Atividades do Estagiário</li>
                                <li>Apólice de Seguro</li>
                                <li>Relatórios de Acompanhamento</li>
                                <li>Avaliação do Supervisor</li>
                            </ul>
                        </div>
                        
                        <div class="orientacao-card">
                            <h3>Prazos Importantes</h3>
                            <ul>
                                <li>Relatório 1º mês: até 30 dias</li>
                                <li>Relatório 2º mês: até 60 dias</li>
                                <li>Relatório 3º mês: até 90 dias</li>
                                <li>Relatório Final: até 15 dias após término</li>
                            </ul>
                        </div>
                        
                        <div class="orientacao-card">
                            <h3>Contatos Úteis</h3>
                            <ul>
                                <li><i class="fas fa-phone"></i> Coordenação de Estágios: (11) 3333-4444</li>
                                <li><i class="fas fa-envelope"></i> estagios@educacao.gov.br</li>
                                <li><i class="fas fa-map-marker-alt"></i> Sala de Estágios - Bloco B</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function getFormEstagio(id = null) {
            return `
                <form id="form-estagio">
                    <div class="form-group">
                        <label>Empresa *</label>
                        <input type="text" class="form-control" placeholder="Nome da empresa" required>
                    </div>
                    <div class="form-group">
                        <label>Área de Atuação *</label>
                        <input type="text" class="form-control" placeholder="Ex: Desenvolvimento, Administração" required>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Carga Horária Semanal</label>
                                <input type="number" class="form-control" placeholder="20">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Valor da Bolsa (R$)</label>
                                <input type="number" class="form-control" step="0.01" placeholder="800.00">
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
                    <div class="form-group">
                        <label>Nome do Orientador</label>
                        <input type="text" class="form-control" placeholder="Nome do supervisor">
                    </div>
                    <div class="form-group">
                        <label>Descrição das Atividades</label>
                        <textarea class="form-control" rows="4" placeholder="Descreva as atividades realizadas..."></textarea>
                    </div>
                </form>
            `;
        }

        function getFormRelatorio(mes) {
            return `
                <form id="form-relatorio">
                    <p><strong>Relatório do ${mes}º mês de estágio</strong></p>
                    <div class="form-group">
                        <label>Atividades Realizadas</label>
                        <textarea class="form-control" rows="5" placeholder="Descreva as atividades realizadas neste período..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Dificuldades Encontradas</label>
                        <textarea class="form-control" rows="3" placeholder="Descreva as dificuldades..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Aprendizados</label>
                        <textarea class="form-control" rows="3" placeholder="O que você aprendeu..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Anexar Relatório</label>
                        <input type="file" class="form-control">
                    </div>
                </form>
            `;
        }

        function getFormCandidatura(vagaId) {
            return `
                <form id="form-candidatura">
                    <p><strong>Candidatar-se à vaga</strong></p>
                    <div class="form-group">
                        <label>Carta de Apresentação</label>
                        <textarea class="form-control" rows="5" placeholder="Fale sobre você e seu interesse na vaga..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Currículo</label>
                        <input type="file" class="form-control" accept=".pdf,.doc,.docx">
                    </div>
                    <div class="form-group">
                        <label>Disponibilidade</label>
                        <input type="text" class="form-control" placeholder="Ex: Manhãs, 20h semanais">
                    </div>
                </form>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarMeuEstagio,
            renderizarVagasEstagio,
            renderizarOrientacoes,
            getFormEstagio,
            getFormRelatorio,
            getFormCandidatura
        };
    })();

    window.MODULO_ESTAGIO = MODULO_ESTAGIO;
    console.log('✅ Módulo de Estágio carregado');
}
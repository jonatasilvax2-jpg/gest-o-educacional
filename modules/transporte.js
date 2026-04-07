// modulos/transporte.js - Módulo de Transporte Escolar
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_TRANSPORTE === 'undefined') {
    const MODULO_TRANSPORTE = (function() {
        'use strict';

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarRotas(secao) {
            const rotas = MOCK_DATA.transporte.rotas;

            return `
                <div class="transporte-content">
                    <div class="content-header">
                        <h1><i class="fas fa-bus"></i> Rotas de Transporte</h1>
                        <button class="btn btn-success" onclick="abrirModal('Nova Rota', getFormRota())">
                            <i class="fas fa-plus"></i> Nova Rota
                        </button>
                    </div>
                    
                    <div class="rotas-grid">
                        ${rotas.map(rota => `
                            <div class="rota-card">
                                <div class="rota-header">
                                    <h3>${rota.nome}</h3>
                                    <span class="status-badge ativo">Ativa</span>
                                </div>
                                <div class="rota-body">
                                    <p><i class="fas fa-user"></i> Motorista: ${rota.motorista}</p>
                                    <p><i class="fas fa-truck"></i> Veículo: ${rota.veiculo} (${rota.placa})</p>
                                    <p><i class="fas fa-users"></i> Capacidade: ${rota.capacidade} alunos</p>
                                    <p><i class="fas fa-user-check"></i> Alunos: ${rota.alunos}/${rota.capacidade}</p>
                                    <p><i class="fas fa-clock"></i> Horário: ${rota.inicio} - ${rota.fim}</p>
                                    <p><i class="fas fa-calendar"></i> Dias: ${rota.dias.join(', ')}</p>
                                    
                                    <h4>Pontos de Parada:</h4>
                                    <ol class="pontos-lista">
                                        ${rota.pontos.map(ponto => `
                                            <li>
                                                <strong>${ponto.local}</strong> - ${ponto.horario}
                                            </li>
                                        `).join('')}
                                    </ol>
                                </div>
                                <div class="rota-footer">
                                    <button class="btn btn-sm btn-primary" onclick="abrirModal('${rota.nome}', getDetalhesRota(${rota.id}))">
                                        <i class="fas fa-eye"></i> Detalhes
                                    </button>
                                    <button class="btn btn-sm btn-secondary" onclick="abrirModal('Editar', getFormRota(${rota.id}))">
                                        <i class="fas fa-edit"></i> Editar
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="removerRota(${rota.id})">
                                        <i class="fas fa-trash"></i> Remover
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function renderizarMeuTransporte(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const transporte = MOCK_DATA.transporte.alunosTransporte.find(t => t.alunoId === usuario.id);

            if (!transporte) {
                return `
                    <div class="transporte-content">
                        <div class="content-header">
                            <h1><i class="fas fa-bus"></i> Meu Transporte</h1>
                        </div>
                        <div class="no-data">
                            <i class="fas fa-info-circle"></i>
                            <p>Você não está cadastrado no transporte escolar.</p>
                        </div>
                    </div>
                `;
            }

            const rota = MOCK_DATA.transporte.rotas.find(r => r.id === transporte.rotaId);

            return `
                <div class="transporte-content">
                    <div class="content-header">
                        <h1><i class="fas fa-bus"></i> Meu Transporte</h1>
                    </div>
                    
                    <div class="meu-transporte-card">
                        <h2>${rota.nome}</h2>
                        
                        <div class="info-grid">
                            <div class="info-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <div>
                                    <strong>Ponto de Embarque</strong>
                                    <p>${transporte.ponto}</p>
                                </div>
                            </div>
                            
                            <div class="info-item">
                                <i class="fas fa-clock"></i>
                                <div>
                                    <strong>Horário</strong>
                                    <p>${transporte.horario}</p>
                                </div>
                            </div>
                            
                            <div class="info-item">
                                <i class="fas fa-user"></i>
                                <div>
                                    <strong>Motorista</strong>
                                    <p>${rota.motorista}</p>
                                </div>
                            </div>
                            
                            <div class="info-item">
                                <i class="fas fa-truck"></i>
                                <div>
                                    <strong>Veículo</strong>
                                    <p>${rota.veiculo} - ${rota.placa}</p>
                                </div>
                            </div>
                        </div>
                        
                        <h3 style="margin-top: 30px;">Próximos Horários</h3>
                        <div class="horarios-semana">
                            ${rota.dias.map(dia => `
                                <div class="dia-horario">
                                    <span class="dia">${dia}</span>
                                    <span class="horario">${rota.inicio}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        function renderizarVeiculos(secao) {
            const veiculos = MOCK_DATA.transporte.veiculos;

            return `
                <div class="veiculos-content">
                    <div class="content-header">
                        <h1><i class="fas fa-truck"></i> Frota de Veículos</h1>
                        <button class="btn btn-success" onclick="abrirModal('Novo Veículo', getFormVeiculo())">
                            <i class="fas fa-plus"></i> Novo Veículo
                        </button>
                    </div>
                    
                    <div class="veiculos-grid">
                        ${veiculos.map(veiculo => {
                            const diasVistoria = Math.ceil((new Date(veiculo.vistoria) - new Date()) / (1000 * 60 * 60 * 24));
                            
                            return `
                                <div class="veiculo-card">
                                    <div class="veiculo-header">
                                        <h3>${veiculo.tipo} - ${veiculo.modelo}</h3>
                                        <span class="status-badge ${veiculo.status}">${veiculo.status}</span>
                                    </div>
                                    <div class="veiculo-body">
                                        <p><i class="fas fa-id-card"></i> Placa: ${veiculo.placa}</p>
                                        <p><i class="fas fa-calendar"></i> Ano: ${veiculo.ano}</p>
                                        <p><i class="fas fa-users"></i> Capacidade: ${veiculo.capacidade} lugares</p>
                                        <p><i class="fas fa-shield-alt"></i> Seguro: ${veiculo.seguro}</p>
                                        <p><i class="fas fa-calendar-check"></i> Vistoria: ${new Date(veiculo.vistoria).toLocaleDateString('pt-BR')}</p>
                                        ${diasVistoria < 30 ? `
                                            <p class="text-warning">
                                                <i class="fas fa-exclamation-triangle"></i>
                                                Vistoria vence em ${diasVistoria} dias
                                            </p>
                                        ` : ''}
                                        ${veiculo.observacoes ? `<p><i class="fas fa-info-circle"></i> ${veiculo.observacoes}</p>` : ''}
                                    </div>
                                    <div class="veiculo-footer">
                                        <button class="btn btn-sm btn-primary" onclick="abrirModal('Editar', getFormVeiculo(${veiculo.id}))">
                                            <i class="fas fa-edit"></i> Editar
                                        </button>
                                        <button class="btn btn-sm btn-warning" onclick="abrirModal('Manutenção', getFormManutencao(${veiculo.id}))">
                                            <i class="fas fa-tools"></i> Manutenção
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        function renderizarMotoristas(secao) {
            const motoristas = MOCK_DATA.transporte.motoristas;

            return `
                <div class="motoristas-content">
                    <div class="content-header">
                        <h1><i class="fas fa-user"></i> Motoristas</h1>
                        <button class="btn btn-success" onclick="abrirModal('Novo Motorista', getFormMotorista())">
                            <i class="fas fa-plus"></i> Novo Motorista
                        </button>
                    </div>
                    
                    <div class="motoristas-grid">
                        ${motoristas.map(motorista => {
                            const diasCNH = Math.ceil((new Date(motorista.validade) - new Date()) / (1000 * 60 * 60 * 24));
                            
                            return `
                                <div class="motorista-card">
                                    <div class="motorista-avatar">
                                        <i class="fas fa-user-circle"></i>
                                    </div>
                                    <div class="motorista-info">
                                        <h3>${motorista.nome}</h3>
                                        <p><i class="fas fa-id-card"></i> CNH: ${motorista.cnh} (${motorista.categoria})</p>
                                        <p><i class="fas fa-calendar"></i> Validade: ${new Date(motorista.validade).toLocaleDateString('pt-BR')}</p>
                                        ${diasCNH < 30 ? `
                                            <p class="text-warning">
                                                <i class="fas fa-exclamation-triangle"></i>
                                                CNH vence em ${diasCNH} dias
                                            </p>
                                        ` : ''}
                                        <p><i class="fas fa-phone"></i> ${motorista.telefone}</p>
                                        <p><i class="fas fa-calendar-alt"></i> Admissão: ${new Date(motorista.dataAdmissao).toLocaleDateString('pt-BR')}</p>
                                        <p><strong>Status:</strong> <span class="status-badge ${motorista.status}">${motorista.status}</span></p>
                                    </div>
                                    <div class="motorista-acoes">
                                        <button class="btn btn-sm btn-primary" onclick="abrirModal('Editar', getFormMotorista(${motorista.id}))">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function getFormRota(id = null) {
            if (id) {
                const rota = MOCK_DATA.transporte.rotas.find(r => r.id === id);
                if (!rota) return '<p>Rota não encontrada</p>';

                return `
                    <form id="form-rota">
                        <div class="form-group">
                            <label>Nome da Rota</label>
                            <input type="text" class="form-control" value="${rota.nome}">
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Motorista</label>
                                    <input type="text" class="form-control" value="${rota.motorista}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Veículo</label>
                                    <input type="text" class="form-control" value="${rota.veiculo}">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Horário Início</label>
                                    <input type="time" class="form-control" value="${rota.inicio}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Horário Fim</label>
                                    <input type="time" class="form-control" value="${rota.fim}">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Dias de Operação</label>
                            <div class="dias-checkbox">
                                ${['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(dia => `
                                    <label>
                                        <input type="checkbox" value="${dia}" ${rota.dias.includes(dia) ? 'checked' : ''}> ${dia}
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    </form>
                `;
            }

            return `
                <form id="form-rota">
                    <div class="form-group">
                        <label>Nome da Rota *</label>
                        <input type="text" class="form-control" placeholder="Ex: Rota Centro" required>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Motorista</label>
                                <input type="text" class="form-control" placeholder="Nome do motorista">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Veículo</label>
                                <input type="text" class="form-control" placeholder="Modelo do veículo">
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Horário Início</label>
                                <input type="time" class="form-control">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Horário Fim</label>
                                <input type="time" class="form-control">
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Dias de Operação</label>
                        <div class="dias-checkbox">
                            <label><input type="checkbox" value="Segunda"> Segunda</label>
                            <label><input type="checkbox" value="Terça"> Terça</label>
                            <label><input type="checkbox" value="Quarta"> Quarta</label>
                            <label><input type="checkbox" value="Quinta"> Quinta</label>
                            <label><input type="checkbox" value="Sexta"> Sexta</label>
                        </div>
                    </div>
                </form>
            `;
        }

        function getDetalhesRota(id) {
            const rota = MOCK_DATA.transporte.rotas.find(r => r.id === id);
            if (!rota) return '<p>Rota não encontrada</p>';

            const alunos = MOCK_DATA.transporte.alunosTransporte.filter(a => a.rotaId === id);

            return `
                <div class="detalhes-rota">
                    <h3>${rota.nome}</h3>
                    <p><strong>Motorista:</strong> ${rota.motorista}</p>
                    <p><strong>Veículo:</strong> ${rota.veiculo} (${rota.placa})</p>
                    <p><strong>Capacidade:</strong> ${rota.capacidade} alunos</p>
                    <p><strong>Ocupação:</strong> ${alunos.length}/${rota.capacidade}</p>
                    
                    <h4 style="margin-top: 20px;">Alunos nesta rota:</h4>
                    <ul>
                        ${alunos.map(a => {
                            const aluno = MOCK_DATA.alunos.find(al => al.id === a.alunoId);
                            return `<li>${aluno ? aluno.nome : 'Aluno não encontrado'} - Ponto: ${a.ponto}</li>`;
                        }).join('')}
                    </ul>
                </div>
            `;
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarRotas,
            renderizarMeuTransporte,
            renderizarVeiculos,
            renderizarMotoristas,
            getFormRota,
            getDetalhesRota,
            getFormVeiculo: () => `<p>Formulário de veículo em desenvolvimento</p>`,
            getFormMotorista: () => `<p>Formulário de motorista em desenvolvimento</p>`,
            getFormManutencao: () => `<p>Formulário de manutenção em desenvolvimento</p>`
        };
    })();

    window.MODULO_TRANSPORTE = MODULO_TRANSPORTE;
    console.log('✅ Módulo de Transporte carregado');
}
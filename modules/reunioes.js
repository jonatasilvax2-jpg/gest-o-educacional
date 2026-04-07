// modulos/reunioes.js - Módulo de Reuniões e Atas
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_REUNIOES === 'undefined') {
    const MODULO_REUNIOES = (function() {
        'use strict';

        // ==================== DADOS LOCAIS ====================
        let reunioes = MOCK_DATA.reunioes || [];

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarReunioes(secao) {
            const usuario = SISTEMA.getEstado().usuario;

            if (secao === 'listar' || usuario.perfil === 'secretaria' || usuario.perfil === 'diretor') {
                return renderizarGerenciamentoReunioes();
            } else if (usuario.perfil === 'professor') {
                return renderizarMinhasReunioes();
            } else {
                return renderizarReunioesPublicas();
            }
        }

        function renderizarGerenciamentoReunioes() {
            const reunioesFuturas = reunioes.filter(r => new Date(r.data) >= new Date());
            const reunioesPassadas = reunioes.filter(r => new Date(r.data) < new Date());

            return `
                <div class="reunioes-content">
                    <div class="content-header">
                        <h1><i class="fas fa-calendar-alt"></i> Gerenciar Reuniões</h1>
                        <button class="btn btn-success" onclick="abrirModal('Nova Reunião', getFormReuniao())">
                            <i class="fas fa-plus"></i> Nova Reunião
                        </button>
                    </div>
                    
                    <div class="reunioes-tabs">
                        <button class="tab-btn active" onclick="mostrarAbaReunioes('futuras')">
                            <i class="fas fa-clock"></i> Futuras (${reunioesFuturas.length})
                        </button>
                        <button class="tab-btn" onclick="mostrarAbaReunioes('passadas')">
                            <i class="fas fa-history"></i> Realizadas (${reunioesPassadas.length})
                        </button>
                        <button class="tab-btn" onclick="mostrarAbaReunioes('todas')">
                            <i class="fas fa-list"></i> Todas
                        </button>
                    </div>
                    
                    <div id="reunioes-futuras" class="reunioes-lista active">
                        ${reunioesFuturas.map(reuniao => criarCardReuniao(reuniao)).join('')}
                        ${reunioesFuturas.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-check-circle text-success"></i>
                                <p>Nenhuma reunião futura agendada</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div id="reunioes-passadas" class="reunioes-lista">
                        ${reunioesPassadas.map(reuniao => criarCardReuniao(reuniao)).join('')}
                        ${reunioesPassadas.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Nenhuma reunião realizada</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div id="reunioes-todas" class="reunioes-lista">
                        ${reunioes.map(reuniao => criarCardReuniao(reuniao)).join('')}
                    </div>
                </div>
            `;
        }

        function renderizarMinhasReunioes() {
            const usuario = SISTEMA.getEstado().usuario;
            const professor = MOCK_DATA.professores.find(p => p.email === usuario.email);
            
            const minhasReunioes = reunioes.filter(r => 
                r.participantes?.includes(professor?.id) || 
                r.tipo === 'pedagogica' ||
                r.tipo === 'conselho'
            );

            return `
                <div class="reunioes-content">
                    <div class="content-header">
                        <h1><i class="fas fa-calendar-alt"></i> Minhas Reuniões</h1>
                    </div>
                    
                    <div class="reunioes-calendario">
                        <h2>Próximas Reuniões</h2>
                        ${minhasReunioes.filter(r => new Date(r.data) >= new Date()).map(reuniao => `
                            <div class="reuniao-card">
                                <div class="reuniao-data">
                                    <span class="dia">${new Date(reuniao.data).getDate()}</span>
                                    <span class="mes">${new Date(reuniao.data).toLocaleString('pt-BR', {month: 'short'})}</span>
                                </div>
                                <div class="reuniao-info">
                                    <h3>${reuniao.titulo}</h3>
                                    <p><i class="fas fa-clock"></i> ${reuniao.horario} (${reuniao.duracao})</p>
                                    <p><i class="fas fa-map-marker-alt"></i> ${reuniao.local}</p>
                                    <p><i class="fas fa-users"></i> Tipo: ${getTipoReuniao(reuniao.tipo)}</p>
                                </div>
                                <button class="btn btn-sm btn-primary" onclick="abrirModal('${reuniao.titulo}', getDetalhesReuniao(${reuniao.id}))">
                                    <i class="fas fa-eye"></i> Detalhes
                                </button>
                            </div>
                        `).join('')}
                        
                        ${minhasReunioes.filter(r => new Date(r.data) >= new Date()).length === 0 ? `
                            <p>Nenhuma reunião agendada</p>
                        ` : ''}
                    </div>
                    
                    <div class="reunioes-passadas">
                        <h2>Reuniões Realizadas</h2>
                        ${minhasReunioes.filter(r => new Date(r.data) < new Date()).slice(0, 5).map(reuniao => `
                            <div class="reuniao-item">
                                <span>${new Date(reuniao.data).toLocaleDateString('pt-BR')}</span>
                                <span>${reuniao.titulo}</span>
                                ${reuniao.ata ? `
                                    <button class="btn btn-sm btn-info" onclick="abrirModal('Ata', getAtaReuniao(${reuniao.id}))">
                                        <i class="fas fa-file-alt"></i> Ver Ata
                                    </button>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function renderizarReunioesPublicas() {
            const reunioesPublicas = reunioes.filter(r => 
                r.tipo === 'pais' || r.tipo === 'geral'
            );

            return `
                <div class="reunioes-content">
                    <div class="content-header">
                        <h1><i class="fas fa-calendar-alt"></i> Reuniões e Eventos</h1>
                    </div>
                    
                    <div class="reunioes-lista">
                        ${reunioesPublicas.map(reuniao => `
                            <div class="reuniao-card publico">
                                <div class="reuniao-data">
                                    <span class="dia">${new Date(reuniao.data).getDate()}</span>
                                    <span class="mes">${new Date(reuniao.data).toLocaleString('pt-BR', {month: 'short'})}</span>
                                </div>
                                <div class="reuniao-info">
                                    <h3>${reuniao.titulo}</h3>
                                    <p><i class="fas fa-clock"></i> ${reuniao.horario}</p>
                                    <p><i class="fas fa-map-marker-alt"></i> ${reuniao.local}</p>
                                    <p><i class="fas fa-info-circle"></i> ${reuniao.descricao || ''}</p>
                                </div>
                                <button class="btn btn-sm btn-primary" onclick="confirmarPresenca(${reuniao.id})">
                                    <i class="fas fa-check"></i> Confirmar Presença
                                </button>
                            </div>
                        `).join('')}
                        
                        ${reunioesPublicas.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Nenhuma reunião pública agendada</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function criarCardReuniao(reuniao) {
            const dataReuniao = new Date(reuniao.data);
            const hoje = new Date();
            const diasRestantes = Math.ceil((dataReuniao - hoje) / (1000 * 60 * 60 * 24));
            
            return `
                <div class="reuniao-card ${diasRestantes <= 2 && diasRestantes > 0 ? 'proxima' : ''}">
                    <div class="reuniao-header">
                        <h3>${reuniao.titulo}</h3>
                        <span class="status-badge ${reuniao.status || 'agendada'}">${reuniao.status || 'Agendada'}</span>
                    </div>
                    <div class="reuniao-body">
                        <p><i class="fas fa-calendar"></i> ${dataReuniao.toLocaleDateString('pt-BR')} às ${reuniao.horario}</p>
                        <p><i class="fas fa-clock"></i> Duração: ${reuniao.duracao}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${reuniao.local}</p>
                        <p><i class="fas fa-users"></i> Tipo: ${getTipoReuniao(reuniao.tipo)}</p>
                        
                        <div class="pauta-resumo">
                            <strong>Pauta:</strong>
                            <ul>
                                ${reuniao.pauta?.map(item => `<li>${item}</li>`).join('') || '<li>Pauta não definida</li>'}
                            </ul>
                        </div>
                        
                        <p><i class="fas fa-user-check"></i> Participantes: ${reuniao.participantes?.length || 0} confirmados</p>
                        
                        ${diasRestantes > 0 ? `
                            <p class="dias-restantes ${diasRestantes <= 2 ? 'text-warning' : ''}">
                                <i class="fas fa-clock"></i> Faltam ${diasRestantes} dias
                            </p>
                        ` : ''}
                    </div>
                    <div class="reuniao-footer">
                        <button class="btn btn-sm btn-primary" onclick="abrirModal('${reuniao.titulo}', getDetalhesReuniao(${reuniao.id}))">
                            <i class="fas fa-eye"></i> Detalhes
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="abrirModal('Editar', getFormReuniao(${reuniao.id}))">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        ${reuniao.ata ? `
                            <button class="btn btn-sm btn-info" onclick="abrirModal('Ata', getAtaReuniao(${reuniao.id}))">
                                <i class="fas fa-file-alt"></i> Ver Ata
                            </button>
                        ` : diasRestantes <= 0 ? `
                            <button class="btn btn-sm btn-success" onclick="abrirModal('Registrar Ata', getFormAta(${reuniao.id}))">
                                <i class="fas fa-pencil-alt"></i> Registrar Ata
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        function getTipoReuniao(tipo) {
            const tipos = {
                'pedagogica': 'Pedagógica',
                'conselho': 'Conselho de Classe',
                'pais': 'Reunião de Pais',
                'geral': 'Geral',
                'administrativa': 'Administrativa'
            };
            return tipos[tipo] || tipo;
        }

        // ==================== FUNÇÕES DE FORMULÁRIO ====================
        function getFormReuniao(id = null) {
            if (id) {
                const reuniao = reunioes.find(r => r.id === id);
                if (!reuniao) return '<p>Reunião não encontrada</p>';

                return `
                    <form id="form-reuniao" onsubmit="event.preventDefault(); salvarReuniao(${id})">
                        <div class="form-group">
                            <label>Título *</label>
                            <input type="text" class="form-control" id="edit-titulo" value="${reuniao.titulo}" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Tipo *</label>
                            <select class="form-control" id="edit-tipo" required>
                                <option value="pedagogica" ${reuniao.tipo === 'pedagogica' ? 'selected' : ''}>Pedagógica</option>
                                <option value="conselho" ${reuniao.tipo === 'conselho' ? 'selected' : ''}>Conselho de Classe</option>
                                <option value="pais" ${reuniao.tipo === 'pais' ? 'selected' : ''}>Reunião de Pais</option>
                                <option value="administrativa" ${reuniao.tipo === 'administrativa' ? 'selected' : ''}>Administrativa</option>
                            </select>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Data *</label>
                                    <input type="date" class="form-control" id="edit-data" value="${reuniao.data}" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Horário *</label>
                                    <input type="time" class="form-control" id="edit-horario" value="${reuniao.horario}" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Duração</label>
                                    <input type="text" class="form-control" id="edit-duracao" value="${reuniao.duracao}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Local</label>
                                    <input type="text" class="form-control" id="edit-local" value="${reuniao.local}">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Pauta (um item por linha)</label>
                            <textarea class="form-control" id="edit-pauta" rows="4">${reuniao.pauta?.join('\n') || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label>Participantes</label>
                            <select class="form-control" id="edit-participantes" multiple size="5">
                                ${MOCK_DATA.professores.map(p => `
                                    <option value="${p.id}" ${reuniao.participantes?.includes(p.id) ? 'selected' : ''}>${p.nome} (Professor)</option>
                                `).join('')}
                                ${MOCK_DATA.escolas.map(e => `
                                    <option value="dir_${e.id}" ${reuniao.participantes?.includes(`dir_${e.id}`) ? 'selected' : ''}>${e.diretor} (Diretor)</option>
                                `).join('')}
                            </select>
                            <small>Segure Ctrl para selecionar múltiplos</small>
                        </div>
                    </form>
                `;
            }

            return `
                <form id="form-reuniao" onsubmit="event.preventDefault(); salvarReuniao()">
                    <div class="form-group">
                        <label>Título *</label>
                        <input type="text" class="form-control" id="novo-titulo" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Tipo *</label>
                        <select class="form-control" id="novo-tipo" required>
                            <option value="">Selecione...</option>
                            <option value="pedagogica">Pedagógica</option>
                            <option value="conselho">Conselho de Classe</option>
                            <option value="pais">Reunião de Pais</option>
                            <option value="administrativa">Administrativa</option>
                        </select>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Data *</label>
                                <input type="date" class="form-control" id="novo-data" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Horário *</label>
                                <input type="time" class="form-control" id="novo-horario" required>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Duração</label>
                                <input type="text" class="form-control" id="novo-duracao" placeholder="Ex: 2h">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Local</label>
                                <input type="text" class="form-control" id="novo-local" placeholder="Ex: Auditório">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Pauta (um item por linha)</label>
                        <textarea class="form-control" id="novo-pauta" rows="4" placeholder="Digite cada item da pauta em uma linha"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Participantes</label>
                        <select class="form-control" id="novo-participantes" multiple size="5">
                            ${MOCK_DATA.professores.map(p => `
                                <option value="${p.id}">${p.nome} (Professor)</option>
                            `).join('')}
                            ${MOCK_DATA.escolas.map(e => `
                                <option value="dir_${e.id}">${e.diretor} (Diretor)</option>
                            `).join('')}
                        </select>
                        <small>Segure Ctrl para selecionar múltiplos</small>
                    </div>
                </form>
            `;
        }

        function getFormAta(reuniaoId) {
            const reuniao = reunioes.find(r => r.id === reuniaoId);
            
            return `
                <form id="form-ata" onsubmit="event.preventDefault(); salvarAta(${reuniaoId})">
                    <h3>${reuniao?.titulo}</h3>
                    <p>Data: ${new Date(reuniao?.data).toLocaleDateString('pt-BR')}</p>
                    
                    <div class="form-group">
                        <label>Conteúdo da Ata *</label>
                        <textarea class="form-control" id="ata-conteudo" rows="10" placeholder="Registre aqui o conteúdo da reunião..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Principais Decisões</label>
                        <textarea class="form-control" id="ata-decisoes" rows="4" placeholder="Decisões importantes tomadas..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Encaminhamentos</label>
                        <textarea class="form-control" id="ata-encaminhamentos" rows="4" placeholder="Próximos passos..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Anexos</label>
                        <input type="file" class="form-control" multiple>
                    </div>
                </form>
            `;
        }

        function getDetalhesReuniao(id) {
            const reuniao = reunioes.find(r => r.id === id);
            if (!reuniao) return '<p>Reunião não encontrada</p>';

            return `
                <div class="detalhes-reuniao">
                    <h3>${reuniao.titulo}</h3>
                    
                    <div class="info-grid">
                        <div class="info-item">
                            <strong>Data:</strong> ${new Date(reuniao.data).toLocaleDateString('pt-BR')}
                        </div>
                        <div class="info-item">
                            <strong>Horário:</strong> ${reuniao.horario}
                        </div>
                        <div class="info-item">
                            <strong>Duração:</strong> ${reuniao.duracao}
                        </div>
                        <div class="info-item">
                            <strong>Local:</strong> ${reuniao.local}
                        </div>
                        <div class="info-item">
                            <strong>Tipo:</strong> ${getTipoReuniao(reuniao.tipo)}
                        </div>
                    </div>
                    
                    <h4>Pauta:</h4>
                    <ul>
                        ${reuniao.pauta?.map(item => `<li>${item}</li>`).join('') || '<li>Pauta não definida</li>'}
                    </ul>
                    
                    <h4>Participantes:</h4>
                    <ul>
                        ${reuniao.participantes?.map(p => {
                            if (typeof p === 'string' && p.startsWith('dir_')) {
                                const escola = MOCK_DATA.escolas.find(e => e.id === parseInt(p.replace('dir_', '')));
                                return `<li>${escola?.diretor} (Diretor)</li>`;
                            } else {
                                const prof = MOCK_DATA.professores.find(prof => prof.id === p);
                                return `<li>${prof?.nome} (Professor)</li>`;
                            }
                        }).join('') || '<li>Nenhum participante listado</li>'}
                    </ul>
                    
                    ${reuniao.ata ? `
                        <h4>Ata da Reunião:</h4>
                        <div class="ata-visualizacao">
                            ${reuniao.ata}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        function getAtaReuniao(id) {
            const reuniao = reunioes.find(r => r.id === id);
            if (!reuniao || !reuniao.ata) return '<p>Ata não disponível</p>';

            return `
                <div class="ata-completa">
                    <h3>Ata da Reunião: ${reuniao.titulo}</h3>
                    <p>Data: ${new Date(reuniao.data).toLocaleDateString('pt-BR')}</p>
                    
                    <div class="ata-conteudo">
                        ${reuniao.ata}
                    </div>
                    
                    <div class="ata-actions">
                        <button class="btn btn-primary" onclick="exportarAta(${id})">
                            <i class="fas fa-download"></i> Exportar PDF
                        </button>
                        <button class="btn btn-secondary" onclick="imprimirAta(${id})">
                            <i class="fas fa-print"></i> Imprimir
                        </button>
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES DE AÇÃO ====================
        function salvarReuniao(id = null) {
            if (id) {
                // Editar reunião existente
                const reuniao = reunioes.find(r => r.id === id);
                if (!reuniao) return;

                reuniao.titulo = document.getElementById('edit-titulo')?.value;
                reuniao.tipo = document.getElementById('edit-tipo')?.value;
                reuniao.data = document.getElementById('edit-data')?.value;
                reuniao.horario = document.getElementById('edit-horario')?.value;
                reuniao.duracao = document.getElementById('edit-duracao')?.value;
                reuniao.local = document.getElementById('edit-local')?.value;
                
                const pautaText = document.getElementById('edit-pauta')?.value;
                reuniao.pauta = pautaText ? pautaText.split('\n').filter(p => p.trim()) : [];
                
                const participantes = document.getElementById('edit-participantes')?.selectedOptions;
                reuniao.participantes = Array.from(participantes || []).map(opt => opt.value);

                mostrarMensagem('Reunião atualizada com sucesso!', 'success');
            } else {
                // Criar nova reunião
                const titulo = document.getElementById('novo-titulo')?.value;
                const tipo = document.getElementById('novo-tipo')?.value;
                const data = document.getElementById('novo-data')?.value;
                const horario = document.getElementById('novo-horario')?.value;
                const duracao = document.getElementById('novo-duracao')?.value;
                const local = document.getElementById('novo-local')?.value;
                const pautaText = document.getElementById('novo-pauta')?.value;
                const participantes = document.getElementById('novo-participantes')?.selectedOptions;

                if (!titulo || !tipo || !data || !horario) {
                    mostrarMensagem('Preencha os campos obrigatórios', 'error');
                    return;
                }

                const novaReuniao = {
                    id: Date.now(),
                    titulo: titulo,
                    tipo: tipo,
                    data: data,
                    horario: horario,
                    duracao: duracao || '1h',
                    local: local || 'A definir',
                    pauta: pautaText ? pautaText.split('\n').filter(p => p.trim()) : [],
                    participantes: Array.from(participantes || []).map(opt => opt.value),
                    status: 'agendada',
                    ata: null
                };

                reunioes.push(novaReuniao);
                mostrarMensagem('Reunião agendada com sucesso!', 'success');
            }

            salvarDados();
            fecharModal();
        }

        function salvarAta(reuniaoId) {
            const conteudo = document.getElementById('ata-conteudo')?.value;
            const decisoes = document.getElementById('ata-decisoes')?.value;
            const encaminhamentos = document.getElementById('ata-encaminhamentos')?.value;

            if (!conteudo) {
                mostrarMensagem('Digite o conteúdo da ata', 'error');
                return;
            }

            const reuniao = reunioes.find(r => r.id === reuniaoId);
            if (reuniao) {
                reuniao.ata = conteudo;
                reuniao.decisoes = decisoes;
                reuniao.encaminhamentos = encaminhamentos;
                reuniao.status = 'realizada';
            }

            salvarDados();
            fecharModal();
            mostrarMensagem('Ata registrada com sucesso!', 'success');
        }

        function confirmarPresenca(reuniaoId) {
            const usuario = SISTEMA.getEstado().usuario;
            // Lógica para confirmar presença
            mostrarMensagem('Presença confirmada!', 'success');
        }

        function mostrarAbaReunioes(aba) {
            document.querySelectorAll('.reunioes-lista').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            
            document.getElementById(`reunioes-${aba}`)?.classList.add('active');
            event.target.classList.add('active');
        }

        function salvarDados() {
            if (!MOCK_DATA.reunioes) MOCK_DATA.reunioes = [];
            MOCK_DATA.reunioes = reunioes;
        }

        function exportarAta(id) {
            mostrarMensagem('Exportando ata...', 'info');
            setTimeout(() => {
                mostrarMensagem('Ata exportada com sucesso!', 'success');
            }, 1500);
        }

        function imprimirAta(id) {
            window.print();
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarReunioes,
            getFormReuniao,
            getFormAta,
            getDetalhesReuniao,
            getAtaReuniao,
            salvarReuniao,
            salvarAta,
            confirmarPresenca
        };
    })();

    window.MODULO_REUNIOES = MODULO_REUNIOES;
    console.log('✅ Módulo de Reuniões e Atas carregado');
}
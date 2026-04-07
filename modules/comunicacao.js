// modulos/comunicacao.js - Módulo de Comunicação
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_COMUNICACAO === 'undefined') {
    const MODULO_COMUNICACAO = (function() {
        'use strict';

        // ==================== DADOS LOCAIS ====================
        let mensagens = MOCK_DATA.comunicacao?.mensagens || [];
        let avisos = MOCK_DATA.comunicacao?.avisos || [];
        let grupos = MOCK_DATA.comunicacao?.grupos || [];

        // ==================== RENDERIZADORES PRINCIPAIS ====================
        function renderizarMensagens(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const mensagensRecebidas = mensagens.filter(m => 
                m.destinatario === usuario.perfil && m.destinatarioId === usuario.id
            );
            const mensagensEnviadas = mensagens.filter(m => 
                m.remetente === usuario.perfil && m.remetenteId === usuario.id
            );

            return `
                <div class="comunicacao-content">
                    <div class="content-header">
                        <h1><i class="fas fa-comments"></i> Central de Mensagens</h1>
                        <button class="btn btn-success" onclick="abrirModal('Nova Mensagem', getFormMensagem())">
                            <i class="fas fa-plus"></i> Nova Mensagem
                        </button>
                    </div>
                    
                    <div class="mensagens-tabs">
                        <button class="tab-btn active" onclick="mostrarAbaMensagens('recebidas')">
                            <i class="fas fa-inbox"></i> Recebidas 
                            <span class="badge">${mensagensRecebidas.filter(m => !m.lida).length}</span>
                        </button>
                        <button class="tab-btn" onclick="mostrarAbaMensagens('enviadas')">
                            <i class="fas fa-paper-plane"></i> Enviadas
                        </button>
                    </div>
                    
                    <div id="mensagens-recebidas" class="mensagens-lista active">
                        ${mensagensRecebidas.length > 0 ? 
                            mensagensRecebidas.map(m => `
                                <div class="mensagem-card ${!m.lida ? 'nao-lida' : ''}" onclick="abrirModal('${m.titulo}', getDetalhesMensagem(${m.id}))">
                                    <div class="mensagem-header">
                                        <h3>${m.titulo}</h3>
                                        <span class="mensagem-data">${new Date(m.data).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div class="mensagem-body">
                                        <p><strong>De:</strong> ${m.remetente === 'professor' ? 'Professor' : 
                                                                  m.remetente === 'escola' ? 'Escola' : 
                                                                  m.remetente === 'responsavel' ? 'Responsável' : m.remetente}</p>
                                        <p>${m.mensagem.substring(0, 100)}${m.mensagem.length > 100 ? '...' : ''}</p>
                                    </div>
                                    <div class="mensagem-footer">
                                        ${!m.lida ? '<span class="badge badge-primary">Nova</span>' : ''}
                                    </div>
                                </div>
                            `).join('') : 
                            '<div class="no-data"><i class="fas fa-info-circle"></i> Nenhuma mensagem recebida</div>'
                        }
                    </div>
                    
                    <div id="mensagens-enviadas" class="mensagens-lista">
                        ${mensagensEnviadas.length > 0 ? 
                            mensagensEnviadas.map(m => `
                                <div class="mensagem-card" onclick="abrirModal('${m.titulo}', getDetalhesMensagem(${m.id}))">
                                    <div class="mensagem-header">
                                        <h3>${m.titulo}</h3>
                                        <span class="mensagem-data">${new Date(m.data).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div class="mensagem-body">
                                        <p><strong>Para:</strong> ${m.destinatario === 'responsavel' ? 'Responsável' : 
                                                                      m.destinatario === 'professor' ? 'Professor' : 
                                                                      m.destinatario === 'aluno' ? 'Aluno' : m.destinatario}</p>
                                        <p>${m.mensagem.substring(0, 100)}${m.mensagem.length > 100 ? '...' : ''}</p>
                                    </div>
                                </div>
                            `).join('') : 
                            '<div class="no-data"><i class="fas fa-info-circle"></i> Nenhuma mensagem enviada</div>'
                        }
                    </div>
                </div>
            `;
        }

        function renderizarAvisos(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const avisosFiltrados = avisos.filter(a => 
                a.publico === 'todos' || a.publico === usuario.perfil
            );

            return `
                <div class="avisos-content">
                    <div class="content-header">
                        <h1><i class="fas fa-bullhorn"></i> Avisos e Comunicados</h1>
                        ${usuario.perfil !== 'aluno' ? `
                            <button class="btn btn-success" onclick="abrirModal('Novo Aviso', getFormAviso())">
                                <i class="fas fa-plus"></i> Novo Aviso
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="avisos-lista">
                        ${avisosFiltrados.map(aviso => `
                            <div class="aviso-card ${aviso.importante ? 'importante' : ''}">
                                <div class="aviso-header">
                                    <h3>${aviso.titulo}</h3>
                                    <span class="aviso-data">${new Date(aviso.data).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div class="aviso-body">
                                    <p>${aviso.conteudo}</p>
                                    <p class="aviso-autor"><i class="fas fa-user"></i> ${aviso.autor || 'Administração'}</p>
                                </div>
                                ${aviso.importante ? '<span class="badge-importante"><i class="fas fa-exclamation-circle"></i> Importante</span>' : ''}
                            </div>
                        `).join('')}
                        
                        ${avisosFiltrados.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Nenhum aviso disponível</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        function renderizarGrupos(secao) {
            const usuario = SISTEMA.getEstado().usuario;
            const meusGrupos = grupos.filter(g => g.participantes?.includes(usuario.id));

            return `
                <div class="grupos-content">
                    <div class="content-header">
                        <h1><i class="fas fa-users"></i> Grupos de Conversa</h1>
                        <button class="btn btn-success" onclick="abrirModal('Criar Grupo', getFormGrupo())">
                            <i class="fas fa-plus"></i> Criar Grupo
                        </button>
                    </div>
                    
                    <div class="grupos-lista">
                        ${meusGrupos.map(grupo => `
                            <div class="grupo-card" onclick="abrirConversaGrupo(${grupo.id})">
                                <div class="grupo-avatar">
                                    <i class="fas fa-users"></i>
                                </div>
                                <div class="grupo-info">
                                    <h3>${grupo.nome}</h3>
                                    <p>${grupo.participantes.length} participantes</p>
                                    <p class="ultima-mensagem">Última mensagem: há 2 horas</p>
                                </div>
                            </div>
                        `).join('')}
                        
                        ${meusGrupos.length === 0 ? `
                            <div class="no-data">
                                <i class="fas fa-info-circle"></i>
                                <p>Você não participa de nenhum grupo</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        // ==================== FUNÇÕES DE FORMULÁRIO ====================
        function getFormMensagem() {
            const usuario = SISTEMA.getEstado().usuario;
            
            return `
                <form id="form-mensagem" onsubmit="event.preventDefault(); enviarMensagem()">
                    <div class="form-group">
                        <label>Para *</label>
                        <select class="form-control" id="msg-destinatario" required>
                            <option value="">Selecione...</option>
                            ${usuario.perfil === 'professor' ? `
                                <optgroup label="Responsáveis">
                                    ${MOCK_DATA.alunos.filter(a => a.turmaId).map(a => `
                                        <option value="responsavel_${a.responsavel}">${a.responsavel} (${a.nome})</option>
                                    `).join('')}
                                </optgroup>
                            ` : ''}
                            ${usuario.perfil === 'responsavel' ? `
                                <optgroup label="Professores">
                                    ${MOCK_DATA.professores.map(p => `
                                        <option value="professor_${p.id}">${p.nome} (${p.disciplina})</option>
                                    `).join('')}
                                </optgroup>
                            ` : ''}
                            ${usuario.perfil === 'secretaria' ? `
                                <optgroup label="Diretores">
                                    ${MOCK_DATA.escolas.map(e => `
                                        <option value="diretor_${e.id}">${e.diretor} - ${e.nome}</option>
                                    `).join('')}
                                </optgroup>
                            ` : ''}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Título *</label>
                        <input type="text" class="form-control" id="msg-titulo" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Mensagem *</label>
                        <textarea class="form-control" id="msg-conteudo" rows="5" required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Anexos</label>
                        <input type="file" class="form-control" id="msg-anexos" multiple>
                    </div>
                </form>
            `;
        }

        function getFormAviso() {
            return `
                <form id="form-aviso" onsubmit="event.preventDefault(); publicarAviso()">
                    <div class="form-group">
                        <label>Título *</label>
                        <input type="text" class="form-control" id="aviso-titulo" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Conteúdo *</label>
                        <textarea class="form-control" id="aviso-conteudo" rows="5" required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Público *</label>
                        <select class="form-control" id="aviso-publico" required>
                            <option value="todos">Todos</option>
                            <option value="professores">Professores</option>
                            <option value="alunos">Alunos</option>
                            <option value="pais">Pais/Responsáveis</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="aviso-importante"> Marcar como importante
                        </label>
                    </div>
                </form>
            `;
        }

        function getFormGrupo() {
            return `
                <form id="form-grupo" onsubmit="event.preventDefault(); criarGrupo()">
                    <div class="form-group">
                        <label>Nome do Grupo *</label>
                        <input type="text" class="form-control" id="grupo-nome" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Descrição</label>
                        <textarea class="form-control" id="grupo-descricao" rows="3"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Participantes</label>
                        <select class="form-control" id="grupo-participantes" multiple size="5">
                            ${MOCK_DATA.professores.map(p => `
                                <option value="prof_${p.id}">${p.nome} (Professor)</option>
                            `).join('')}
                            ${MOCK_DATA.alunos.map(a => `
                                <option value="aluno_${a.id}">${a.nome} (Aluno)</option>
                            `).join('')}
                        </select>
                        <small>Segure Ctrl para selecionar múltiplos</small>
                    </div>
                </form>
            `;
        }

        function getDetalhesMensagem(id) {
            const msg = mensagens.find(m => m.id === id);
            if (!msg) return '<p>Mensagem não encontrada</p>';

            // Marcar como lida
            if (!msg.lida) {
                msg.lida = true;
                salvarDados();
            }

            return `
                <div class="detalhes-mensagem">
                    <h3>${msg.titulo}</h3>
                    <p><strong>De:</strong> ${msg.remetente === 'professor' ? 'Professor' : 
                                              msg.remetente === 'escola' ? 'Escola' : 
                                              msg.remetente === 'responsavel' ? 'Responsável' : msg.remetente}</p>
                    <p><strong>Para:</strong> ${msg.destinatario === 'responsavel' ? 'Responsável' : 
                                                msg.destinatario === 'professor' ? 'Professor' : 
                                                msg.destinatario === 'aluno' ? 'Aluno' : msg.destinatario}</p>
                    <p><strong>Data:</strong> ${new Date(msg.data).toLocaleDateString('pt-BR')} às ${msg.hora}</p>
                    
                    <div class="mensagem-conteudo">
                        <p>${msg.mensagem}</p>
                    </div>
                    
                    ${msg.anexos && msg.anexos.length > 0 ? `
                        <div class="anexos">
                            <h4>Anexos:</h4>
                            <ul>
                                ${msg.anexos.map(a => `<li><i class="fas fa-file"></i> ${a}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <div class="acoes-mensagem">
                        <button class="btn btn-primary" onclick="abrirModal('Responder', getFormResposta(${msg.id}))">
                            <i class="fas fa-reply"></i> Responder
                        </button>
                        <button class="btn btn-danger" onclick="excluirMensagem(${msg.id})">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `;
        }

        function getFormResposta(id) {
            return `
                <form id="form-resposta" onsubmit="event.preventDefault(); enviarResposta(${id})">
                    <div class="form-group">
                        <label>Sua resposta *</label>
                        <textarea class="form-control" rows="5" required></textarea>
                    </div>
                </form>
            `;
        }

        // ==================== FUNÇÕES DE AÇÃO ====================
        function enviarMensagem() {
            const destinatario = document.getElementById('msg-destinatario')?.value;
            const titulo = document.getElementById('msg-titulo')?.value;
            const conteudo = document.getElementById('msg-conteudo')?.value;

            if (!destinatario || !titulo || !conteudo) {
                mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
                return;
            }

            const usuario = SISTEMA.getEstado().usuario;
            
            const novaMensagem = {
                id: Date.now(),
                remetente: usuario.perfil,
                remetenteId: usuario.id,
                destinatario: destinatario.split('_')[0],
                destinatarioId: parseInt(destinatario.split('_')[1]) || null,
                titulo: titulo,
                mensagem: conteudo,
                data: new Date().toISOString().split('T')[0],
                hora: new Date().toLocaleTimeString('pt-BR'),
                lida: false,
                anexos: []
            };

            mensagens.push(novaMensagem);
            salvarDados();
            fecharModal();
            mostrarMensagem('Mensagem enviada com sucesso!', 'success');
            renderizarMensagens('recebidas');
        }

        function publicarAviso() {
            const titulo = document.getElementById('aviso-titulo')?.value;
            const conteudo = document.getElementById('aviso-conteudo')?.value;
            const publico = document.getElementById('aviso-publico')?.value;
            const importante = document.getElementById('aviso-importante')?.checked;

            if (!titulo || !conteudo || !publico) {
                mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
                return;
            }

            const usuario = SISTEMA.getEstado().usuario;

            const novoAviso = {
                id: Date.now(),
                titulo: titulo,
                conteudo: conteudo,
                publico: publico,
                importante: importante || false,
                data: new Date().toISOString().split('T')[0],
                autor: usuario.nome
            };

            avisos.push(novoAviso);
            salvarDados();
            fecharModal();
            mostrarMensagem('Aviso publicado com sucesso!', 'success');
        }

        function criarGrupo() {
            const nome = document.getElementById('grupo-nome')?.value;
            const descricao = document.getElementById('grupo-descricao')?.value;
            const participantes = document.getElementById('grupo-participantes')?.selectedOptions;

            if (!nome) {
                mostrarMensagem('Digite o nome do grupo', 'error');
                return;
            }

            const participantesIds = Array.from(participantes || []).map(opt => opt.value);

            const novoGrupo = {
                id: Date.now(),
                nome: nome,
                descricao: descricao || '',
                participantes: participantesIds,
                dataCriacao: new Date().toISOString().split('T')[0]
            };

            grupos.push(novoGrupo);
            salvarDados();
            fecharModal();
            mostrarMensagem('Grupo criado com sucesso!', 'success');
        }

        function excluirMensagem(id) {
            if (confirm('Deseja realmente excluir esta mensagem?')) {
                mensagens = mensagens.filter(m => m.id !== id);
                salvarDados();
                fecharModal();
                mostrarMensagem('Mensagem excluída', 'success');
                renderizarMensagens('recebidas');
            }
        }

        function salvarDados() {
            // Atualizar MOCK_DATA
            if (!MOCK_DATA.comunicacao) MOCK_DATA.comunicacao = {};
            MOCK_DATA.comunicacao.mensagens = mensagens;
            MOCK_DATA.comunicacao.avisos = avisos;
            MOCK_DATA.comunicacao.grupos = grupos;
        }

        function abrirConversaGrupo(id) {
            const grupo = grupos.find(g => g.id === id);
            if (!grupo) return;

            abrirModal(grupo.nome, `
                <div class="conversa-grupo">
                    <div class="mensagens-grupo">
                        <div class="mensagem-grupo">
                            <strong>João:</strong> Olá pessoal!
                            <small>10:30</small>
                        </div>
                        <div class="mensagem-grupo">
                            <strong>Maria:</strong> Boa tarde!
                            <small>10:31</small>
                        </div>
                    </div>
                    
                    <div class="nova-mensagem-grupo">
                        <textarea class="form-control" rows="2" placeholder="Digite sua mensagem..."></textarea>
                        <button class="btn btn-primary">Enviar</button>
                    </div>
                </div>
            `);
        }

        // ==================== FUNÇÕES DE UTILIDADE ====================
        function mostrarAbaMensagens(aba) {
            document.querySelectorAll('.mensagens-lista').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            
            document.getElementById(`mensagens-${aba}`)?.classList.add('active');
            event.target.classList.add('active');
        }

        // ==================== API PÚBLICA ====================
        return {
            renderizarMensagens,
            renderizarAvisos,
            renderizarGrupos,
            getFormMensagem,
            getFormAviso,
            getFormGrupo,
            getDetalhesMensagem,
            enviarMensagem,
            publicarAviso,
            criarGrupo
        };
    })();

    window.MODULO_COMUNICACAO = MODULO_COMUNICACAO;
    console.log('✅ Módulo de Comunicação carregado');
}
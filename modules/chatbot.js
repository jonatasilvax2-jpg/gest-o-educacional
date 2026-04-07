// modulos/chatbot.js - Assistente Virtual Educacional com IA
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0 - FASE 4

if (typeof MODULO_CHATBOT === 'undefined') {
    const MODULO_CHATBOT = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            nome: 'EduBot',
            versao: '1.0.0',
            saudacoes: ['olá', 'oi', 'hello', 'bom dia', 'boa tarde', 'boa noite'],
            despedidas: ['tchau', 'até mais', 'adeus', 'falou'],
            agradecimentos: ['obrigado', 'valeu', 'thanks', 'grato'],
            ajuda: ['ajuda', 'help', 'socorro', 'duvida'],
            humor: 0.5, // 0 a 1, onde 1 é mais engraçado
            contextoMaximo: 10,
            tempoResposta: 1000 // ms de delay para simular processamento
        };

        // ==================== BASE DE CONHECIMENTO ====================
        const conhecimento = {
            // Informações gerais
            sistema: {
                nome: 'Sistema de Gestão Educacional Municipal',
                versao: '4.0',
                funcionalidades: [
                    'Gestão de alunos',
                    'Gestão de professores',
                    'Gestão de escolas',
                    'Biblioteca',
                    'Merenda escolar',
                    'Transporte',
                    'Ocorrências',
                    'Reuniões',
                    'Projetos',
                    'Saúde',
                    'Bolsas',
                    'Estágio',
                    'Monitoria',
                    'Competições',
                    'Horas complementares',
                    'Pesquisas',
                    'Documentos',
                    'Uniforme',
                    'Cursos',
                    'Feedback',
                    'Relatórios'
                ]
            },
            
            // Perguntas frequentes
            faq: {
                'como acessar o boletim': 'Para acessar seu boletim, vá até o menu e clique em "Meu Boletim". Lá você verá todas as suas notas por disciplina.',
                'como recuperar senha': 'Para recuperar sua senha, clique em "Esqueceu a senha?" na tela de login e siga as instruções enviadas para seu email.',
                'como solicitar documento': 'Você pode solicitar documentos no módulo "Documentos". Clique em "Solicitar Documento" e preencha o formulário.',
                'como ver minhas faltas': 'Suas faltas estão disponíveis no módulo "Minhas Faltas" do menu principal.',
                'como fazer matrícula': 'As matrículas podem ser realizadas no módulo "Vagas". Verifique a disponibilidade de vagas por turma.',
                'como participar de projetos': 'Os projetos disponíveis estão no módulo "Projetos". Você pode se inscrever nos que tiver interesse.',
                'como usar a biblioteca': 'Na biblioteca você pode pesquisar livros, fazer reservas e ver seus empréstimos atuais.',
                'como registrar ocorrência': 'Ocorrências devem ser registradas pelo professor ou diretor no módulo específico.',
                'como ver cardápio': 'O cardápio da merenda está disponível no módulo "Merenda", atualizado semanalmente.',
                'como funciona transporte': 'No módulo "Transporte" você pode ver rotas, horários e seu ponto de embarque.'
            },

            // Dicas de estudo
            dicas: [
                'Estude em um local silencioso e sem distrações',
                'Faça resumos e mapas mentais dos conteúdos',
                'Revise a matéria regularmente, não apenas na véspera da prova',
                'Participe das monitorias oferecidas pela escola',
                'Use a biblioteca para pesquisas e leituras complementares',
                'Forme grupos de estudo com colegas',
                'Durma bem e tenha uma alimentação saudável',
                'Pratique exercícios regularmente para manter o foco',
                'Estabeleça metas diárias de estudo',
                'Peça ajuda sempre que tiver dúvidas'
            ],

            // Piadas educacionais
            piadas: [
                'Por que o livro de matemática está sempre triste? Porque tem muitos problemas! 😄',
                'O que o zero disse para o oito? "Belo cinto!" 😄',
                'Por que os átomos não jogam futebol? Porque eles já têm muitos prótons! 😄',
                'Qual é o animal mais antigo? A zebra, porque está em preto e branco! 😄',
                'O que o pato disse para a pata? "Vem Quá!" 😄',
                'Por que a planta foi reprovada? Porque não fez a fotossíntese! 😄'
            ],

            // Curiosidades
            curiosidades: [
                'Você sabia que a borracha era conhecida como "pedra elástica" pelos índios?',
                'O Brasil tem a segunda maior frota de helicópteros do mundo, atrás apenas dos EUA',
                'A letra "Ç" (cê-cedilha) é exclusiva do alfabeto português',
                'O café chegou ao Brasil em 1727, trazido do Pará',
                'A primeira universidade do Brasil foi criada em 1920'
            ],

            // Fatos motivacionais
            motivacao: [
                'Acredite em você e no seu potencial! 🚀',
                'Cada dia é uma nova oportunidade para aprender algo novo 📚',
                'Você é capaz de alcançar seus objetivos com dedicação 💪',
                'O conhecimento é a única coisa que ninguém pode tirar de você 🌟',
                'Pequenas conquistas diárias levam a grandes resultados 🎯'
            ]
        };

        // ==================== ESTADO DO CHAT ====================
        let historicoConversa = [];
        let contexto = [];
        let usuarioPerfil = null;
        let humorAtual = CONFIG.humor;

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('🤖 Assistente Virtual EduBot inicializado');
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA !== 'undefined') {
                MODULO_AUDITORIA.registrarLog(
                    'Chatbot EduBot inicializado',
                    MODULO_AUDITORIA.categorias.IA,
                    MODULO_AUDITORIA.niveis.INFO
                );
            }
        }

        // ==================== PROCESSAMENTO DE MENSAGENS ====================
        async function processarMensagem(mensagem, perfil = null) {
            usuarioPerfil = perfil || usuarioPerfil;
            
            const mensagemLower = mensagem.toLowerCase().trim();
            
            // Adicionar ao histórico
            historicoConversa.push({
                tipo: 'usuario',
                mensagem,
                timestamp: new Date().toISOString()
            });

            // Processar com delay para simular IA
            return new Promise(resolve => {
                setTimeout(() => {
                    let resposta = gerarResposta(mensagemLower);
                    
                    // Adicionar ao histórico
                    historicoConversa.push({
                        tipo: 'bot',
                        mensagem: resposta,
                        timestamp: new Date().toISOString()
                    });

                    // Manter contexto
                    manterContexto(mensagemLower, resposta);

                    resolve(resposta);
                }, CONFIG.tempoResposta);
            });
        }

        function gerarResposta(mensagem) {
            // Verificar saudação
            if (CONFIG.saudacoes.some(s => mensagem.includes(s))) {
                return gerarSaudacao();
            }

            // Verificar despedida
            if (CONFIG.despedidas.some(d => mensagem.includes(d))) {
                return gerarDespedida();
            }

            // Verificar agradecimento
            if (CONFIG.agradecimentos.some(a => mensagem.includes(a))) {
                return gerarAgradecimento();
            }

            // Verificar ajuda
            if (CONFIG.ajuda.some(a => mensagem.includes(a))) {
                return gerarAjuda();
            }

            // Verificar piada
            if (mensagem.includes('piada') || mensagem.includes('risada')) {
                return contarPiada();
            }

            // Verificar curiosidade
            if (mensagem.includes('curiosidade') || mensagem.includes('sabia')) {
                return contarCuriosidade();
            }

            // Verificar motivação
            if (mensagem.includes('motivar') || mensagem.includes('ânimo') || mensagem.includes('força')) {
                return darMensagemMotivacional();
            }

            // Verificar dica de estudo
            if (mensagem.includes('dica') || mensagem.includes('estudar')) {
                return darDicaEstudo();
            }

            // Verificar FAQ
            for (let [pergunta, resposta] of Object.entries(conhecimento.faq)) {
                if (mensagem.includes(pergunta) || calcularSimilaridade(mensagem, pergunta) > 0.7) {
                    return resposta;
                }
            }

            // Verificar informações do sistema
            if (mensagem.includes('sistema') || mensagem.includes('programa')) {
                return falarSobreSistema();
            }

            // Verificar perfil do usuário
            if (mensagem.includes('meu perfil') || mensagem.includes('quem sou')) {
                return falarSobrePerfil();
            }

            // Verificar contexto anterior
            const respostaContexto = verificarContexto(mensagem);
            if (respostaContexto) {
                return respostaContexto;
            }

            // Resposta padrão para não entendido
            return gerarRespostaNaoEntendida();
        }

        // ==================== GERADORES DE RESPOSTA ====================
        function gerarSaudacao() {
            const saudacoes = [
                `Olá! Como posso ajudar você hoje? 😊`,
                `Oi! Tudo bem? Estou aqui para ajudar! 🌟`,
                `Olá! Em que posso ser útil? 📚`,
                `Oi! Que bom falar com você! Como posso ajudar? 🎯`
            ];
            return saudacoes[Math.floor(Math.random() * saudacoes.length)];
        }

        function gerarDespedida() {
            const despedidas = [
                `Até mais! Volte sempre que precisar! 👋`,
                `Tchau! Foi bom conversar com você! 😊`,
                `Até logo! Continue estudando! 📚`,
                `Falou! Se precisar, é só chamar! 🚀`
            ];
            return despedidas[Math.floor(Math.random() * despedidas.length)];
        }

        function gerarAgradecimento() {
            const agradecimentos = [
                `Por nada! Estou aqui para ajudar! 😊`,
                `Disponha! Qualquer coisa é só chamar! 🌟`,
                `Imagina! Fico feliz em poder ajudar! 📚`,
                `Por nada! Essa é minha função! 🎯`
            ];
            return agradecimentos[Math.floor(Math.random() * agradecimentos.length)];
        }

        function gerarAjuda() {
            return `
                Posso ajudar com várias coisas! 📚<br><br>
                
                <strong>Comandos úteis:</strong><br>
                • "Como acessar o boletim" - Ver notas<br>
                • "Como ver minhas faltas" - Consultar frequência<br>
                • "Dica de estudo" - Receber dicas<br>
                • "Piada" - Uma piada educativa<br>
                • "Curiosidade" - Fatos interessantes<br>
                • "Motivar" - Mensagem de ânimo<br>
                • "O que você sabe fazer?" - Ver funcionalidades<br><br>
                
                Também posso responder perguntas sobre o sistema! 😊
            `;
        }

        function contarPiada() {
            const piada = conhecimento.piadas[Math.floor(Math.random() * conhecimento.piadas.length)];
            
            // Verificar humor
            if (humorAtual > 0.7) {
                return piada + " Quer ouvir outra? 😄";
            } else {
                return piada;
            }
        }

        function contarCuriosidade() {
            const curiosidade = conhecimento.curiosidades[Math.floor(Math.random() * conhecimento.curiosidades.length)];
            return `📚 Curiosidade: ${curiosidade}`;
        }

        function darMensagemMotivacional() {
            const mensagem = conhecimento.motivacao[Math.floor(Math.random() * conhecimento.motivacao.length)];
            return `✨ ${mensagem}`;
        }

        function darDicaEstudo() {
            const dica = conhecimento.dicas[Math.floor(Math.random() * conhecimento.dicas.length)];
            return `💡 Dica de estudo: ${dica}`;
        }

        function falarSobreSistema() {
            return `
                ${conhecimento.sistema.nome} - Versão ${conhecimento.sistema.versao}<br><br>
                
                <strong>Funcionalidades disponíveis:</strong><br>
                ${conhecimento.sistema.funcionalidades.map(f => `• ${f}`).join('<br>')}
            `;
        }

        function falarSobrePerfil() {
            if (!usuarioPerfil) {
                return "Ainda não sei quem você é! Faça login para que eu possa personalizar melhor as respostas.";
            }

            return `
                Perfil identificado! 🎯<br><br>
                <strong>Nome:</strong> ${usuarioPerfil.nome}<br>
                <strong>Perfil:</strong> ${getNomePerfil(usuarioPerfil.perfil)}<br>
                <strong>Email:</strong> ${usuarioPerfil.email}<br><br>
                
                Posso ajudar com informações específicas para seu perfil! 😊
            `;
        }

        function gerarRespostaNaoEntendida() {
            const respostas = [
                `Desculpe, não entendi muito bem. Pode reformular? 🤔`,
                `Hmm, não tenho essa informação ainda. Tente perguntar de outra forma! 📚`,
                `Não encontrei uma resposta para isso. Que tal pedir ajuda? Digite "ajuda" para ver os comandos. 😊`,
                `Ainda estou aprendendo! Pode perguntar de outra maneira? 🌟`,
                `Não sei responder isso ainda. Mas posso te ajudar com dúvidas sobre o sistema! 🎯`
            ];
            return respostas[Math.floor(Math.random() * respostas.length)];
        }

        // ==================== CONTEXTO E APRENDIZADO ====================
        function manterContexto(mensagem, resposta) {
            contexto.push({
                mensagem,
                resposta,
                timestamp: new Date().toISOString()
            });

            // Limitar tamanho do contexto
            if (contexto.length > CONFIG.contextoMaximo) {
                contexto.shift();
            }
        }

        function verificarContexto(mensagem) {
            // Verificar referências a conversas anteriores
            for (let item of contexto.slice().reverse()) {
                if (mensagem.includes('isso') || mensagem.includes('disso')) {
                    // Referência ao último tópico
                    return `Sobre o que falamos antes: ${item.resposta}`;
                }
                
                if (mensagem.includes('mais') && mensagem.includes(item.mensagem.split(' ')[0])) {
                    // Pediu mais informações sobre o mesmo tópico
                    return aprofundarTopico(item);
                }
            }
            return null;
        }

        function aprofundarTopico(item) {
            // Gerar resposta mais detalhada baseada no tópico anterior
            return `Posso dar mais detalhes sobre isso! O que exatamente você gostaria de saber? 😊`;
        }

        // ==================== INTERFACE DO USUÁRIO ====================
        function abrirChatbot() {
            const modalHTML = `
                <div class="chatbot-container">
                    <div class="chatbot-header">
                        <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" alt="EduBot" class="chatbot-avatar">
                        <div class="chatbot-info">
                            <h3>${CONFIG.nome}</h3>
                            <p>Assistente Virtual</p>
                        </div>
                        <button class="btn-icon" onclick="MODULO_CHATBOT.fecharChat()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="chatbot-mensagens" id="chat-mensagens">
                        <div class="mensagem bot">
                            <div class="mensagem-avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="mensagem-conteudo">
                                <p>Olá! Sou o EduBot, seu assistente virtual! 😊</p>
                                <p>Como posso ajudar você hoje?</p>
                                <p class="sugestoes">
                                    <span onclick="MODULO_CHATBOT.enviarSugestao('Como ver meu boletim?')">📊 Boletim</span>
                                    <span onclick="MODULO_CHATBOT.enviarSugestao('Dica de estudo')">💡 Dica</span>
                                    <span onclick="MODULO_CHATBOT.enviarSugestao('Piada')">😄 Piada</span>
                                    <span onclick="MODULO_CHATBOT.enviarSugestao('Ajuda')">❓ Ajuda</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chatbot-input">
                        <input type="text" id="chat-input" placeholder="Digite sua mensagem..." 
                               onkeypress="if(event.key === 'Enter') MODULO_CHATBOT.enviarMensagem()">
                        <button class="btn-enviar" onclick="MODULO_CHATBOT.enviarMensagem()">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            `;

            // Adicionar estilos
            adicionarEstilosChatbot();

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('EduBot - Assistente Virtual', modalHTML);
                
                // Focar no input
                setTimeout(() => {
                    document.getElementById('chat-input')?.focus();
                }, 500);
            }
        }

        function adicionarEstilosChatbot() {
            if (document.getElementById('style-chatbot')) return;

            const style = document.createElement('style');
            style.id = 'style-chatbot';
            style.textContent = `
                .chatbot-container {
                    display: flex;
                    flex-direction: column;
                    height: 500px;
                }
                
                .chatbot-header {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    background: linear-gradient(135deg, var(--tema-primary), #2980b9);
                    color: white;
                    border-radius: var(--radius) var(--radius) 0 0;
                    margin: -20px -20px 0 -20px;
                }
                
                .chatbot-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: white;
                    padding: 5px;
                }
                
                .chatbot-info {
                    flex: 1;
                }
                
                .chatbot-info h3 {
                    margin: 0;
                    color: white;
                }
                
                .chatbot-info p {
                    margin: 0;
                    opacity: 0.9;
                    font-size: 0.9rem;
                }
                
                .chatbot-mensagens {
                    flex: 1;
                    overflow-y: auto;
                    padding: 15px;
                    background: #f8f9fa;
                }
                
                .mensagem {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 15px;
                    animation: fadeIn 0.3s ease;
                }
                
                .mensagem.bot {
                    align-items: flex-start;
                }
                
                .mensagem.usuario {
                    flex-direction: row-reverse;
                }
                
                .mensagem-avatar {
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    background: var(--tema-primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                }
                
                .mensagem.usuario .mensagem-avatar {
                    background: var(--tema-success);
                }
                
                .mensagem-conteudo {
                    max-width: 70%;
                    padding: 10px 15px;
                    border-radius: 18px;
                    position: relative;
                }
                
                .mensagem.bot .mensagem-conteudo {
                    background: white;
                    border: 1px solid var(--tema-border);
                    border-top-left-radius: 5px;
                }
                
                .mensagem.usuario .mensagem-conteudo {
                    background: var(--tema-primary);
                    color: white;
                    border-top-right-radius: 5px;
                }
                
                .mensagem-conteudo p {
                    margin: 0 0 5px 0;
                }
                
                .mensagem-conteudo p:last-child {
                    margin-bottom: 0;
                }
                
                .sugestoes {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 10px;
                }
                
                .sugestoes span {
                    padding: 5px 12px;
                    background: #f0f0f0;
                    border-radius: 15px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: var(--transition);
                }
                
                .sugestoes span:hover {
                    background: var(--tema-primary);
                    color: white;
                }
                
                .chatbot-input {
                    display: flex;
                    gap: 10px;
                    padding: 15px;
                    background: white;
                    border-top: 1px solid var(--tema-border);
                    margin: 0 -20px -20px -20px;
                }
                
                .chatbot-input input {
                    flex: 1;
                    padding: 12px 15px;
                    border: 2px solid var(--tema-border);
                    border-radius: 25px;
                    font-size: 0.95rem;
                    transition: var(--transition);
                }
                
                .chatbot-input input:focus {
                    outline: none;
                    border-color: var(--tema-primary);
                    box-shadow: 0 0 0 3px rgba(52,152,219,0.1);
                }
                
                .btn-enviar {
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    background: var(--tema-primary);
                    color: white;
                    border: none;
                    cursor: pointer;
                    transition: var(--transition);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .btn-enviar:hover {
                    transform: scale(1.1);
                    background: #2980b9;
                }
                
                .digitando {
                    display: flex;
                    gap: 3px;
                    padding: 5px;
                }
                
                .digitando span {
                    width: 8px;
                    height: 8px;
                    background: var(--tema-textSecondary);
                    border-radius: 50%;
                    animation: digitando 1.4s infinite;
                }
                
                .digitando span:nth-child(2) { animation-delay: 0.2s; }
                .digitando span:nth-child(3) { animation-delay: 0.4s; }
                
                @keyframes digitando {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
                    30% { transform: translateY(-5px); opacity: 1; }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;

            document.head.appendChild(style);
        }

        // ==================== FUNÇÕES DE INTERAÇÃO ====================
        async function enviarMensagem() {
            const input = document.getElementById('chat-input');
            const mensagem = input.value.trim();
            
            if (!mensagem) return;

            // Limpar input
            input.value = '';

            // Adicionar mensagem do usuário
            adicionarMensagemNaInterface('usuario', mensagem);

            // Mostrar indicador de digitação
            mostrarDigitando();

            // Processar mensagem
            const resposta = await processarMensagem(mensagem, SISTEMA?.getEstado().usuario);

            // Remover indicador de digitação
            removerDigitando();

            // Adicionar resposta do bot
            adicionarMensagemNaInterface('bot', resposta);
        }

        function enviarSugestao(sugestao) {
            const input = document.getElementById('chat-input');
            if (input) {
                input.value = sugestao;
                enviarMensagem();
            }
        }

        function adicionarMensagemNaInterface(tipo, conteudo) {
            const container = document.getElementById('chat-mensagens');
            if (!container) return;

            const mensagemDiv = document.createElement('div');
            mensagemDiv.className = `mensagem ${tipo}`;
            mensagemDiv.innerHTML = `
                <div class="mensagem-avatar">
                    <i class="fas ${tipo === 'bot' ? 'fa-robot' : 'fa-user'}"></i>
                </div>
                <div class="mensagem-conteudo">
                    <p>${conteudo.replace(/\n/g, '<br>')}</p>
                </div>
            `;

            container.appendChild(mensagemDiv);
            container.scrollTop = container.scrollHeight;
        }

        function mostrarDigitando() {
            const container = document.getElementById('chat-mensagens');
            if (!container) return;

            const digitandoDiv = document.createElement('div');
            digitandoDiv.className = 'mensagem bot';
            digitandoDiv.id = 'digitando-indicator';
            digitandoDiv.innerHTML = `
                <div class="mensagem-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="mensagem-conteudo">
                    <div class="digitando">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;

            container.appendChild(digitandoDiv);
            container.scrollTop = container.scrollHeight;
        }

        function removerDigitando() {
            const indicator = document.getElementById('digitando-indicator');
            if (indicator) {
                indicator.remove();
            }
        }

        function fecharChat() {
            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.fecharModal();
            }
        }

        // ==================== FUNÇÕES AUXILIARES ====================
        function calcularSimilaridade(str1, str2) {
            // Implementação simples de similaridade de strings
            const palavras1 = str1.split(' ');
            const palavras2 = str2.split(' ');
            
            let correspondencias = 0;
            
            palavras1.forEach(p1 => {
                palavras2.forEach(p2 => {
                    if (p1.includes(p2) || p2.includes(p1)) {
                        correspondencias++;
                    }
                });
            });
            
            const maxPalavras = Math.max(palavras1.length, palavras2.length);
            return maxPalavras > 0 ? correspondencias / maxPalavras : 0;
        }

        function getNomePerfil(perfil) {
            const nomes = {
                'secretaria': 'Secretaria da Educação',
                'diretor': 'Diretor de Escola',
                'professor': 'Professor',
                'aluno': 'Aluno'
            };
            return nomes[perfil] || perfil;
        }

        function ajustarHumor(valor) {
            humorAtual = Math.max(0, Math.min(1, valor));
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            processarMensagem,
            abrirChatbot,
            enviarMensagem,
            enviarSugestao,
            fecharChat,
            ajustarHumor,
            getHistorico: () => [...historicoConversa]
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_CHATBOT.init();
        }, 8000);
    });

    window.MODULO_CHATBOT = MODULO_CHATBOT;
    console.log('✅ Módulo de Chatbot carregado');
}
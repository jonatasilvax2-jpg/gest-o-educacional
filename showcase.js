// showcase.js - Funcionalidades extras impressionantes para investidores

const ShowcaseModule = {
    // Inicializa todas as funcionalidades de showcase
    init: function() {
        this.initRealTimeDashboard();
        this.initAISimulations();
        this.initLiveNotifications();
        this.initPresentationMode();
        this.initAnimations();
        this.initDemoDataGenerator();
    },
    
    // 1. Painel de Demonstração em Tempo Real
    initRealTimeDashboard: function() {
        // Atualiza estatísticas em tempo real
        setInterval(() => {
            this.updateRealTimeStats();
        }, 5000); // Atualiza a cada 5 segundos
        
        // Gráficos animados
        this.createAnimatedCharts();
    },
    
    updateRealTimeStats: function() {
        const stats = document.querySelectorAll('.card-stat, .stat-value, .summary-value');
        stats.forEach(stat => {
            if (Math.random() > 0.7) { // 30% chance de atualizar
                const current = parseFloat(stat.textContent.replace(/[^0-9.]/g, ''));
                if (!isNaN(current)) {
                    const change = (Math.random() * 0.5) - 0.25; // -0.25 a +0.25
                    const newValue = Math.max(0, current + change);
                    
                    // Animar a mudança
                    this.animateValueChange(stat, current, newValue);
                }
            }
        });
    },
    
    animateValueChange: function(element, start, end) {
        const duration = 1000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuad = t => t * (2 - t);
            const value = start + (end - start) * easeOutQuad(progress);
            
            element.textContent = element.classList.contains('card-stat') 
                ? Math.round(value).toString()
                : value.toFixed(1);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },
    
    createAnimatedCharts: function() {
        // Cria gráficos animados nos placeholders
        document.querySelectorAll('.chart-placeholder').forEach(placeholder => {
            placeholder.innerHTML = `
                <div class="animated-chart">
                    <canvas width="300" height="150"></canvas>
                </div>
            `;
            
            setTimeout(() => {
                this.drawAnimatedChart(placeholder.querySelector('canvas'));
            }, 1000);
        });
    },
    
    drawAnimatedChart: function(canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Dados simulados
        const data = [30, 45, 60, 75, 65, 80, 90, 85, 95, 70];
        const max = Math.max(...data);
        const barWidth = width / data.length - 10;
        
        // Animação do gráfico
        let progress = 0;
        
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            // Desenha barras animadas
            data.forEach((value, i) => {
                const x = i * (barWidth + 10) + 5;
                const barHeight = (value / max) * height * progress;
                const y = height - barHeight;
                
                // Gradiente
                const gradient = ctx.createLinearGradient(0, y, 0, height);
                gradient.addColorStop(0, '#3498db');
                gradient.addColorStop(1, '#2980b9');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, barWidth, barHeight);
                
                // Valor no topo
                ctx.fillStyle = '#2c3e50';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
            });
            
            progress += 0.05;
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    },
    
    // 2. Simulação de IA
    initAISimulations: function() {
        // Botão de IA para gerar insights
        const aiButton = document.createElement('button');
        aiButton.id = 'ai-insights-btn';
        aiButton.className = 'btn btn-ai';
        aiButton.innerHTML = '<i class="fas fa-robot"></i> Insights de IA';
        aiButton.style.position = 'fixed';
        aiButton.style.bottom = '20px';
        aiButton.style.right = '20px';
        aiButton.style.zIndex = '1000';
        aiButton.style.boxShadow = '0 4px 15px rgba(52, 152, 219, 0.3)';
        aiButton.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        document.body.appendChild(aiButton);
        
        aiButton.addEventListener('click', () => this.showAIInsights());
        
        // Sugestões automáticas baseadas no contexto
        this.setupContextualAI();
    },
    
    showAIInsights: function() {
        const user = AuthModule.getCurrentUser();
        let insights = [];
        
        switch(user.role) {
            case 'secretaria':
                insights = [
                    "📊 **Análise de Dados**: Matrículas aumentaram 12% este mês",
                    "🎯 **Recomendação**: Alocar mais professores para o 5º ano",
                    "⚠️ **Alerta**: Escola Vila Nova precisa de manutenção urgente",
                    "📈 **Tendência**: Frequência melhorou 8% após novo programa",
                    "💡 **Insight**: Turmas menores têm 15% melhor desempenho"
                ];
                break;
            case 'diretor':
                insights = [
                    "🏆 **Destaque**: 5º Ano A tem melhor desempenho da escola",
                    "🎯 **Foco**: Matemática precisa de atenção especial",
                    "📊 **Estatística**: Frequência 94% - acima da média municipal",
                    "💡 **Sugestão**: Implementar tutorias para alunos em recuperação",
                    "📈 **Meta**: Atingir 96% de frequência até o final do bimestre"
                ];
                break;
            case 'professor':
                insights = [
                    "👨‍🎓 **Aluno Destaque**: João Pereira melhorou 25% em matemática",
                    "📚 **Material Recomendado**: Vídeo-aulas sobre frações",
                    "🎯 **Foco Pedagógico**: Trabalhar interpretação de texto",
                    "📊 **Análise**: 85% dos alunos compreendem o conteúdo",
                    "💡 **Sugestão**: Atividades práticas aumentam engajamento"
                ];
                break;
            case 'aluno':
                insights = [
                    "📈 **Seu Progresso**: Matemática +15% este bimestre",
                    "🎯 **Área para Melhorar**: Português precisa de mais atenção",
                    "📊 **Comparativo**: Você está acima da média da turma",
                    "💡 **Dica de Estudo**: Revisar conteúdo 30min por dia",
                    "🏆 **Meta**: Atingir média 8.5 no próximo bimestre"
                ];
                break;
        }
        
        const insight = insights[Math.floor(Math.random() * insights.length)];
        
        this.showAIModal(insight);
    },
    
    showAIModal: function(message) {
        const modalContent = `
            <div class="ai-modal">
                <div class="ai-header">
                    <div class="ai-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="ai-title">
                        <h3>Assistente Educacional IA</h3>
                        <p>Análise inteligente em tempo real</p>
                    </div>
                </div>
                <div class="ai-message">
                    <div class="message-bubble">
                        ${message}
                    </div>
                </div>
                <div class="ai-features">
                    <h4>Recursos de IA Disponíveis:</h4>
                    <div class="features-grid">
                        <div class="feature">
                            <i class="fas fa-chart-line"></i>
                            <span>Análise Preditiva</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-user-graduate"></i>
                            <span>Recomendações Personalizadas</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-lightbulb"></i>
                            <span>Insights Inteligentes</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-bell"></i>
                            <span>Alertas Proativos</span>
                        </div>
                    </div>
                </div>
                <div class="ai-actions">
                    <button class="btn btn-secondary" id="close-ai">
                        Fechar
                    </button>
                    <button class="btn btn-primary" id="more-insights">
                        <i class="fas fa-brain"></i> Mais Insights
                    </button>
                </div>
            </div>
        `;
        
        DashboardModule.showModal('Assistente de IA Educacional', modalContent);
        
        // Eventos do modal de IA
        document.getElementById('more-insights')?.addEventListener('click', () => {
            this.showAIInsights();
        });
    },
    
    setupContextualAI: function() {
        // Detecta contexto e mostra sugestões relevantes
        const observer = new MutationObserver(() => {
            const currentPage = document.querySelector('.menu-item.active')?.dataset.menu;
            if (currentPage) {
                this.showContextualSuggestion(currentPage);
            }
        });
        
        observer.observe(document.getElementById('content-area'), {
            childList: true,
            subtree: true
        });
    },
    
    showContextualSuggestion: function(page) {
        // Remove sugestão anterior
        const existingSuggestion = document.querySelector('.contextual-suggestion');
        if (existingSuggestion) existingSuggestion.remove();
        
        // Cria nova sugestão baseada na página
        const suggestions = {
            'dashboard': '📊 Use o botão de IA para insights personalizados',
            'escolas': '🏫 Clique em uma escola para ver análises detalhadas',
            'professores': '👨‍🏫 Visualize o desempenho de cada professor',
            'alunos': '👨‍🎓 Filtre alunos por situação para ações direcionadas',
            'notas': '📝 Exporte relatórios com um clique',
            'frequencia': '✅ Marque frequência em lote para economizar tempo'
        };
        
        if (suggestions[page]) {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.className = 'contextual-suggestion';
            suggestionDiv.innerHTML = `
                <div class="suggestion-content">
                    <i class="fas fa-lightbulb"></i>
                    <span>${suggestions[page]}</span>
                </div>
                <button class="btn-icon close-suggestion">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            const contentArea = document.getElementById('content-area');
            if (contentArea) {
                contentArea.prepend(suggestionDiv);
                
                // Fecha sugestão
                suggestionDiv.querySelector('.close-suggestion').addEventListener('click', () => {
                    suggestionDiv.remove();
                });
                
                // Remove automaticamente após 10 segundos
                setTimeout(() => {
                    if (suggestionDiv.parentNode) {
                        suggestionDiv.remove();
                    }
                }, 10000);
            }
        }
    },
    
    // 3. Sistema de Notificações em Tempo Real
    initLiveNotifications: function() {
        // Simula notificações em tempo real
        setInterval(() => {
            if (Math.random() > 0.8) { // 20% chance de nova notificação
                this.generateLiveNotification();
            }
        }, 15000);
        
        // Badge de notificações no menu
        this.updateNotificationBadge();
    },
    
    generateLiveNotification: function() {
        const user = AuthModule.getCurrentUser();
        const notifications = [];
        
        switch(user.role) {
            case 'secretaria':
                notifications.push(
                    '📋 Nova solicitação de matrícula recebida',
                    '🏫 Manutenção agendada para amanhã',
                    '📊 Relatório mensal pronto para análise',
                    '👨‍🏫 Novo professor contratado com sucesso'
                );
                break;
            case 'diretor':
                notifications.push(
                    '🎯 Reunião com pais em 30 minutos',
                    '📚 Material didático chegou na escola',
                    '👨‍🎓 Aluno transferido para sua escola',
                    '📊 Frequência do dia registrada com sucesso'
                );
                break;
            case 'professor':
                notifications.push(
                    '📝 Trabalho enviado por aluno',
                    '👨‍🏫 Reunião pedagógica às 16h',
                    '📚 Novo material disponível',
                    '🎯 Aluno precisa de atenção especial'
                );
                break;
            case 'aluno':
                notifications.push(
                    '📝 Nova nota lançada',
                    '📚 Material de estudo disponível',
                    '🎯 Prova marcada para amanhã',
                    '👏 Parabéns! Você melhorou sua média'
                );
                break;
        }
        
        const notification = notifications[Math.floor(Math.random() * notifications.length)];
        this.showLiveNotification(notification);
    },
    
    showLiveNotification: function(message) {
        // Cria elemento de notificação
        const notification = document.createElement('div');
        notification.className = 'live-notification';
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-bell"></i>
            </div>
            <div class="notification-message">
                ${message}
            </div>
            <div class="notification-time">
                Agora
            </div>
        `;
        
        // Posiciona a notificação
        notification.style.position = 'fixed';
        notification.style.top = '80px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.background = 'white';
        notification.style.padding = '15px';
        notification.style.borderRadius = '10px';
        notification.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
        notification.style.borderLeft = '4px solid #3498db';
        notification.style.maxWidth = '350px';
        notification.style.animation = 'slideInRight 0.3s ease';
        
        document.body.appendChild(notification);
        
        // Remove após 5 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
        
        // Atualiza badge
        this.updateNotificationBadge();
    },
    
    updateNotificationBadge: function() {
        const badge = document.querySelector('.badge-danger');
        if (badge) {
            const current = parseInt(badge.textContent) || 0;
            badge.textContent = current + 1;
        }
    },
    
    // 4. Modo Apresentação/Showcase
    initPresentationMode: function() {
        // Botão para iniciar modo apresentação
        const presentationBtn = document.createElement('button');
        presentationBtn.id = 'presentation-mode-btn';
        presentationBtn.className = 'btn btn-presentation';
        presentationBtn.innerHTML = '<i class="fas fa-play-circle"></i> Modo Apresentação';
        presentationBtn.style.position = 'fixed';
        presentationBtn.style.bottom = '70px';
        presentationBtn.style.right = '20px';
        presentationBtn.style.zIndex = '1000';
        presentationBtn.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        presentationBtn.style.boxShadow = '0 4px 15px rgba(245, 87, 108, 0.3)';
        document.body.appendChild(presentationBtn);
        
        presentationBtn.addEventListener('click', () => this.startPresentationMode());
        
        // Tecla P para modo apresentação
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' && (e.ctrlKey || e.metaKey)) {
                this.startPresentationMode();
            }
        });
    },
    
    startPresentationMode: function() {
        // Cria overlay de apresentação
        const overlay = document.createElement('div');
        overlay.id = 'presentation-overlay';
        overlay.innerHTML = `
            <div class="presentation-container">
                <div class="presentation-header">
                    <h1><i class="fas fa-rocket"></i> Sistema de Gestão Educacional Municipal</h1>
                    <p>Demonstração para Investidores</p>
                </div>
                
                <div class="presentation-steps">
                    <div class="step active" data-step="1">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h3>Visão Macro da Rede Municipal</h3>
                            <p>Gestão completa de todas as escolas, professores e alunos</p>
                        </div>
                    </div>
                    
                    <div class="step" data-step="2">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h3>Inteligência Artificial Educacional</h3>
                            <p>Análise preditiva e insights inteligentes</p>
                        </div>
                    </div>
                    
                    <div class="step" data-step="3">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h3>Tempo Real e Automatização</h3>
                            <p>Dados atualizados automaticamente e notificações inteligentes</p>
                        </div>
                    </div>
                    
                    <div class="step" data-step="4">
                        <div class="step-number">4</div>
                        <div class="step-content">
                            <h3>Escalabilidade e Integração</h3>
                            <p>Pronto para crescimento e integração com sistemas existentes</p>
                        </div>
                    </div>
                </div>
                
                <div class="presentation-controls">
                    <button class="btn btn-secondary" id="prev-step">
                        <i class="fas fa-arrow-left"></i> Anterior
                    </button>
                    <div class="step-indicator">
                        Passo <span id="current-step">1</span> de 4
                    </div>
                    <button class="btn btn-primary" id="next-step">
                        Próximo <i class="fas fa-arrow-right"></i>
                    </button>
                    <button class="btn btn-danger" id="exit-presentation">
                        <i class="fas fa-times"></i> Sair
                    </button>
                </div>
                
                <div class="presentation-features">
                    <div class="feature-highlight">
                        <i class="fas fa-chart-line"></i>
                        <h4>Análise em Tempo Real</h4>
                        <p>Dados atualizados automaticamente</p>
                    </div>
                    <div class="feature-highlight">
                        <i class="fas fa-robot"></i>
                        <h4>IA Educacional</h4>
                        <p>Insights inteligentes automáticos</p>
                    </div>
                    <div class="feature-highlight">
                        <i class="fas fa-mobile-alt"></i>
                        <h4>100% Responsivo</h4>
                        <p>Funciona em todos os dispositivos</p>
                    </div>
                    <div class="feature-highlight">
                        <i class="fas fa-bolt"></i>
                        <h4>Alta Performance</h4>
                        <p>Rápido e eficiente</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Adiciona estilos
        this.addPresentationStyles();
        
        // Controles da apresentação
        let currentStep = 1;
        
        document.getElementById('next-step').addEventListener('click', () => {
            if (currentStep < 4) {
                currentStep++;
                this.updatePresentationStep(currentStep);
            }
        });
        
        document.getElementById('prev-step').addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                this.updatePresentationStep(currentStep);
            }
        });
        
        document.getElementById('exit-presentation').addEventListener('click', () => {
            overlay.remove();
            document.getElementById('presentation-styles')?.remove();
        });
        
        // Navegação por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                document.getElementById('next-step').click();
            } else if (e.key === 'ArrowLeft') {
                document.getElementById('prev-step').click();
            } else if (e.key === 'Escape') {
                document.getElementById('exit-presentation').click();
            }
        });
    },
    
    updatePresentationStep: function(step) {
        // Atualiza indicador
        document.getElementById('current-step').textContent = step;
        
        // Atualiza passos
        document.querySelectorAll('.step').forEach(s => {
            s.classList.remove('active');
        });
        document.querySelector(`.step[data-step="${step}"]`).classList.add('active');
        
        // Demonstração automática baseada no passo
        switch(step) {
            case 1:
                // Mostra dashboard da secretaria
                if (AuthModule.getCurrentUser()?.role !== 'secretaria') {
                    // Simula login como secretaria
                    const secretariaUser = mockData.users.find(u => u.role === 'secretaria');
                    if (secretariaUser) {
                        AuthModule.currentUser = secretariaUser;
                        DashboardModule.loadMenu();
                        DashboardModule.loadContent('dashboard');
                    }
                }
                break;
            case 2:
                // Mostra funcionalidades de IA
                this.showAIInsights();
                break;
            case 3:
                // Mostra notificações em tempo real
                this.generateLiveNotification();
                this.generateLiveNotification();
                break;
            case 4:
                // Mostra dados em tempo real
                this.updateRealTimeStats();
                break;
        }
    },
    
    addPresentationStyles: function() {
        const styles = document.createElement('style');
        styles.id = 'presentation-styles';
        styles.textContent = `
            #presentation-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                animation: fadeIn 0.5s ease;
            }
            
            .presentation-container {
                max-width: 1000px;
                width: 90%;
                padding: 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            
            .presentation-header {
                text-align: center;
                margin-bottom: 40px;
            }
            
            .presentation-header h1 {
                font-size: 2.5rem;
                margin-bottom: 10px;
                color: white;
            }
            
            .presentation-header p {
                font-size: 1.2rem;
                opacity: 0.9;
            }
            
            .presentation-steps {
                display: flex;
                gap: 20px;
                margin-bottom: 40px;
            }
            
            .step {
                flex: 1;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 15px;
                transition: all 0.3s ease;
                opacity: 0.7;
            }
            
            .step.active {
                background: rgba(255, 255, 255, 0.2);
                opacity: 1;
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }
            
            .step-number {
                width: 50px;
                height: 50px;
                background: white;
                color: #764ba2;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                font-weight: bold;
            }
            
            .step-content h3 {
                margin: 0 0 5px 0;
                font-size: 1.2rem;
            }
            
            .step-content p {
                margin: 0;
                opacity: 0.8;
                font-size: 0.9rem;
            }
            
            .presentation-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 40px;
            }
            
            .step-indicator {
                font-size: 1.2rem;
                font-weight: bold;
            }
            
            .presentation-features {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
            }
            
            .feature-highlight {
                text-align: center;
                padding: 20px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                transition: all 0.3s ease;
            }
            
            .feature-highlight:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-5px);
            }
            
            .feature-highlight i {
                font-size: 2rem;
                margin-bottom: 15px;
                color: #ffd700;
            }
            
            .feature-highlight h4 {
                margin: 0 0 5px 0;
                font-size: 1.1rem;
            }
            
            .feature-highlight p {
                margin: 0;
                opacity: 0.8;
                font-size: 0.9rem;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        
        document.head.appendChild(styles);
    },
    
    // 5. Animações e Transições
    initAnimations: function() {
        // Animações de entrada para cards
        this.animateCardsOnLoad();
        
        // Efeito de hover sofisticado
        this.addHoverEffects();
        
        // Animações de transição entre páginas
        this.addPageTransitions();
    },
    
    animateCardsOnLoad: function() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1
        });
        
        // Observa todos os cards
        document.querySelectorAll('.card, .teacher-card, .student-card, .content-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            observer.observe(card);
        });
        
        // Adiciona classe de animação
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('.card, .teacher-card, .student-card, .content-card').forEach(card => {
                card.classList.add('animate-on-scroll');
            });
        });
    },
    
    addHoverEffects: function() {
        // Efeitos 3D nos cards
        document.addEventListener('mousemove', (e) => {
            const cards = document.querySelectorAll('.card, .teacher-card, .student-card');
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateY = ((x - centerX) / centerX) * 5;
                const rotateX = ((centerY - y) / centerY) * 5;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
        });
        
        // Reseta transformação quando mouse sai
        document.addEventListener('mouseleave', () => {
            document.querySelectorAll('.card, .teacher-card, .student-card').forEach(card => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
        });
    },
    
    addPageTransitions: function() {
        // Transição suave entre conteúdos
        const originalLoadContent = DashboardModule.loadContent;
        DashboardModule.loadContent = function(menuId) {
            const contentArea = document.getElementById('content-area');
            if (contentArea) {
                contentArea.style.opacity = '0';
                contentArea.style.transform = 'translateY(20px)';
                contentArea.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                
                setTimeout(() => {
                    originalLoadContent.call(this, menuId);
                    
                    // Força reflow
                    contentArea.offsetHeight;
                    
                    contentArea.style.opacity = '1';
                    contentArea.style.transform = 'translateY(0)';
                }, 300);
            } else {
                originalLoadContent.call(this, menuId);
            }
        };
    },
    
    // 6. Gerador de Dados de Demonstração
    initDemoDataGenerator: function() {
        // Botão para gerar dados de demonstração
        const demoBtn = document.createElement('button');
        demoBtn.id = 'demo-data-btn';
        demoBtn.className = 'btn btn-demo';
        demoBtn.innerHTML = '<i class="fas fa-magic"></i> Gerar Dados Demo';
        demoBtn.style.position = 'fixed';
        demoBtn.style.bottom = '120px';
        demoBtn.style.right = '20px';
        demoBtn.style.zIndex = '1000';
        demoBtn.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
        demoBtn.style.boxShadow = '0 4px 15px rgba(67, 233, 123, 0.3)';
        document.body.appendChild(demoBtn);
        
        demoBtn.addEventListener('click', () => this.generateDemoData());
    },
    
    generateDemoData: function() {
        const user = AuthModule.getCurrentUser();
        let message = '';
        
        switch(user.role) {
            case 'secretaria':
                // Adiciona dados demo para secretaria
                message = '📊 Dados de demonstração gerados:\n' +
                         '- 5 novas escolas adicionadas\n' +
                         '- 20 novos professores contratados\n' +
                         '- 150 novas matrículas registradas\n' +
                         '- Relatórios atualizados automaticamente';
                break;
            case 'diretor':
                message = '🏫 Dados da escola atualizados:\n' +
                         '- Notas do 2º bimestre lançadas\n' +
                         '- Frequência do mês calculada\n' +
                         '- Novos alunos matriculados\n' +
                         '- Relatório de desempenho gerado';
                break;
            case 'professor':
                message = '📚 Dados de aula atualizados:\n' +
                         '- Notas dos alunos lançadas\n' +
                         '- Frequência registrada\n' +
                         '- Planejamentos atualizados\n' +
                         '- Materiais adicionados';
                break;
            case 'aluno':
                message = '🎓 Seus dados atualizados:\n' +
                         '- Novas notas disponíveis\n' +
                         '- Frequência atualizada\n' +
                         '- Atividades pendentes\n' +
                         '- Progresso calculado';
                break;
        }
        
        // Mostra confirmação
        const confirmation = document.createElement('div');
        confirmation.className = 'demo-confirmation';
        confirmation.innerHTML = `
            <div class="confirmation-content">
                <i class="fas fa-check-circle"></i>
                <div>
                    <h4>Dados de Demonstração Gerados!</h4>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `;
        
        confirmation.style.position = 'fixed';
        confirmation.style.top = '20px';
        confirmation.style.left = '50%';
        confirmation.style.transform = 'translateX(-50%)';
        confirmation.style.zIndex = '10000';
        confirmation.style.background = 'white';
        confirmation.style.padding = '20px';
        confirmation.style.borderRadius = '10px';
        confirmation.style.boxShadow = '0 10px 40px rgba(0,0,0,0.2)';
        confirmation.style.borderLeft = '5px solid #43e97b';
        confirmation.style.maxWidth = '500px';
        confirmation.style.animation = 'slideDown 0.5s ease';
        
        document.body.appendChild(confirmation);
        
        // Remove após 5 segundos
        setTimeout(() => {
            confirmation.style.animation = 'slideUp 0.5s ease';
            setTimeout(() => {
                if (confirmation.parentNode) {
                    confirmation.remove();
                }
            }, 500);
        }, 5000);
        
        // Atualiza a página atual
        setTimeout(() => {
            const activeMenu = document.querySelector('.menu-item.active')?.dataset.menu;
            if (activeMenu) {
                DashboardModule.loadContent(activeMenu);
            }
        }, 1000);
    },
    
    // Estilos CSS para as funcionalidades de showcase
    addShowcaseStyles: function() {
        const styles = document.createElement('style');
        styles.id = 'showcase-styles';
        styles.textContent = `
            /* Botões flutuantes */
            .btn-ai, .btn-presentation, .btn-demo {
                animation: pulse 2s infinite;
                color: white !important;
                font-weight: 600 !important;
                border: none !important;
                padding: 12px 24px !important;
                border-radius: 30px !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                transition: all 0.3s ease !important;
            }
            
            .btn-ai:hover, .btn-presentation:hover, .btn-demo:hover {
                transform: translateY(-3px) !important;
                box-shadow: 0 8px 25px rgba(0,0,0,0.2) !important;
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
                100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
            }
            
            /* Modal de IA */
            .ai-modal {
                padding: 20px;
            }
            
            .ai-header {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
            }
            
            .ai-avatar {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                color: white;
            }
            
            .ai-title h3 {
                margin: 0 0 5px 0;
                color: #2c3e50;
            }
            
            .ai-title p {
                margin: 0;
                color: #7f8c8d;
                font-size: 14px;
            }
            
            .ai-message {
                margin-bottom: 25px;
            }
            
            .message-bubble {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 15px;
                border-left: 4px solid #667eea;
                font-size: 16px;
                line-height: 1.5;
            }
            
            .ai-features h4 {
                margin-bottom: 15px;
                color: #2c3e50;
            }
            
            .features-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-bottom: 25px;
            }
            
            .feature {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px;
                background: #f8f9fa;
                border-radius: 8px;
                transition: all 0.3s ease;
            }
            
            .feature:hover {
                background: #e3f2fd;
                transform: translateY(-2px);
            }
            
            .feature i {
                color: #667eea;
                font-size: 18px;
            }
            
            .ai-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding-top: 20px;
                border-top: 1px solid #eee;
            }
            
            /* Sugestões contextuais */
            .contextual-suggestion {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 12px 20px;
                border-radius: 10px;
                margin-bottom: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                animation: slideInDown 0.5s ease;
                box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);
            }
            
            .suggestion-content {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            
            .suggestion-content i {
                font-size: 18px;
            }
            
            .close-suggestion {
                background: transparent;
                border: none;
                color: white;
                cursor: pointer;
                padding: 5px;
                border-radius: 4px;
                transition: background 0.3s ease;
            }
            
            .close-suggestion:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            /* Animações */
            @keyframes slideInDown {
                from {
                    transform: translateY(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(-100%);
                    opacity: 0;
                }
            }
            
            @keyframes slideDown {
                from {
                    transform: translate(-50%, -100%);
                    opacity: 0;
                }
                to {
                    transform: translate(-50%, 0);
                    opacity: 1;
                }
            }
            
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
            
            /* Gráficos animados */
            .animated-chart {
                width: 100%;
                height: 150px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            /* Confirmação de demo */
            .demo-confirmation {
                animation: slideDown 0.5s ease;
            }
            
            .confirmation-content {
                display: flex;
                align-items: flex-start;
                gap: 15px;
            }
            
            .confirmation-content i {
                font-size: 32px;
                color: #43e97b;
                margin-top: 5px;
            }
            
            .confirmation-content h4 {
                margin: 0 0 5px 0;
                color: #2c3e50;
            }
            
            .confirmation-content p {
                margin: 0;
                color: #7f8c8d;
                font-size: 14px;
                line-height: 1.4;
            }
            
            /* Responsividade */
            @media (max-width: 768px) {
                .features-grid {
                    grid-template-columns: 1fr;
                }
                
                .presentation-steps {
                    flex-direction: column;
                }
                
                .presentation-features {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .btn-ai, .btn-presentation, .btn-demo {
                    padding: 10px 15px !important;
                    font-size: 14px !important;
                }
                
                .btn-ai span, .btn-presentation span, .btn-demo span {
                    display: none;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
};

// Inicializa o showcase quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Aguarda um pouco para garantir que tudo está carregado
    setTimeout(() => {
        ShowcaseModule.addShowcaseStyles();
        ShowcaseModule.init();
        
        // Adiciona estilos de animação
        const animationStyles = document.createElement('style');
        animationStyles.textContent = `
            .card, .teacher-card, .student-card, .content-card {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .card:hover, .teacher-card:hover, .student-card:hover, .content-card:hover {
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
            }
            
            .live-notification {
                animation: slideInRight 0.3s ease !important;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(animationStyles);
    }, 2000);
});

// Adiciona ao index.html
// <script src="showcase.js"></script>
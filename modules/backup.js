// modulos/backup.js - Sistema de Backup e Restauração
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_BACKUP === 'undefined') {
    const MODULO_BACKUP = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            maxBackups: 10,
            autoBackupInterval: 24 * 60 * 60 * 1000, // 24 horas
            backupKeys: [
                'sme_sessao',
                'sme_notificacoes',
                'sme_historico_busca',
                'sme_favoritos_busca',
                'sme_tema',
                'sme_sync_pendente'
            ]
        };

        // ==================== ESTADO ====================
        let backups = [];
        let autoBackupTimer = null;

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('💾 Sistema de Backup inicializado');
            
            // Carregar backups salvos
            carregarBackups();
            
            // Configurar backup automático
            configurarAutoBackup();
        }

        // ==================== FUNÇÕES DE BACKUP ====================
        function criarBackup(nome = null, incluirDados = true) {
            try {
                const timestamp = new Date();
                const id = Date.now();
                
                // Coletar dados do sistema
                const dados = {
                    metadata: {
                        id: id,
                        nome: nome || `Backup_${timestamp.toISOString().split('T')[0]}`,
                        data: timestamp.toISOString(),
                        versao: '4.0.0',
                        usuario: SISTEMA.getEstado().usuario?.nome || 'Sistema',
                        tamanho: 0
                    },
                    localStorage: {},
                    mockData: incluirDados ? MOCK_DATA : null
                };

                // Backup do localStorage
                CONFIG.backupKeys.forEach(key => {
                    const valor = localStorage.getItem(key);
                    if (valor) {
                        dados.localStorage[key] = JSON.parse(valor);
                    }
                });

                // Calcular tamanho aproximado
                const jsonString = JSON.stringify(dados);
                dados.metadata.tamanho = Math.round(jsonString.length / 1024); // KB

                // Adicionar à lista
                backups.unshift(dados);
                
                // Limitar número de backups
                if (backups.length > CONFIG.maxBackups) {
                    backups = backups.slice(0, CONFIG.maxBackups);
                }

                // Salvar
                salvarBackups();

                if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                    MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                        'Backup Criado',
                        `Backup "${dados.metadata.nome}" criado com sucesso (${dados.metadata.tamanho}KB)`
                    );
                }

                return {
                    sucesso: true,
                    backup: dados
                };

            } catch (erro) {
                console.error('Erro ao criar backup:', erro);
                
                if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                    MODULO_NOTIFICACOES.adicionarNotificacaoErro(
                        'Erro no Backup',
                        erro.message
                    );
                }

                return {
                    sucesso: false,
                    erro: erro.message
                };
            }
        }

        function restaurarBackup(id) {
            try {
                const backup = backups.find(b => b.metadata.id === id);
                if (!backup) {
                    throw new Error('Backup não encontrado');
                }

                // Restaurar localStorage
                Object.entries(backup.localStorage).forEach(([key, valor]) => {
                    localStorage.setItem(key, JSON.stringify(valor));
                });

                // Restaurar MOCK_DATA se disponível
                if (backup.mockData) {
                    Object.assign(MOCK_DATA, backup.mockData);
                }

                if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                    MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                        'Backup Restaurado',
                        `Backup "${backup.metadata.nome}" restaurado com sucesso`
                    );
                }

                // Recarregar página para aplicar mudanças
                setTimeout(() => {
                    if (confirm('Backup restaurado! Deseja recarregar a página para aplicar as mudanças?')) {
                        window.location.reload();
                    }
                }, 1000);

                return {
                    sucesso: true,
                    backup: backup
                };

            } catch (erro) {
                console.error('Erro ao restaurar backup:', erro);
                
                if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                    MODULO_NOTIFICACOES.adicionarNotificacaoErro(
                        'Erro na Restauração',
                        erro.message
                    );
                }

                return {
                    sucesso: false,
                    erro: erro.message
                };
            }
        }

        function excluirBackup(id) {
            try {
                backups = backups.filter(b => b.metadata.id !== id);
                salvarBackups();

                if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                    MODULO_NOTIFICACOES.adicionarNotificacaoInfo(
                        'Backup Excluído',
                        'Backup removido com sucesso'
                    );
                }

                return { sucesso: true };

            } catch (erro) {
                console.error('Erro ao excluir backup:', erro);
                return {
                    sucesso: false,
                    erro: erro.message
                };
            }
        }

        // ==================== EXPORTAÇÃO/IMPORTAÇÃO DE BACKUP ====================
        function exportarBackup(id) {
            try {
                const backup = backups.find(b => b.metadata.id === id);
                if (!backup) {
                    throw new Error('Backup não encontrado');
                }

                const jsonString = JSON.stringify(backup, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                
                const nomeArquivo = `backup_${backup.metadata.nome}_${new Date().toISOString().split('T')[0]}.json`;
                
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = nomeArquivo;
                link.click();
                URL.revokeObjectURL(link.href);

                return { sucesso: true };

            } catch (erro) {
                console.error('Erro ao exportar backup:', erro);
                
                if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                    MODULO_NOTIFICACOES.adicionarNotificacaoErro(
                        'Erro na Exportação',
                        erro.message
                    );
                }

                return {
                    sucesso: false,
                    erro: erro.message
                };
            }
        }

        function importarBackup(arquivo) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    try {
                        const backup = JSON.parse(e.target.result);
                        
                        // Validar estrutura
                        if (!backup.metadata || !backup.localStorage) {
                            throw new Error('Arquivo de backup inválido');
                        }

                        backups.unshift(backup);
                        
                        // Limitar número de backups
                        if (backups.length > CONFIG.maxBackups) {
                            backups = backups.slice(0, CONFIG.maxBackups);
                        }

                        salvarBackups();

                        if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                            MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                                'Backup Importado',
                                `Backup "${backup.metadata.nome}" importado com sucesso`
                            );
                        }

                        resolve({ sucesso: true, backup });

                    } catch (erro) {
                        console.error('Erro ao importar backup:', erro);
                        
                        if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                            MODULO_NOTIFICACOES.adicionarNotificacaoErro(
                                'Erro na Importação',
                                erro.message
                            );
                        }

                        resolve({
                            sucesso: false,
                            erro: erro.message
                        });
                    }
                };

                reader.readAsText(arquivo);
            });
        }

        // ==================== BACKUP AUTOMÁTICO ====================
        function configurarAutoBackup() {
            // Verificar preferência
            const autoBackup = localStorage.getItem('sme_auto_backup') === 'true';
            
            if (autoBackup) {
                iniciarAutoBackup();
            }
        }

        function iniciarAutoBackup() {
            if (autoBackupTimer) {
                clearInterval(autoBackupTimer);
            }

            autoBackupTimer = setInterval(() => {
                criarBackup('Backup Automático', true);
            }, CONFIG.autoBackupInterval);

            localStorage.setItem('sme_auto_backup', 'true');
        }

        function pararAutoBackup() {
            if (autoBackupTimer) {
                clearInterval(autoBackupTimer);
                autoBackupTimer = null;
            }

            localStorage.setItem('sme_auto_backup', 'false');
        }

        function toggleAutoBackup(ativar) {
            if (ativar) {
                iniciarAutoBackup();
            } else {
                pararAutoBackup();
            }
        }

        // ==================== INTERFACE DO USUÁRIO ====================
        function abrirPainelBackup() {
            const modalHTML = `
                <div class="backup-panel">
                    <div class="backup-header">
                        <h3>Gerenciar Backups</h3>
                        <div class="backup-actions">
                            <button class="btn btn-success" onclick="MODULO_BACKUP.criarBackup()">
                                <i class="fas fa-plus"></i> Novo Backup
                            </button>
                            <label class="btn btn-primary">
                                <i class="fas fa-upload"></i> Importar
                                <input type="file" accept=".json" style="display: none;" 
                                       onchange="MODULO_BACKUP.importarBackup(this.files[0])">
                            </label>
                        </div>
                    </div>
                    
                    <div class="backup-opcoes">
                        <label class="toggle-label">
                            <input type="checkbox" id="auto-backup" 
                                   onchange="MODULO_BACKUP.toggleAutoBackup(this.checked)"
                                   ${localStorage.getItem('sme_auto_backup') === 'true' ? 'checked' : ''}>
                            <span class="toggle-text">Backup automático diário</span>
                        </label>
                    </div>
                    
                    <div class="backups-lista">
                        ${backups.length > 0 ? backups.map(b => `
                            <div class="backup-item">
                                <div class="backup-info">
                                    <strong>${b.metadata.nome}</strong>
                                    <small>${new Date(b.metadata.data).toLocaleString('pt-BR')}</small>
                                    <small>${b.metadata.tamanho}KB</small>
                                </div>
                                <div class="backup-acoes">
                                    <button class="btn-icon" title="Restaurar" onclick="MODULO_BACKUP.restaurarBackup(${b.metadata.id})">
                                        <i class="fas fa-history"></i>
                                    </button>
                                    <button class="btn-icon" title="Exportar" onclick="MODULO_BACKUP.exportarBackup(${b.metadata.id})">
                                        <i class="fas fa-download"></i>
                                    </button>
                                    <button class="btn-icon" title="Excluir" onclick="MODULO_BACKUP.excluirBackup(${b.metadata.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('') : `
                            <div class="no-data">
                                <i class="fas fa-database"></i>
                                <p>Nenhum backup encontrado</p>
                            </div>
                        `}
                    </div>
                </div>
            `;

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Backup e Restauração', modalHTML);
            }
        }

        // ==================== PERSISTÊNCIA ====================
        function salvarBackups() {
            try {
                localStorage.setItem('sme_backups', JSON.stringify(backups));
            } catch (e) {
                console.error('Erro ao salvar backups:', e);
            }
        }

        function carregarBackups() {
            try {
                const saved = localStorage.getItem('sme_backups');
                if (saved) {
                    backups = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar backups:', e);
            }
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            criarBackup,
            restaurarBackup,
            excluirBackup,
            exportarBackup,
            importarBackup,
            abrirPainelBackup,
            toggleAutoBackup,
            getBackups: () => backups
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_BACKUP.init();
        }, 3000);
    });

    window.MODULO_BACKUP = MODULO_BACKUP;
    console.log('✅ Módulo de Backup carregado');
}
// modulos/backup-nuvem.js - Backup Automático em Nuvem
// Sistema de Gestão Educacional Municipal - FASE 6

if (typeof MODULO_BACKUP_NUVEM === 'undefined') {
    const MODULO_BACKUP_NUVEM = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            versao: '1.0.0',
            provedores: {
                GOOGLE_DRIVE: 'google_drive',
                DROPBOX: 'dropbox',
                ONEDRIVE: 'onedrive',
                AWS_S3: 'aws_s3',
                LOCAL: 'local'
            },
            provedorPadrao: 'local',
            intervalos: {
                diario: 24 * 60 * 60 * 1000,
                semanal: 7 * 24 * 60 * 60 * 1000,
                mensal: 30 * 24 * 60 * 60 * 1000
            },
            retencao: {
                diario: 7,      // manter 7 backups diários
                semanal: 4,      // manter 4 backups semanais
                mensal: 12       // manter 12 backups mensais
            },
            tiposBackup: {
                COMPLETO: 'completo',
                INCREMENTAL: 'incremental',
                DIFERENCIAL: 'diferencial',
                SELETIVO: 'seletivo'
            },
            maxBackups: 50,
            maxTamanho: 1024 * 1024 * 1024, // 1GB
            criptografar: true,
            comprimir: true
        };

        // ==================== ESTADO ====================
        let backups = [];
        let configuracoes = {
            provedor: CONFIG.provedorPadrao,
            intervalo: 'diario',
            automatico: true,
            criptografar: true,
            comprimir: true,
            credenciais: {}
        };
        let status = {
            ultimoBackup: null,
            proximoBackup: null,
            sincronizando: false,
            erros: [],
            estatisticas: {
                totalBackups: 0,
                tamanhoTotal: 0,
                ultimoTamanho: 0,
                tempoMedio: 0
            }
        };
        let timerBackup = null;

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('☁️ Módulo de Backup em Nuvem inicializado');
            
            carregarConfiguracoes();
            carregarBackups();
            configurarBackupAutomatico();
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                MODULO_AUDITORIA_AVANCADA.registrarLogSeguranca(
                    'Módulo de backup em nuvem inicializado'
                );
            }
        }

        // ==================== FUNÇÕES DE BACKUP ====================
        async function criarBackup(tipo = CONFIG.tiposBackup.COMPLETO, opcoes = {}) {
            if (status.sincronizando) {
                throw new Error('Backup já em andamento');
            }

            status.sincronizando = true;
            notificarStatus('iniciando', 'Iniciando backup...');

            const inicio = Date.now();

            try {
                // Coletar dados para backup
                const dados = await coletarDadosBackup(tipo, opcoes);

                // Comprimir se necessário
                let dadosProcessados = dados;
                if (configuracoes.comprimir) {
                    dadosProcessados = await comprimirDados(dados);
                }

                // Criptografar se necessário
                if (configuracoes.criptografar) {
                    dadosProcessados = await criptografarDados(dadosProcessados);
                }

                // Enviar para o provedor
                const resultado = await enviarParaProvedor(
                    dadosProcessados,
                    tipo,
                    configuracoes.provedor
                );

                // Registrar backup
                const backup = {
                    id: gerarId(),
                    timestamp: new Date().toISOString(),
                    tipo,
                    provedor: configuracoes.provedor,
                    tamanho: resultado.tamanho,
                    arquivo: resultado.arquivo,
                    hash: resultado.hash,
                    status: 'concluido',
                    metadados: {
                        ...opcoes,
                        versao: CONFIG.versao,
                        usuario: obterUsuarioAtual()?.nome
                    }
                };

                backups.unshift(backup);

                // Limitar número de backups
                if (backups.length > CONFIG.maxBackups) {
                    backups = backups.slice(0, CONFIG.maxBackups);
                }

                // Atualizar estatísticas
                atualizarEstatisticas(backup);

                // Registrar no auditório
                if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                    MODULO_AUDITORIA_AVANCADA.registrarLogSeguranca(
                        `Backup ${tipo} criado com sucesso`,
                        { tamanho: resultado.tamanho, provedor: configuracoes.provedor }
                    );
                }

                status.ultimoBackup = new Date().toISOString();
                status.sincronizando = false;
                notificarStatus('concluido', 'Backup concluído com sucesso');

                salvarBackups();
                return backup;

            } catch (erro) {
                status.sincronizando = false;
                status.erros.push({
                    timestamp: new Date().toISOString(),
                    erro: erro.message
                });

                notificarStatus('erro', `Erro no backup: ${erro.message}`);

                if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                    MODULO_AUDITORIA_AVANCADA.registrarLogErro(
                        'Erro ao criar backup',
                        erro
                    );
                }

                throw erro;
            } finally {
                status.sincronizando = false;
            }
        }

        async function coletarDadosBackup(tipo, opcoes) {
            const dados = {
                metadata: {
                    timestamp: new Date().toISOString(),
                    tipo,
                    versao: CONFIG.versao,
                    sistema: 'Sistema de Gestão Educacional Municipal'
                },
                mockData: MOCK_DATA,
                configuracoes: {
                    tema: localStorage.getItem('sme_tema'),
                    idioma: localStorage.getItem('sme_idioma'),
                    acessibilidade: localStorage.getItem('sme_acessibilidade'),
                    permissoes: localStorage.getItem('sme_permissoes_custom'),
                    notificacoes: localStorage.getItem('sme_notificacoes')
                },
                logs: {
                    auditoria: localStorage.getItem('sme_auditoria_logs'),
                    acesso: localStorage.getItem('sme_logs_avancados')
                }
            };

            // Backup seletivo
            if (tipo === CONFIG.tiposBackup.SELETIVO && opcoes.tipos) {
                const dadosSelecionados = {};
                opcoes.tipos.forEach(t => {
                    if (dados[t]) dadosSelecionados[t] = dados[t];
                });
                return dadosSelecionados;
            }

            return dados;
        }

        // ==================== PROVEDORES DE NUVEM ====================
        async function enviarParaProvedor(dados, tipo, provedor) {
            switch(provedor) {
                case CONFIG.provedores.GOOGLE_DRIVE:
                    return await enviarParaGoogleDrive(dados, tipo);
                case CONFIG.provedores.DROPBOX:
                    return await enviarParaDropbox(dados, tipo);
                case CONFIG.provedores.ONEDRIVE:
                    return await enviarParaOneDrive(dados, tipo);
                case CONFIG.provedores.AWS_S3:
                    return await enviarParaAWSS3(dados, tipo);
                default:
                    return await enviarParaLocal(dados, tipo);
            }
        }

        async function enviarParaGoogleDrive(dados, tipo) {
            // Simular envio para Google Drive
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        sucesso: true,
                        tamanho: JSON.stringify(dados).length,
                        arquivo: `backup_${new Date().toISOString().split('T')[0]}_${tipo}.json`,
                        hash: gerarHash(dados)
                    });
                }, 2000);
            });
        }

        async function enviarParaDropbox(dados, tipo) {
            // Simular envio para Dropbox
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        sucesso: true,
                        tamanho: JSON.stringify(dados).length,
                        arquivo: `backup_${new Date().toISOString().split('T')[0]}_${tipo}.json`,
                        hash: gerarHash(dados)
                    });
                }, 2000);
            });
        }

        async function enviarParaOneDrive(dados, tipo) {
            // Simular envio para OneDrive
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        sucesso: true,
                        tamanho: JSON.stringify(dados).length,
                        arquivo: `backup_${new Date().toISOString().split('T')[0]}_${tipo}.json`,
                        hash: gerarHash(dados)
                    });
                }, 2000);
            });
        }

        async function enviarParaAWSS3(dados, tipo) {
            // Simular envio para AWS S3
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        sucesso: true,
                        tamanho: JSON.stringify(dados).length,
                        arquivo: `backup_${new Date().toISOString().split('T')[0]}_${tipo}.json`,
                        hash: gerarHash(dados)
                    });
                }, 2000);
            });
        }

        async function enviarParaLocal(dados, tipo) {
            // Salvar localmente (download)
            const jsonString = JSON.stringify(dados, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `backup_${new Date().toISOString().split('T')[0]}_${tipo}.json`;
            link.click();

            return {
                sucesso: true,
                tamanho: jsonString.length,
                arquivo: link.download,
                hash: gerarHash(dados)
            };
        }

        // ==================== RESTAURAÇÃO ====================
        async function restaurarBackup(backupId) {
            const backup = backups.find(b => b.id === backupId);
            if (!backup) {
                throw new Error('Backup não encontrado');
            }

            status.sincronizando = true;
            notificarStatus('restaurando', 'Restaurando backup...');

            try {
                // Baixar do provedor
                const dados = await baixarDoProvedor(backup);

                // Descriptografar se necessário
                let dadosProcessados = dados;
                if (configuracoes.criptografar) {
                    dadosProcessados = await descriptografarDados(dados);
                }

                // Descomprimir se necessário
                if (configuracoes.comprimir) {
                    dadosProcessados = await descomprimirDados(dadosProcessados);
                }

                // Restaurar dados
                await aplicarRestauracao(dadosProcessados);

                status.sincronizando = false;
                notificarStatus('restaurado', 'Backup restaurado com sucesso');

                if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                    MODULO_AUDITORIA_AVANCADA.registrarLogSeguranca(
                        `Backup ${backupId} restaurado com sucesso`
                    );
                }

                return true;

            } catch (erro) {
                status.sincronizando = false;
                status.erros.push({
                    timestamp: new Date().toISOString(),
                    erro: erro.message
                });

                notificarStatus('erro', `Erro na restauração: ${erro.message}`);

                if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                    MODULO_AUDITORIA_AVANCADA.registrarLogErro(
                        'Erro ao restaurar backup',
                        erro
                    );
                }

                throw erro;
            }
        }

        async function baixarDoProvedor(backup) {
            // Simular download do provedor
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        mockData: MOCK_DATA,
                        configuracoes: {}
                    });
                }, 2000);
            });
        }

        async function aplicarRestauracao(dados) {
            // Restaurar MOCK_DATA
            if (dados.mockData) {
                Object.assign(MOCK_DATA, dados.mockData);
            }

            // Restaurar configurações
            if (dados.configuracoes) {
                Object.entries(dados.configuracoes).forEach(([key, value]) => {
                    if (value) localStorage.setItem(key, value);
                });
            }

            // Recarregar página para aplicar mudanças
            setTimeout(() => {
                if (confirm('Backup restaurado! Deseja recarregar a página?')) {
                    window.location.reload();
                }
            }, 1000);
        }

        // ==================== BACKUP AUTOMÁTICO ====================
        function configurarBackupAutomatico() {
            if (!configuracoes.automatico) return;

            const intervalo = CONFIG.intervalos[configuracoes.intervalo] || CONFIG.intervalos.diario;

            if (timerBackup) {
                clearInterval(timerBackup);
            }

            timerBackup = setInterval(() => {
                if (!status.sincronizando) {
                    criarBackup(CONFIG.tiposBackup.INCREMENTAL).catch(console.error);
                }
            }, intervalo);

            // Calcular próximo backup
            status.proximoBackup = new Date(Date.now() + intervalo).toISOString();
        }

        function pararBackupAutomatico() {
            if (timerBackup) {
                clearInterval(timerBackup);
                timerBackup = null;
                status.proximoBackup = null;
            }
        }

        // ==================== LIMPEZA DE BACKUPS ANTIGOS ====================
        function limparBackupsAntigos() {
            const agora = Date.now();
            const diarioLimite = agora - (CONFIG.retencao.diario * 24 * 60 * 60 * 1000);
            const semanalLimite = agora - (CONFIG.retencao.semanal * 7 * 24 * 60 * 60 * 1000);
            const mensalLimite = agora - (CONFIG.retencao.mensal * 30 * 24 * 60 * 60 * 1000);

            const backupsManter = [];
            const backupsRemover = [];

            backups.forEach(backup => {
                const dataBackup = new Date(backup.timestamp).getTime();
                const idade = agora - dataBackup;

                if (idade > mensalLimite && backupsManter.length < CONFIG.retencao.mensal) {
                    backupsManter.push(backup);
                } else if (idade > semanalLimite && backupsManter.length < CONFIG.retencao.semanal) {
                    backupsManter.push(backup);
                } else if (idade > diarioLimite && backupsManter.length < CONFIG.retencao.diario) {
                    backupsManter.push(backup);
                } else {
                    backupsRemover.push(backup);
                }
            });

            // Remover backups antigos
            backupsRemover.forEach(backup => {
                removerBackup(backup.id);
            });

            return {
                mantidos: backupsManter.length,
                removidos: backupsRemover.length
            };
        }

        async function removerBackup(backupId) {
            backups = backups.filter(b => b.id !== backupId);
            salvarBackups();

            if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                MODULO_AUDITORIA_AVANCADA.registrarLogSeguranca(
                    `Backup ${backupId} removido`
                );
            }
        }

        // ==================== COMPRESSÃO E CRIPTOGRAFIA ====================
        async function comprimirDados(dados) {
            // Simular compressão
            return {
                ...dados,
                comprimido: true,
                tamanhoOriginal: JSON.stringify(dados).length
            };
        }

        async function descomprimirDados(dados) {
            // Simular descompressão
            delete dados.comprimido;
            delete dados.tamanhoOriginal;
            return dados;
        }

        async function criptografarDados(dados) {
            // Simular criptografia
            return {
                ...dados,
                criptografado: true,
                algoritmo: 'AES-256'
            };
        }

        async function descriptografarDados(dados) {
            // Simular descriptografia
            delete dados.criptografado;
            delete dados.algoritmo;
            return dados;
        }

        // ==================== CONFIGURAÇÕES ====================
        function setConfiguracao(chave, valor) {
            configuracoes[chave] = valor;
            salvarConfiguracoes();

            if (chave === 'automatico' || chave === 'intervalo') {
                configurarBackupAutomatico();
            }

            if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                MODULO_AUDITORIA_AVANCADA.registrarLogSeguranca(
                    `Configuração de backup alterada: ${chave}`
                );
            }
        }

        function getConfiguracoes() {
            return { ...configuracoes };
        }

        // ==================== UTILITÁRIOS ====================
        function gerarId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        function gerarHash(dados) {
            const str = JSON.stringify(dados);
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return hash.toString(16);
        }

        function obterUsuarioAtual() {
            if (typeof SISTEMA !== 'undefined') {
                return SISTEMA.getEstado().usuario;
            }
            return null;
        }

        function atualizarEstatisticas(backup) {
            status.estatisticas.totalBackups = backups.length;
            status.estatisticas.ultimoTamanho = backup.tamanho;
            status.estatisticas.tamanhoTotal = backups.reduce((acc, b) => acc + (b.tamanho || 0), 0);
            
            // Calcular tempo médio (simulado)
            status.estatisticas.tempoMedio = Math.round(
                (status.estatisticas.tempoMedio + 2000) / 2
            );
        }

        function notificarStatus(tipo, mensagem) {
            if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                switch(tipo) {
                    case 'iniciando':
                        MODULO_NOTIFICACOES.adicionarNotificacaoInfo('Backup', mensagem);
                        break;
                    case 'concluido':
                        MODULO_NOTIFICACOES.adicionarNotificacaoSucesso('Backup', mensagem);
                        break;
                    case 'erro':
                        MODULO_NOTIFICACOES.adicionarNotificacaoErro('Backup', mensagem);
                        break;
                    case 'restaurando':
                        MODULO_NOTIFICACOES.adicionarNotificacaoInfo('Restauração', mensagem);
                        break;
                    case 'restaurado':
                        MODULO_NOTIFICACOES.adicionarNotificacaoSucesso('Restauração', mensagem);
                        break;
                }
            }
        }

        function salvarBackups() {
            try {
                localStorage.setItem('sme_backups_nuvem', JSON.stringify(backups));
            } catch (e) {
                console.error('Erro ao salvar backups:', e);
            }
        }

        function carregarBackups() {
            try {
                const saved = localStorage.getItem('sme_backups_nuvem');
                if (saved) {
                    backups = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Erro ao carregar backups:', e);
            }
        }

        function salvarConfiguracoes() {
            try {
                localStorage.setItem('sme_backup_config', JSON.stringify(configuracoes));
            } catch (e) {
                console.error('Erro ao salvar configurações:', e);
            }
        }

        function carregarConfiguracoes() {
            try {
                const saved = localStorage.getItem('sme_backup_config');
                if (saved) {
                    configuracoes = { ...configuracoes, ...JSON.parse(saved) };
                }
            } catch (e) {
                console.error('Erro ao carregar configurações:', e);
            }
        }

        // ==================== INTERFACE DO USUÁRIO ====================
        function abrirPainelBackupNuvem() {
            const modalHTML = `
                <div class="backup-nuvem-painel">
                    <div class="backup-header">
                        <h2><i class="fas fa-cloud-upload-alt"></i> Backup em Nuvem</h2>
                        <div class="backup-status ${status.sincronizando ? 'sincronizando' : ''}">
                            <i class="fas ${status.sincronizando ? 'fa-spinner fa-spin' : 'fa-cloud'}"></i>
                            <span>${status.sincronizando ? 'Processando...' : 'Pronto'}</span>
                        </div>
                    </div>
                    
                    <div class="backup-stats">
                        <div class="stat-card">
                            <div class="stat-label">Último Backup</div>
                            <div class="stat-value">${status.ultimoBackup ? new Date(status.ultimoBackup).toLocaleString() : 'Nunca'}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Próximo Backup</div>
                            <div class="stat-value">${status.proximoBackup ? new Date(status.proximoBackup).toLocaleString() : 'Não agendado'}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Total Backups</div>
                            <div class="stat-value">${status.estatisticas.totalBackups}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Tamanho Total</div>
                            <div class="stat-value">${formatarBytes(status.estatisticas.tamanhoTotal)}</div>
                        </div>
                    </div>
                    
                    <div class="backup-config">
                        <h3>Configurações</h3>
                        
                        <div class="config-item">
                            <label>Provedor:</label>
                            <select class="form-control" id="backup-provedor" onchange="MODULO_BACKUP_NUVEM.setConfiguracao('provedor', this.value)">
                                <option value="local" ${configuracoes.provedor === 'local' ? 'selected' : ''}>Local (Download)</option>
                                <option value="google_drive" ${configuracoes.provedor === 'google_drive' ? 'selected' : ''}>Google Drive</option>
                                <option value="dropbox" ${configuracoes.provedor === 'dropbox' ? 'selected' : ''}>Dropbox</option>
                                <option value="onedrive" ${configuracoes.provedor === 'onedrive' ? 'selected' : ''}>OneDrive</option>
                                <option value="aws_s3" ${configuracoes.provedor === 'aws_s3' ? 'selected' : ''}>AWS S3</option>
                            </select>
                        </div>
                        
                        <div class="config-item">
                            <label>Intervalo:</label>
                            <select class="form-control" id="backup-intervalo" onchange="MODULO_BACKUP_NUVEM.setConfiguracao('intervalo', this.value)">
                                <option value="diario" ${configuracoes.intervalo === 'diario' ? 'selected' : ''}>Diário</option>
                                <option value="semanal" ${configuracoes.intervalo === 'semanal' ? 'selected' : ''}>Semanal</option>
                                <option value="mensal" ${configuracoes.intervalo === 'mensal' ? 'selected' : ''}>Mensal</option>
                            </select>
                        </div>
                        
                        <div class="config-item toggle">
                            <label>
                                <input type="checkbox" id="backup-automatico" 
                                       ${configuracoes.automatico ? 'checked' : ''}
                                       onchange="MODULO_BACKUP_NUVEM.setConfiguracao('automatico', this.checked)">
                                Backup Automático
                            </label>
                        </div>
                        
                        <div class="config-item toggle">
                            <label>
                                <input type="checkbox" id="backup-criptografar" 
                                       ${configuracoes.criptografar ? 'checked' : ''}
                                       onchange="MODULO_BACKUP_NUVEM.setConfiguracao('criptografar', this.checked)">
                                Criptografar Backup
                            </label>
                        </div>
                        
                        <div class="config-item toggle">
                            <label>
                                <input type="checkbox" id="backup-comprimir" 
                                       ${configuracoes.comprimir ? 'checked' : ''}
                                       onchange="MODULO_BACKUP_NUVEM.setConfiguracao('comprimir', this.checked)">
                                Comprimir Backup
                            </label>
                        </div>
                    </div>
                    
                    <div class="backup-actions">
                        <button class="btn btn-primary" onclick="MODULO_BACKUP_NUVEM.criarBackup('completo')">
                            <i class="fas fa-cloud-upload-alt"></i> Backup Agora
                        </button>
                        <button class="btn btn-secondary" onclick="MODULO_BACKUP_NUVEM.limparBackupsAntigos()">
                            <i class="fas fa-trash"></i> Limpar Antigos
                        </button>
                    </div>
                    
                    <div class="backup-lista">
                        <h3>Backups Realizados</h3>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Tipo</th>
                                    <th>Provedor</th>
                                    <th>Tamanho</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${backups.map(b => `
                                    <tr>
                                        <td>${new Date(b.timestamp).toLocaleString()}</td>
                                        <td><span class="badge badge-${b.tipo}">${b.tipo}</span></td>
                                        <td>${b.provedor}</td>
                                        <td>${formatarBytes(b.tamanho)}</td>
                                        <td>
                                            <button class="btn-icon" onclick="MODULO_BACKUP_NUVEM.restaurarBackup('${b.id}')" title="Restaurar">
                                                <i class="fas fa-history"></i>
                                            </button>
                                            <button class="btn-icon" onclick="MODULO_BACKUP_NUVEM.removerBackup('${b.id}')" title="Excluir">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            // Adicionar estilos
            adicionarEstilosBackupNuvem();

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Backup em Nuvem', modalHTML);
            }
        }

        function adicionarEstilosBackupNuvem() {
            if (document.getElementById('style-backup-nuvem')) return;

            const style = document.createElement('style');
            style.id = 'style-backup-nuvem';
            style.textContent = `
                .backup-nuvem-painel {
                    max-height: 600px;
                    overflow-y: auto;
                }
                
                .backup-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .backup-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 15px;
                    border-radius: 20px;
                    background: #27ae60;
                    color: white;
                }
                
                .backup-status.sincronizando {
                    background: #f39c12;
                }
                
                .backup-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin-bottom: 30px;
                }
                
                .backup-config {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                }
                
                .config-item {
                    margin-bottom: 15px;
                }
                
                .config-item label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 500;
                }
                
                .config-item.toggle label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                }
                
                .backup-actions {
                    display: flex;
                    gap: 10px;
                    margin: 20px 0;
                }
                
                .backup-lista {
                    max-height: 300px;
                    overflow-y: auto;
                }
                
                .badge-completo {
                    background: #3498db;
                    color: white;
                }
                
                .badge-incremental {
                    background: #27ae60;
                    color: white;
                }
                
                .badge-diferencial {
                    background: #f39c12;
                    color: white;
                }
                
                .badge-seletivo {
                    background: #9b59b6;
                    color: white;
                }
            `;

            document.head.appendChild(style);
        }

        function formatarBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            criarBackup,
            restaurarBackup,
            removerBackup,
            limparBackupsAntigos,
            setConfiguracao,
            getConfiguracoes,
            getStatus: () => ({ ...status }),
            pararBackupAutomatico,
            abrirPainelBackupNuvem,
            tipos: CONFIG.tiposBackup,
            provedores: CONFIG.provedores
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_BACKUP_NUVEM.init();
        }, 5500);
    });

    window.MODULO_BACKUP_NUVEM = MODULO_BACKUP_NUVEM;
    console.log('✅ Módulo de Backup em Nuvem carregado');
}
// modulos/importacao-exportacao.js - Importação/Exportação em Lote
// Sistema de Gestão Educacional Municipal - FASE 8

if (typeof MODULO_IMPORTACAO_EXPORTACAO === 'undefined') {
    const MODULO_IMPORTACAO_EXPORTACAO = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            versao: '1.0.0',
            formatos: {
                CSV: 'csv',
                JSON: 'json',
                XML: 'xml',
                EXCEL: 'excel',
                PDF: 'pdf'
            },
            tipos: {
                ALUNOS: 'alunos',
                PROFESSORES: 'professores',
                ESCOLAS: 'escolas',
                TURMAS: 'turmas',
                NOTAS: 'notas',
                FREQUENCIA: 'frequencia',
                BIBLIOTECA: 'biblioteca',
                OCORRENCIAS: 'ocorrencias'
            },
            tamanhoMaximo: 50 * 1024 * 1024, // 50MB
            linhasMaximas: 10000,
            lotes: 1000,
            encoding: 'UTF-8',
            delimitador: ';',
            mapeamentos: {
                alunos: {
                    id: 'ID',
                    nome: 'Nome Completo',
                    email: 'E-mail',
                    matricula: 'Matrícula',
                    turma: 'Turma',
                    dataNascimento: 'Data de Nascimento',
                    responsavel: 'Responsável',
                    telefone: 'Telefone',
                    endereco: 'Endereço',
                    mediaGeral: 'Média Geral',
                    faltas: 'Faltas',
                    status: 'Status'
                },
                professores: {
                    id: 'ID',
                    nome: 'Nome Completo',
                    email: 'E-mail',
                    disciplina: 'Disciplina',
                    formacao: 'Formação',
                    telefone: 'Telefone',
                    status: 'Status'
                }
            }
        };

        // ==================== ESTADO ====================
        let importacoes = [];
        let exportacoes = [];
        let filaProcessamento = [];
        let estatisticas = {
            importacoes: 0,
            exportacoes: 0,
            linhasProcessadas: 0,
            erros: 0,
            tempoMedio: 0
        };

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('📦 Módulo de Importação/Exportação em Lote inicializado');
            
            carregarHistorico();
            configurarProcessamento();
            
            // Registrar no módulo de auditoria
            if (typeof MODULO_AUDITORIA_AVANCADA !== 'undefined') {
                MODULO_AUDITORIA_AVANCADA.registrarLog(
                    'Módulo de importação/exportação em lote inicializado',
                    MODULO_AUDITORIA_AVANCADA.categorias?.SISTEMA || 'sistema',
                    MODULO_AUDITORIA_AVANCADA.niveis?.INFO || 'info'
                );
            }
        }

        // ==================== EXPORTAÇÃO ====================
        async function exportarDados(tipo, formato = CONFIG.formatos.CSV, opcoes = {}) {
            const inicio = Date.now();
            const id = gerarId();

            try {
                // Coletar dados
                const dados = coletarDados(tipo, opcoes.filtros);
                
                if (dados.length > CONFIG.linhasMaximas && !opcoes.forcar) {
                    throw new Error(`Muitas linhas (${dados.length}). Máximo: ${CONFIG.linhasMaximas}`);
                }

                // Processar em lotes
                const lotes = processarEmLotes(dados, opcoes.lote || CONFIG.lotes);
                
                let arquivos = [];
                for (let i = 0; i < lotes.length; i++) {
                    const arquivo = await gerarArquivo(lotes[i], formato, {
                        ...opcoes,
                        lote: i + 1,
                        totalLotes: lotes.length
                    });
                    arquivos.push(arquivo);
                }

                // Registrar exportação
                const exportacao = {
                    id,
                    tipo,
                    formato,
                    data: new Date().toISOString(),
                    linhas: dados.length,
                    lotes: lotes.length,
                    arquivos: arquivos.map(a => a.nome),
                    status: 'concluido',
                    tempo: Date.now() - inicio
                };

                exportacoes.unshift(exportacao);
                estatisticas.exportacoes++;
                estatisticas.linhasProcessadas += dados.length;
                estatisticas.tempoMedio = (estatisticas.tempoMedio + (Date.now() - inicio)) / 2;

                salvarHistorico();

                return exportacao;

            } catch (erro) {
                const erroExportacao = {
                    id,
                    tipo,
                    formato,
                    data: new Date().toISOString(),
                    erro: erro.message,
                    status: 'erro',
                    tempo: Date.now() - inicio
                };

                exportacoes.unshift(erroExportacao);
                estatisticas.erros++;

                throw erro;
            }
        }

        function coletarDados(tipo, filtros = {}) {
            let dados = [];

            switch(tipo) {
                case CONFIG.tipos.ALUNOS:
                    dados = [...(MOCK_DATA.alunos || [])];
                    break;
                case CONFIG.tipos.PROFESSORES:
                    dados = [...(MOCK_DATA.professores || [])];
                    break;
                case CONFIG.tipos.ESCOLAS:
                    dados = [...(MOCK_DATA.escolas || [])];
                    break;
                case CONFIG.tipos.TURMAS:
                    dados = [...(MOCK_DATA.turmas || [])];
                    break;
                case CONFIG.tipos.NOTAS:
                    dados = [...(MOCK_DATA.notas || [])];
                    break;
                case CONFIG.tipos.FREQUENCIA:
                    dados = [...(MOCK_DATA.frequencias || [])];
                    break;
                case CONFIG.tipos.BIBLIOTECA:
                    dados = [...(MOCK_DATA.biblioteca?.livros || [])];
                    break;
                case CONFIG.tipos.OCORRENCIAS:
                    dados = [...(MOCK_DATA.ocorrencias || [])];
                    break;
            }

            // Aplicar filtros
            if (filtros) {
                dados = aplicarFiltros(dados, filtros);
            }

            return dados;
        }

        function aplicarFiltros(dados, filtros) {
            return dados.filter(item => {
                for (const [campo, valor] of Object.entries(filtros)) {
                    if (item[campo] !== valor) {
                        return false;
                    }
                }
                return true;
            });
        }

        function processarEmLotes(dados, tamanhoLote) {
            const lotes = [];
            for (let i = 0; i < dados.length; i += tamanhoLote) {
                lotes.push(dados.slice(i, i + tamanhoLote));
            }
            return lotes;
        }

        async function gerarArquivo(dados, formato, opcoes = {}) {
            switch(formato) {
                case CONFIG.formatos.CSV:
                    return gerarCSV(dados, opcoes);
                case CONFIG.formatos.JSON:
                    return gerarJSON(dados, opcoes);
                case CONFIG.formatos.XML:
                    return gerarXML(dados, opcoes);
                case CONFIG.formatos.EXCEL:
                    return gerarExcel(dados, opcoes);
                case CONFIG.formatos.PDF:
                    return gerarPDF(dados, opcoes);
                default:
                    throw new Error(`Formato não suportado: ${formato}`);
            }
        }

        function gerarCSV(dados, opcoes) {
            if (dados.length === 0) return null;

            const mapeamento = CONFIG.mapeamentos[opcoes.tipo] || {};
            const cabecalho = Object.values(mapeamento).join(CONFIG.delimitador);
            
            const linhas = dados.map(item => {
                return Object.keys(mapeamento).map(campo => {
                    let valor = item[campo] || '';
                    // Escapar delimitador
                    if (valor.toString().includes(CONFIG.delimitador)) {
                        valor = `"${valor}"`;
                    }
                    return valor;
                }).join(CONFIG.delimitador);
            });

            const conteudo = [cabecalho, ...linhas].join('\n');
            const nome = `exportacao_${opcoes.tipo}_${new Date().toISOString().split('T')[0]}` +
                        (opcoes.lote ? `_parte${opcoes.lote}` : '') + '.csv';

            return baixarArquivo(conteudo, nome, 'text/csv;charset=utf-8;');
        }

        function gerarJSON(dados, opcoes) {
            const conteudo = JSON.stringify(dados, null, 2);
            const nome = `exportacao_${opcoes.tipo}_${new Date().toISOString().split('T')[0]}` +
                        (opcoes.lote ? `_parte${opcoes.lote}` : '') + '.json';

            return baixarArquivo(conteudo, nome, 'application/json');
        }

        function gerarXML(dados, opcoes) {
            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
            xml += `<${opcoes.tipo}>\n`;

            dados.forEach(item => {
                xml += '  <registro>\n';
                Object.entries(item).forEach(([chave, valor]) => {
                    xml += `    <${chave}>${escapeXML(valor)}</${chave}>\n`;
                });
                xml += '  </registro>\n';
            });

            xml += `</${opcoes.tipo}>`;

            const nome = `exportacao_${opcoes.tipo}_${new Date().toISOString().split('T')[0]}` +
                        (opcoes.lote ? `_parte${opcoes.lote}` : '') + '.xml';

            return baixarArquivo(xml, nome, 'application/xml');
        }

        function gerarExcel(dados, opcoes) {
            // Simular Excel (na prática usaria uma biblioteca como xlsx)
            console.log('Gerando Excel com', dados.length, 'registros');
            
            const conteudo = JSON.stringify(dados, null, 2);
            const nome = `exportacao_${opcoes.tipo}_${new Date().toISOString().split('T')[0]}` +
                        (opcoes.lote ? `_parte${opcoes.lote}` : '') + '.xlsx';

            return baixarArquivo(conteudo, nome, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        }

        function gerarPDF(dados, opcoes) {
            // Simular PDF
            console.log('Gerando PDF com', dados.length, 'registros');
            
            const conteudo = JSON.stringify(dados, null, 2);
            const nome = `exportacao_${opcoes.tipo}_${new Date().toISOString().split('T')[0]}` +
                        (opcoes.lote ? `_parte${opcoes.lote}` : '') + '.pdf';

            return baixarArquivo(conteudo, nome, 'application/pdf');
        }

        function baixarArquivo(conteudo, nome, tipo) {
            const blob = new Blob(['\uFEFF' + conteudo], { type: tipo });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = nome;
            link.click();

            URL.revokeObjectURL(url);

            return { nome, tamanho: blob.size };
        }

        function escapeXML(valor) {
            if (valor === null || valor === undefined) return '';
            return valor.toString()
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        }

        // ==================== IMPORTAÇÃO ====================
        async function importarDados(arquivo, tipo, opcoes = {}) {
            const inicio = Date.now();
            const id = gerarId();

            try {
                // Validar arquivo
                if (arquivo.size > CONFIG.tamanhoMaximo) {
                    throw new Error(`Arquivo muito grande. Máximo: ${CONFIG.tamanhoMaximo / 1024 / 1024}MB`);
                }

                // Ler arquivo
                const conteudo = await lerArquivo(arquivo);
                
                // Parsear conforme formato
                const dados = await parsearArquivo(conteudo, arquivo.name.split('.').pop(), opcoes);

                // Validar dados
                const validacao = validarDadosImportacao(dados, tipo, opcoes.validacoes);
                if (!validacao.valido) {
                    throw new Error(`Dados inválidos: ${validacao.erros.join(', ')}`);
                }

                // Processar em lotes
                const lotes = processarEmLotes(dados, opcoes.lote || CONFIG.lotes);
                const resultados = [];

                for (let i = 0; i < lotes.length; i++) {
                    const resultado = await processarLoteImportacao(lotes[i], tipo, {
                        ...opcoes,
                        lote: i + 1,
                        totalLotes: lotes.length
                    });
                    resultados.push(resultado);
                }

                // Registrar importação
                const importacao = {
                    id,
                    tipo,
                    arquivo: arquivo.name,
                    data: new Date().toISOString(),
                    linhas: dados.length,
                    lotes: lotes.length,
                    resultados,
                    status: 'concluido',
                    tempo: Date.now() - inicio
                };

                importacoes.unshift(importacao);
                estatisticas.importacoes++;
                estatisticas.linhasProcessadas += dados.length;

                return importacao;

            } catch (erro) {
                const erroImportacao = {
                    id,
                    tipo,
                    arquivo: arquivo.name,
                    data: new Date().toISOString(),
                    erro: erro.message,
                    status: 'erro',
                    tempo: Date.now() - inicio
                };

                importacoes.unshift(erroImportacao);
                estatisticas.erros++;

                throw erro;
            }
        }

        function lerArquivo(arquivo) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = (e) => {
                    resolve(e.target.result);
                };

                reader.onerror = () => {
                    reject(new Error('Erro ao ler arquivo'));
                };

                reader.readAsText(arquivo, CONFIG.encoding);
            });
        }

        async function parsearArquivo(conteudo, formato, opcoes) {
            switch(formato) {
                case 'csv':
                    return parsearCSV(conteudo, opcoes);
                case 'json':
                    return parsearJSON(conteudo, opcoes);
                case 'xml':
                    return parsearXML(conteudo, opcoes);
                case 'xlsx':
                    return parsearExcel(conteudo, opcoes);
                default:
                    throw new Error(`Formato não suportado: ${formato}`);
            }
        }

        function parsearCSV(conteudo, opcoes) {
            const linhas = conteudo.split('\n').filter(l => l.trim());
            if (linhas.length === 0) return [];

            const cabecalho = linhas[0].split(CONFIG.delimitador).map(c => c.trim());
            const mapeamento = opcoes.mapeamento || {};

            const dados = [];
            for (let i = 1; i < linhas.length; i++) {
                const valores = linhas[i].split(CONFIG.delimitador).map(v => v.trim().replace(/^"|"$/g, ''));
                
                const registro = {};
                cabecalho.forEach((campo, index) => {
                    const campoMapeado = mapeamento[campo] || campo;
                    registro[campoMapeado] = valores[index] || null;
                });

                dados.push(registro);
            }

            return dados;
        }

        function parsearJSON(conteudo, opcoes) {
            try {
                return JSON.parse(conteudo);
            } catch (erro) {
                throw new Error('JSON inválido');
            }
        }

        function parsearXML(conteudo, opcoes) {
            // Simular parsing XML
            console.log('Parsing XML...');
            return [];
        }

        function parsearExcel(conteudo, opcoes) {
            // Simular parsing Excel
            console.log('Parsing Excel...');
            return [];
        }

        function validarDadosImportacao(dados, tipo, validacoes = {}) {
            const erros = [];
            const mapeamento = CONFIG.mapeamentos[tipo] || {};

            dados.forEach((registro, index) => {
                // Verificar campos obrigatórios
                Object.keys(mapeamento).forEach(campo => {
                    if (!registro[campo] && registro[campo] !== 0) {
                        erros.push(`Linha ${index + 1}: campo ${campo} é obrigatório`);
                    }
                });

                // Validações customizadas
                if (validacoes[tipo]) {
                    const resultado = validacoes[tipo](registro, index);
                    if (!resultado.valido) {
                        erros.push(...resultado.erros);
                    }
                }
            });

            return {
                valido: erros.length === 0,
                erros
            };
        }

        async function processarLoteImportacao(dados, tipo, opcoes) {
            // Simular processamento
            return new Promise((resolve) => {
                setTimeout(() => {
                    const sucessos = Math.floor(dados.length * 0.95);
                    const erros = dados.length - sucessos;

                    // Atualizar dados locais
                    dados.forEach(registro => {
                        importarRegistro(registro, tipo);
                    });

                    resolve({
                        lote: opcoes.lote,
                        total: dados.length,
                        sucessos,
                        erros
                    });
                }, 1000);
            });
        }

        function importarRegistro(registro, tipo) {
            switch(tipo) {
                case CONFIG.tipos.ALUNOS:
                    if (!MOCK_DATA.alunos) MOCK_DATA.alunos = [];
                    MOCK_DATA.alunos.push({
                        ...registro,
                        id: Date.now(),
                        dataImportacao: new Date().toISOString()
                    });
                    break;
                case CONFIG.tipos.PROFESSORES:
                    if (!MOCK_DATA.professores) MOCK_DATA.professores = [];
                    MOCK_DATA.professores.push({
                        ...registro,
                        id: Date.now(),
                        dataImportacao: new Date().toISOString()
                    });
                    break;
                // ... outros tipos
            }
        }

        // ==================== INTERFACE DO USUÁRIO ====================
        function abrirPainelImportacaoExportacao() {
            const modalHTML = `
                <div class="importacao-exportacao-painel">
                    <div class="painel-tabs">
                        <button class="tab-btn active" onclick="mostrarAbaImportacaoExportacao('exportar')">
                            <i class="fas fa-download"></i> Exportar
                        </button>
                        <button class="tab-btn" onclick="mostrarAbaImportacaoExportacao('importar')">
                            <i class="fas fa-upload"></i> Importar
                        </button>
                        <button class="tab-btn" onclick="mostrarAbaImportacaoExportacao('historico')">
                            <i class="fas fa-history"></i> Histórico
                        </button>
                    </div>
                    
                    <div id="exportar-aba" class="painel-aba active">
                        <h3>Exportar Dados</h3>
                        
                        <div class="form-group">
                            <label>Tipo de Dados</label>
                            <select class="form-control" id="exportar-tipo">
                                ${Object.entries(CONFIG.tipos).map(([key, value]) => `
                                    <option value="${value}">${key}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Formato</label>
                            <select class="form-control" id="exportar-formato">
                                <option value="csv">CSV</option>
                                <option value="json">JSON</option>
                                <option value="xml">XML</option>
                                <option value="excel">Excel</option>
                                <option value="pdf">PDF</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="exportar-lotes" checked>
                                Dividir em lotes de ${CONFIG.lotes} registros
                            </label>
                        </div>
                        
                        <button class="btn btn-primary" onclick="MODULO_IMPORTACAO_EXPORTACAO.exportar()">
                            <i class="fas fa-download"></i> Exportar
                        </button>
                    </div>
                    
                    <div id="importar-aba" class="painel-aba">
                        <h3>Importar Dados</h3>
                        
                        <div class="form-group">
                            <label>Tipo de Dados</label>
                            <select class="form-control" id="importar-tipo">
                                ${Object.entries(CONFIG.tipos).map(([key, value]) => `
                                    <option value="${value}">${key}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Arquivo</label>
                            <input type="file" class="form-control" id="importar-arquivo" 
                                   accept=".csv,.json,.xml,.xlsx">
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="importar-validar" checked>
                                Validar dados antes de importar
                            </label>
                        </div>
                        
                        <button class="btn btn-success" onclick="MODULO_IMPORTACAO_EXPORTACAO.importar()">
                            <i class="fas fa-upload"></i> Importar
                        </button>
                    </div>
                    
                    <div id="historico-aba" class="painel-aba">
                        <h3>Histórico</h3>
                        
                        <div class="historico-tabs">
                            <button class="tab-btn small active" onclick="mostrarHistorico('importacoes')">
                                Importações
                            </button>
                            <button class="tab-btn small" onclick="mostrarHistorico('exportacoes')">
                                Exportações
                            </button>
                        </div>
                        
                        <div id="importacoes-lista" class="historico-lista active">
                            ${importacoes.slice(0, 10).map(i => `
                                <div class="historico-item ${i.status}">
                                    <div class="historico-info">
                                        <strong>${i.tipo}</strong>
                                        <span>${new Date(i.data).toLocaleString()}</span>
                                    </div>
                                    <div class="historico-detalhes">
                                        <span>${i.linhas || 0} linhas</span>
                                        <span class="badge ${i.status}">${i.status}</span>
                                    </div>
                                    ${i.erro ? `<div class="historico-erro">${i.erro}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        
                        <div id="exportacoes-lista" class="historico-lista">
                            ${exportacoes.slice(0, 10).map(e => `
                                <div class="historico-item ${e.status}">
                                    <div class="historico-info">
                                        <strong>${e.tipo} (${e.formato})</strong>
                                        <span>${new Date(e.data).toLocaleString()}</span>
                                    </div>
                                    <div class="historico-detalhes">
                                        <span>${e.linhas || 0} linhas</span>
                                        <span>${e.lotes || 1} lote(s)</span>
                                        <span class="badge ${e.status}">${e.status}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="importacao-stats">
                        <h4>Estatísticas</h4>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">Importações</span>
                                <span class="stat-value">${estatisticas.importacoes}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Exportações</span>
                                <span class="stat-value">${estatisticas.exportacoes}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Linhas Processadas</span>
                                <span class="stat-value">${estatisticas.linhasProcessadas}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Erros</span>
                                <span class="stat-value text-danger">${estatisticas.erros}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Adicionar estilos
            adicionarEstilosImportacaoExportacao();

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Importação/Exportação', modalHTML);
            }
        }

        function adicionarEstilosImportacaoExportacao() {
            if (document.getElementById('style-importacao-exportacao')) return;

            const style = document.createElement('style');
            style.id = 'style-importacao-exportacao';
            style.textContent = `
                .importacao-exportacao-painel {
                    max-height: 600px;
                    overflow-y: auto;
                }
                
                .painel-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                
                .painel-aba {
                    display: none;
                }
                
                .painel-aba.active {
                    display: block;
                }
                
                .historico-tabs {
                    display: flex;
                    gap: 5px;
                    margin-bottom: 10px;
                }
                
                .tab-btn.small {
                    padding: 5px 10px;
                    font-size: 0.9rem;
                }
                
                .historico-lista {
                    display: none;
                    max-height: 300px;
                    overflow-y: auto;
                }
                
                .historico-lista.active {
                    display: block;
                }
                
                .historico-item {
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                    padding: 10px;
                    margin-bottom: 5px;
                }
                
                .historico-item.sucesso {
                    border-left: 4px solid #27ae60;
                }
                
                .historico-item.erro {
                    border-left: 4px solid #e74c3c;
                }
                
                .historico-item.concluido {
                    border-left: 4px solid #27ae60;
                }
                
                .historico-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                
                .historico-detalhes {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                
                .historico-erro {
                    margin-top: 5px;
                    padding: 5px;
                    background: #f8d7da;
                    color: #721c24;
                    border-radius: 4px;
                    font-size: 0.9rem;
                }
                
                .badge.sucesso, .badge.concluido {
                    background: #27ae60;
                    color: white;
                }
                
                .badge.erro {
                    background: #e74c3c;
                    color: white;
                }
                
                .importacao-stats {
                    margin-top: 30px;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin-top: 15px;
                }
            `;

            document.head.appendChild(style);
        }

        function exportar() {
            const tipo = document.getElementById('exportar-tipo')?.value;
            const formato = document.getElementById('exportar-formato')?.value;
            const lotes = document.getElementById('exportar-lotes')?.checked;

            exportarDados(tipo, formato, { lotes })
                .then(() => {
                    if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                        MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                            'Exportação concluída',
                            `Dados de ${tipo} exportados com sucesso`
                        );
                    }
                })
                .catch(erro => {
                    if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                        MODULO_NOTIFICACOES.adicionarNotificacaoErro(
                            'Erro na exportação',
                            erro.message
                        );
                    }
                });
        }

        function importar() {
            const tipo = document.getElementById('importar-tipo')?.value;
            const arquivo = document.getElementById('importar-arquivo')?.files[0];
            const validar = document.getElementById('importar-validar')?.checked;

            if (!arquivo) {
                alert('Selecione um arquivo');
                return;
            }

            importarDados(arquivo, tipo, { validar })
                .then(() => {
                    if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                        MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                            'Importação concluída',
                            `Dados de ${tipo} importados com sucesso`
                        );
                    }
                })
                .catch(erro => {
                    if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                        MODULO_NOTIFICACOES.adicionarNotificacaoErro(
                            'Erro na importação',
                            erro.message
                        );
                    }
                });
        }

        // ==================== UTILITÁRIOS ====================
        function gerarId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        function salvarHistorico() {
            try {
                localStorage.setItem('sme_importacao_exportacao', JSON.stringify({
                    importacoes,
                    exportacoes,
                    estatisticas
                }));
            } catch (e) {
                console.error('Erro ao salvar histórico:', e);
            }
        }

        function carregarHistorico() {
            try {
                const saved = localStorage.getItem('sme_importacao_exportacao');
                if (saved) {
                    const { importacoes: imp, exportacoes: exp, estatisticas: est } = JSON.parse(saved);
                    importacoes = imp || [];
                    exportacoes = exp || [];
                    estatisticas = est || estatisticas;
                }
            } catch (e) {
                console.error('Erro ao carregar histórico:', e);
            }
        }

        function configurarProcessamento() {
            // Configurar fila de processamento
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            exportarDados,
            importarDados,
            abrirPainelImportacaoExportacao,
            exportar,
            importar,
            getHistorico: () => ({
                importacoes: [...importacoes],
                exportacoes: [...exportacoes]
            }),
            getEstatisticas: () => ({ ...estatisticas })
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_IMPORTACAO_EXPORTACAO.init();
        }, 9000);
    });

    window.MODULO_IMPORTACAO_EXPORTACAO = MODULO_IMPORTACAO_EXPORTACAO;
    console.log('✅ Módulo de Importação/Exportação em Lote carregado');
}
// modulos/exportacao.js - Sistema de Exportação de Relatórios
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

if (typeof MODULO_EXPORTACAO === 'undefined') {
    const MODULO_EXPORTACAO = (function() {
        'use strict';

        // ==================== CONFIGURAÇÃO ====================
        const CONFIG = {
            formatos: ['pdf', 'excel', 'csv', 'html'],
            maxLinhas: 10000,
            maxTamanho: 50 * 1024 * 1024, // 50MB
            templates: {
                cabecalho: 'Sistema de Gestão Educacional Municipal - Relatório Gerado em: '
            }
        };

        // ==================== DEPENDÊNCIAS ====================
        function carregarDependencias() {
            return new Promise((resolve) => {
                const scripts = [
                    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
                    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js',
                    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
                    'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js'
                ];

                let carregados = 0;
                
                scripts.forEach(src => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.onload = () => {
                        carregados++;
                        if (carregados === scripts.length) {
                            console.log('✅ Dependências de exportação carregadas');
                            resolve();
                        }
                    };
                    document.head.appendChild(script);
                });
            });
        }

        // ==================== EXPORTAÇÃO PARA PDF ====================
        async function exportarParaPDF(dados, opcoes = {}) {
            try {
                if (typeof jspdf === 'undefined') {
                    await carregarDependencias();
                }

                const { jsPDF } = window.jspdf;
                const doc = new jsPDF({
                    orientation: opcoes.orientacao || 'portrait',
                    unit: 'mm',
                    format: opcoes.formato || 'a4'
                });

                // Configurar fonte
                doc.setFont('helvetica');
                
                // Título
                doc.setFontSize(16);
                doc.setTextColor(44, 62, 80);
                doc.text(opcoes.titulo || 'Relatório', 14, 20);
                
                // Subtítulo
                doc.setFontSize(10);
                doc.setTextColor(127, 140, 141);
                doc.text(`${CONFIG.templates.cabecalho} ${new Date().toLocaleString('pt-BR')}`, 14, 28);
                
                // Cabeçalho da tabela
                const headers = opcoes.colunas || Object.keys(dados[0] || {});
                const rows = dados.map(item => 
                    headers.map(h => item[h]?.toString() || '')
                );

                // Gerar tabela
                doc.autoTable({
                    head: [headers],
                    body: rows,
                    startY: 35,
                    theme: 'grid',
                    styles: {
                        fontSize: 8,
                        cellPadding: 2,
                        halign: 'left'
                    },
                    headStyles: {
                        fillColor: [52, 73, 94],
                        textColor: [255, 255, 255],
                        fontStyle: 'bold'
                    },
                    alternateRowStyles: {
                        fillColor: [245, 245, 245]
                    },
                    margin: { top: 35 }
                });

                // Adicionar rodapé
                const pageCount = doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.setFontSize(8);
                    doc.setTextColor(150, 150, 150);
                    doc.text(
                        `Página ${i} de ${pageCount} - Gerado por ${opcoes.usuario || 'Sistema'}`,
                        doc.internal.pageSize.width - 20,
                        doc.internal.pageSize.height - 10,
                        { align: 'right' }
                    );
                }

                // Salvar arquivo
                const nomeArquivo = `${opcoes.nomeArquivo || 'relatorio'}_${new Date().toISOString().split('T')[0]}.pdf`;
                doc.save(nomeArquivo);

                return {
                    sucesso: true,
                    arquivo: nomeArquivo
                };

            } catch (erro) {
                console.error('Erro ao exportar PDF:', erro);
                return {
                    sucesso: false,
                    erro: erro.message
                };
            }
        }

        // ==================== EXPORTAÇÃO PARA EXCEL ====================
        async function exportarParaExcel(dados, opcoes = {}) {
            try {
                if (typeof XLSX === 'undefined') {
                    await carregarDependencias();
                }

                // Preparar dados
                const worksheet = XLSX.utils.json_to_sheet(dados, {
                    header: opcoes.colunas || Object.keys(dados[0] || {})
                });

                // Ajustar largura das colunas
                const colWidths = [];
                const headers = opcoes.colunas || Object.keys(dados[0] || {});
                
                headers.forEach(header => {
                    let maxLength = header.length;
                    dados.forEach(item => {
                        const valor = item[header]?.toString() || '';
                        maxLength = Math.max(maxLength, valor.length);
                    });
                    colWidths.push({ wch: Math.min(maxLength + 2, 50) });
                });
                
                worksheet['!cols'] = colWidths;

                // Criar workbook
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, opcoes.aba || 'Dados');

                // Adicionar propriedades do documento
                workbook.Props = {
                    Title: opcoes.titulo || 'Relatório',
                    Subject: 'Dados do Sistema',
                    Author: opcoes.usuario || 'Sistema',
                    CreatedDate: new Date()
                };

                // Salvar arquivo
                const nomeArquivo = `${opcoes.nomeArquivo || 'relatorio'}_${new Date().toISOString().split('T')[0]}.xlsx`;
                XLSX.writeFile(workbook, nomeArquivo);

                return {
                    sucesso: true,
                    arquivo: nomeArquivo
                };

            } catch (erro) {
                console.error('Erro ao exportar Excel:', erro);
                return {
                    sucesso: false,
                    erro: erro.message
                };
            }
        }

        // ==================== EXPORTAÇÃO PARA CSV ====================
        function exportarParaCSV(dados, opcoes = {}) {
            try {
                const headers = opcoes.colunas || Object.keys(dados[0] || {});
                
                // Criar linhas CSV
                const linhas = [
                    headers.join(opcoes.delimitador || ';'),
                    ...dados.map(item => 
                        headers.map(h => {
                            let valor = item[h]?.toString() || '';
                            // Escapar aspas e delimitadores
                            if (valor.includes('"') || valor.includes(';') || valor.includes(',')) {
                                valor = `"${valor.replace(/"/g, '""')}"`;
                            }
                            return valor;
                        }).join(opcoes.delimitador || ';')
                    )
                ];

                // Adicionar metadados como comentário
                const metadados = [
                    `# ${CONFIG.templates.cabecalho} ${new Date().toLocaleString('pt-BR')}`,
                    `# Gerado por: ${opcoes.usuario || 'Sistema'}`,
                    `# Total de registros: ${dados.length}`,
                    ''
                ];

                const conteudo = metadados.concat(linhas).join('\n');

                // Criar blob e download
                const blob = new Blob(['\uFEFF' + conteudo], { 
                    type: 'text/csv;charset=utf-8;' 
                });
                
                const nomeArquivo = `${opcoes.nomeArquivo || 'relatorio'}_${new Date().toISOString().split('T')[0]}.csv`;
                
                if (typeof saveAs !== 'undefined') {
                    saveAs(blob, nomeArquivo);
                } else {
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = nomeArquivo;
                    link.click();
                    URL.revokeObjectURL(link.href);
                }

                return {
                    sucesso: true,
                    arquivo: nomeArquivo
                };

            } catch (erro) {
                console.error('Erro ao exportar CSV:', erro);
                return {
                    sucesso: false,
                    erro: erro.message
                };
            }
        }

        // ==================== EXPORTAÇÃO PARA HTML ====================
        function exportarParaHTML(dados, opcoes = {}) {
            try {
                const headers = opcoes.colunas || Object.keys(dados[0] || {});
                
                // Gerar tabela HTML
                const tabela = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>${opcoes.titulo || 'Relatório'}</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            h1 { color: #2c3e50; }
                            .header { color: #7f8c8d; font-size: 0.9em; margin-bottom: 20px; }
                            table { border-collapse: collapse; width: 100%; }
                            th { background: #2c3e50; color: white; padding: 10px; }
                            td { padding: 8px; border: 1px solid #ddd; }
                            tr:nth-child(even) { background: #f9f9f9; }
                            .footer { margin-top: 20px; color: #95a5a6; font-size: 0.8em; }
                        </style>
                    </head>
                    <body>
                        <h1>${opcoes.titulo || 'Relatório'}</h1>
                        <div class="header">
                            ${CONFIG.templates.cabecalho} ${new Date().toLocaleString('pt-BR')}<br>
                            Gerado por: ${opcoes.usuario || 'Sistema'}<br>
                            Total de registros: ${dados.length}
                        </div>
                        
                        <table>
                            <thead>
                                <tr>
                                    ${headers.map(h => `<th>${h}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${dados.map(item => `
                                    <tr>
                                        ${headers.map(h => `<td>${item[h] || ''}</td>`).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        
                        <div class="footer">
                            Documento gerado automaticamente pelo Sistema de Gestão Educacional Municipal
                        </div>
                    </body>
                    </html>
                `;

                // Criar blob e download
                const blob = new Blob([tabela], { type: 'text/html;charset=utf-8;' });
                
                const nomeArquivo = `${opcoes.nomeArquivo || 'relatorio'}_${new Date().toISOString().split('T')[0]}.html`;
                
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = nomeArquivo;
                link.click();
                URL.revokeObjectURL(link.href);

                return {
                    sucesso: true,
                    arquivo: nomeArquivo
                };

            } catch (erro) {
                console.error('Erro ao exportar HTML:', erro);
                return {
                    sucesso: false,
                    erro: erro.message
                };
            }
        }

        // ==================== EXPORTAÇÃO DE RELATÓRIOS ESPECÍFICOS ====================
        function exportarRelatorioAlunos(formato = 'pdf', opcoes = {}) {
            const dados = (MOCK_DATA.alunos || []).map(aluno => ({
                'Nome': aluno.nome,
                'Matrícula': aluno.matricula,
                'Turma': aluno.turma,
                'Média': aluno.mediaGeral,
                'Faltas': aluno.faltas,
                'Responsável': aluno.responsavel,
                'Telefone': aluno.telefone,
                'Status': aluno.status
            }));

            return exportarDados(dados, {
                formato,
                titulo: 'Relatório de Alunos',
                nomeArquivo: 'alunos',
                colunas: ['Nome', 'Matrícula', 'Turma', 'Média', 'Faltas', 'Responsável', 'Telefone', 'Status'],
                ...opcoes
            });
        }

        function exportarRelatorioProfessores(formato = 'pdf', opcoes = {}) {
            const dados = (MOCK_DATA.professores || []).map(prof => ({
                'Nome': prof.nome,
                'Email': prof.email,
                'Disciplina': prof.disciplina,
                'Formação': prof.formacao,
                'Escola ID': prof.escolaId,
                'Status': prof.status
            }));

            return exportarDados(dados, {
                formato,
                titulo: 'Relatório de Professores',
                nomeArquivo: 'professores',
                colunas: ['Nome', 'Email', 'Disciplina', 'Formação', 'Escola ID', 'Status'],
                ...opcoes
            });
        }

        function exportarRelatorioEscolas(formato = 'pdf', opcoes = {}) {
            const dados = (MOCK_DATA.escolas || []).map(escola => ({
                'Nome': escola.nome,
                'Endereço': escola.endereco,
                'Telefone': escola.telefone,
                'Diretor': escola.diretor,
                'Alunos': escola.totalAlunos,
                'Professores': escola.totalProfessores,
                'Turmas': escola.totalTurmas,
                'Status': escola.status
            }));

            return exportarDados(dados, {
                formato,
                titulo: 'Relatório de Escolas',
                nomeArquivo: 'escolas',
                colunas: ['Nome', 'Endereço', 'Telefone', 'Diretor', 'Alunos', 'Professores', 'Turmas', 'Status'],
                ...opcoes
            });
        }

        function exportarRelatorioDesempenho(formato = 'pdf', opcoes = {}) {
            const alunos = MOCK_DATA.alunos || [];
            const notas = MOCK_DATA.notas || [];

            const dados = alunos.map(aluno => {
                const notasAluno = notas.filter(n => n.alunoId === aluno.id);
                const mediaGeral = notasAluno.length > 0
                    ? (notasAluno.reduce((acc, n) => acc + n.media, 0) / notasAluno.length).toFixed(2)
                    : 'N/A';

                return {
                    'Aluno': aluno.nome,
                    'Turma': aluno.turma,
                    'Disciplinas': notasAluno.length,
                    'Média Geral': mediaGeral,
                    'Aprovado': mediaGeral >= 7 ? 'Sim' : 'Não'
                };
            });

            return exportarDados(dados, {
                formato,
                titulo: 'Relatório de Desempenho',
                nomeArquivo: 'desempenho',
                colunas: ['Aluno', 'Turma', 'Disciplinas', 'Média Geral', 'Aprovado'],
                ...opcoes
            });
        }

        function exportarRelatorioFrequencia(formato = 'pdf', opcoes = {}) {
            const alunos = MOCK_DATA.alunos || [];
            const frequencias = MOCK_DATA.frequencias || [];

            const dados = alunos.map(aluno => {
                const freqAluno = frequencias.filter(f => f.alunoId === aluno.id);
                const totalPresencas = freqAluno.reduce((acc, f) => acc + f.presencas, 0);
                const totalAulas = freqAluno.reduce((acc, f) => acc + f.totalAulas, 0);
                const percentual = totalAulas > 0 ? ((totalPresencas / totalAulas) * 100).toFixed(1) : 0;

                return {
                    'Aluno': aluno.nome,
                    'Turma': aluno.turma,
                    'Presenças': totalPresencas,
                    'Faltas': aluno.faltas,
                    'Total Aulas': totalAulas,
                    'Frequência': `${percentual}%`,
                    'Status': percentual >= 75 ? 'Regular' : 'Crítico'
                };
            });

            return exportarDados(dados, {
                formato,
                titulo: 'Relatório de Frequência',
                nomeArquivo: 'frequencia',
                colunas: ['Aluno', 'Turma', 'Presenças', 'Faltas', 'Total Aulas', 'Frequência', 'Status'],
                ...opcoes
            });
        }

        // ==================== FUNÇÃO GENÉRICA DE EXPORTAÇÃO ====================
        async function exportarDados(dados, opcoes = {}) {
            if (!dados || dados.length === 0) {
                if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                    MODULO_NOTIFICACOES.adicionarNotificacaoAviso(
                        'Exportação',
                        'Não há dados para exportar'
                    );
                }
                return {
                    sucesso: false,
                    erro: 'Dados vazios'
                };
            }

            if (dados.length > CONFIG.maxLinhas) {
                if (!confirm(`Muitos registros (${dados.length}). Deseja exportar apenas os primeiros ${CONFIG.maxLinhas}?`)) {
                    return {
                        sucesso: false,
                        erro: 'Exportação cancelada pelo usuário'
                    };
                }
                dados = dados.slice(0, CONFIG.maxLinhas);
            }

            const formato = opcoes.formato || 'pdf';
            let resultado;

            switch (formato.toLowerCase()) {
                case 'pdf':
                    resultado = await exportarParaPDF(dados, opcoes);
                    break;
                case 'excel':
                case 'xlsx':
                    resultado = await exportarParaExcel(dados, opcoes);
                    break;
                case 'csv':
                    resultado = exportarParaCSV(dados, opcoes);
                    break;
                case 'html':
                    resultado = exportarParaHTML(dados, opcoes);
                    break;
                default:
                    resultado = {
                        sucesso: false,
                        erro: `Formato não suportado: ${formato}`
                    };
            }

            if (resultado.sucesso && typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoSucesso(
                    'Exportação Concluída',
                    `Arquivo ${resultado.arquivo} gerado com sucesso`
                );
            } else if (!resultado.sucesso && typeof MODULO_NOTIFICACOES !== 'undefined') {
                MODULO_NOTIFICACOES.adicionarNotificacaoErro(
                    'Erro na Exportação',
                    resultado.erro || 'Erro desconhecido'
                );
            }

            return resultado;
        }

        // ==================== INTERFACE DO USUÁRIO ====================
        function criarModalExportacao(titulo, dados, opcoes = {}) {
            const usuario = SISTEMA.getEstado().usuario;
            
            const modalHTML = `
                <div class="exportacao-modal">
                    <h3>Exportar ${titulo}</h3>
                    
                    <div class="form-group">
                        <label>Formato do Arquivo</label>
                        <select id="export-format" class="form-control">
                            <option value="pdf">PDF</option>
                            <option value="excel">Excel</option>
                            <option value="csv">CSV</option>
                            <option value="html">HTML</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Nome do Arquivo</label>
                        <input type="text" id="export-filename" class="form-control" 
                               value="${opcoes.nomeArquivo || 'relatorio'}" placeholder="Nome do arquivo">
                    </div>
                    
                    <div class="form-group">
                        <label>Colunas a exportar</label>
                        <div class="colunas-selector">
                            ${(opcoes.colunas || Object.keys(dados[0] || {})).map(col => `
                                <label class="checkbox-label">
                                    <input type="checkbox" class="export-coluna" value="${col}" checked>
                                    ${col}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="export-info">
                        <i class="fas fa-info-circle"></i>
                        <span>${dados.length} registros serão exportados</span>
                    </div>
                    
                    <div class="export-actions">
                        <button class="btn btn-secondary" onclick="MODULO_EXPORTACAO.fecharModalExportacao()">
                            Cancelar
                        </button>
                        <button class="btn btn-primary" onclick="MODULO_EXPORTACAO.confirmarExportacao('${titulo}', ${JSON.stringify(dados).replace(/"/g, '&quot;')})">
                            <i class="fas fa-download"></i> Exportar
                        </button>
                    </div>
                </div>
            `;

            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.abrirModal('Exportar Relatório', modalHTML);
            }
        }

        function fecharModalExportacao() {
            if (typeof SISTEMA !== 'undefined') {
                SISTEMA.fecharModal();
            }
        }

        async function confirmarExportacao(titulo, dados) {
            const formato = document.getElementById('export-format')?.value;
            const nomeArquivo = document.getElementById('export-filename')?.value;
            
            // Filtrar colunas selecionadas
            const colunasSelecionadas = Array.from(document.querySelectorAll('.export-coluna:checked'))
                .map(cb => cb.value);
            
            if (colunasSelecionadas.length === 0) {
                if (typeof MODULO_NOTIFICACOES !== 'undefined') {
                    MODULO_NOTIFICACOES.adicionarNotificacaoAviso(
                        'Exportação',
                        'Selecione pelo menos uma coluna'
                    );
                }
                return;
            }

            // Filtrar dados pelas colunas selecionadas
            const dadosFiltrados = dados.map(item => {
                const novoItem = {};
                colunasSelecionadas.forEach(col => {
                    novoItem[col] = item[col];
                });
                return novoItem;
            });

            const resultado = await exportarDados(dadosFiltrados, {
                formato,
                nomeArquivo,
                titulo,
                colunas: colunasSelecionadas
            });

            if (resultado.sucesso) {
                fecharModalExportacao();
            }
        }

        // ==================== INICIALIZAÇÃO ====================
        function init() {
            console.log('📄 Sistema de Exportação inicializado');
            
            // Pré-carregar dependências em background
            setTimeout(() => {
                carregarDependencias().catch(console.error);
            }, 3000);
        }

        // ==================== API PÚBLICA ====================
        return {
            init,
            exportarDados,
            exportarParaPDF,
            exportarParaExcel,
            exportarParaCSV,
            exportarParaHTML,
            exportarRelatorioAlunos,
            exportarRelatorioProfessores,
            exportarRelatorioEscolas,
            exportarRelatorioDesempenho,
            exportarRelatorioFrequencia,
            criarModalExportacao,
            confirmarExportacao,
            fecharModalExportacao
        };
    })();

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            MODULO_EXPORTACAO.init();
        }, 2500);
    });

    window.MODULO_EXPORTACAO = MODULO_EXPORTACAO;
    console.log('✅ Módulo de Exportação carregado');
}
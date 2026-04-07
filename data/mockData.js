// dados/mockData.js - Todos os dados do sistema
// Sistema de Gestão Educacional Municipal - VERSÃO 4.0

const MOCK_DATA = {
    // ========== USUÁRIOS ==========
    usuarios: [
        {
            id: 1,
            nome: 'Administrador SME',
            email: 'admin@sme.gov.br',
            senha: 'admin123',
            perfil: 'secretaria',
            escolaId: null,
            telefone: '(11) 99999-8888',
            avatar: 'https://i.pravatar.cc/150?img=1',
            dataCadastro: '2020-01-10',
            ultimoAcesso: '2023-11-19 08:30'
        },
        {
            id: 2,
            nome: 'Maria Silva',
            email: 'diretor@escola.gov.br',
            senha: 'diretor123',
            perfil: 'diretor',
            escolaId: 1,
            telefone: '(11) 98888-7777',
            avatar: 'https://i.pravatar.cc/150?img=5',
            dataCadastro: '2021-03-15',
            ultimoAcesso: '2023-11-19 07:45'
        },
        {
            id: 3,
            nome: 'Carlos Santos',
            email: 'carlos.santos@escola.gov.br',
            senha: 'professor123',
            perfil: 'professor',
            escolaId: 1,
            telefone: '(11) 97777-6666',
            avatar: 'https://i.pravatar.cc/150?img=8',
            dataCadastro: '2022-02-20',
            ultimoAcesso: '2023-11-19 07:30'
        },
        {
            id: 4,
            nome: 'Ana Oliveira',
            email: 'ana.oliveira@escola.gov.br',
            senha: 'aluno123',
            perfil: 'aluno',
            escolaId: 1,
            telefone: '(11) 96666-5555',
            avatar: 'https://i.pravatar.cc/150?img=12',
            dataCadastro: '2023-01-15',
            ultimoAcesso: '2023-11-18 14:20'
        },
        {
            id: 5,
            nome: 'Júlio Silva',
            email: 'julio12@gmail.com',
            senha: 'senha123',
            perfil: 'professor',
            escolaId: 2,
            telefone: '(11) 95555-4444',
            avatar: 'https://i.pravatar.cc/150?img=15',
            dataCadastro: '2022-08-10',
            ultimoAcesso: '2023-11-19 07:15'
        }
    ],

    // ========== ESCOLAS ==========
    escolas: [
        {
            id: 1,
            nome: 'EMEF Professora Maria da Silva',
            endereco: 'Rua das Flores, 123',
            bairro: 'Centro',
            cidade: 'São Paulo',
            cep: '01001-000',
            telefone: '(11) 3333-4444',
            email: 'contato@emefmaria.edu.br',
            diretor: 'Maria Silva',
            viceDiretor: 'João Pedro',
            totalAlunos: 850,
            totalProfessores: 45,
            totalFuncionarios: 32,
            totalTurmas: 25,
            status: 'ativa',
            inauguracao: '2020-03-15',
            ultimaAtualizacao: '2023-11-01'
        },
        {
            id: 2,
            nome: 'EMEF João Paulo II',
            endereco: 'Av. Paulista, 1000',
            bairro: 'Bela Vista',
            cidade: 'São Paulo',
            cep: '01310-000',
            telefone: '(11) 5555-6666',
            email: 'contato@emefjoao.edu.br',
            diretor: 'João Carlos',
            viceDiretor: 'Ana Paula',
            totalAlunos: 1200,
            totalProfessores: 65,
            totalFuncionarios: 48,
            totalTurmas: 32,
            status: 'ativa',
            inauguracao: '2018-08-22',
            ultimaAtualizacao: '2023-11-05'
        }
    ],

    // ========== PROFESSORES ==========
    professores: [
        {
            id: 1,
            nome: 'Carlos Santos',
            email: 'carlos.santos@escola.gov.br',
            telefone: '(11) 97777-6666',
            celular: '(11) 98888-7777',
            dataNascimento: '1980-05-15',
            cpf: '123.456.789-00',
            rg: '12.345.678-9',
            disciplina: 'Matemática',
            escolaId: 1,
            formacao: 'Mestrado em Matemática',
            instituicao: 'USP',
            anoConclusao: 2010,
            status: 'ativo',
            dataAdmissao: '2015-02-10',
            turmas: [101, 102],
            totalAlunos: 58,
            cargaHoraria: '40h',
            especializacoes: ['Geometria', 'Álgebra'],
            observacoes: 'Coordenador de Matemática'
        },
        {
            id: 2,
            nome: 'Júlio Silva',
            email: 'julio12@gmail.com',
            telefone: '(11) 95555-4444',
            celular: '(11) 96666-5555',
            dataNascimento: '1975-08-20',
            cpf: '987.654.321-00',
            rg: '98.765.432-1',
            disciplina: 'Português',
            escolaId: 2,
            formacao: 'Doutorado em Letras',
            instituicao: 'UNICAMP',
            anoConclusao: 2008,
            status: 'ativo',
            dataAdmissao: '2012-03-15',
            turmas: [201, 202],
            totalAlunos: 61,
            cargaHoraria: '40h',
            especializacoes: ['Literatura', 'Gramática'],
            observacoes: 'Coordenador de Português'
        },
        {
            id: 3,
            nome: 'Ana Paula Costa',
            email: 'ana.costa@escola.gov.br',
            telefone: '(11) 93333-2222',
            celular: '(11) 94444-3333',
            dataNascimento: '1985-11-30',
            cpf: '456.789.123-00',
            rg: '45.678.912-3',
            disciplina: 'Ciências',
            escolaId: 1,
            formacao: 'Mestrado em Biologia',
            instituicao: 'UNIFESP',
            anoConclusao: 2012,
            status: 'ativo',
            dataAdmissao: '2016-07-20',
            turmas: [103],
            totalAlunos: 30,
            cargaHoraria: '20h',
            especializacoes: ['Biologia', 'Química'],
            observacoes: 'Responsável pelo laboratório'
        },
        {
            id: 4,
            nome: 'Roberto Lima',
            email: 'roberto.lima@escola.gov.br',
            telefone: '(11) 92222-1111',
            celular: '(11) 93333-2222',
            dataNascimento: '1982-03-10',
            cpf: '789.123.456-00',
            rg: '78.912.345-6',
            disciplina: 'História',
            escolaId: 1,
            formacao: 'Especialização em História',
            instituicao: 'PUC-SP',
            anoConclusao: 2015,
            status: 'ativo',
            dataAdmissao: '2017-09-05',
            turmas: [104],
            totalAlunos: 28,
            cargaHoraria: '20h',
            especializacoes: ['História do Brasil', 'História Geral'],
            observacoes: ''
        },
        {
            id: 5,
            nome: 'Fernanda Santos',
            email: 'fernanda.santos@escola.gov.br',
            telefone: '(11) 91111-2222',
            celular: '(11) 92222-3333',
            dataNascimento: '1988-07-25',
            cpf: '321.654.987-00',
            rg: '32.165.498-7',
            disciplina: 'Geografia',
            escolaId: 2,
            formacao: 'Mestrado em Geografia',
            instituicao: 'USP',
            anoConclusao: 2014,
            status: 'ativo',
            dataAdmissao: '2018-02-10',
            turmas: [203, 204],
            totalAlunos: 55,
            cargaHoraria: '40h',
            especializacoes: ['Geopolítica', 'Meio Ambiente'],
            observacoes: ''
        }
    ],

    // ========== ALUNOS ==========
    alunos: [
        {
            id: 1,
            nome: 'João Silva',
            email: 'joao.silva@aluno.edu.br',
            matricula: '20230001',
            dataNascimento: '2012-05-15',
            cpf: '111.222.333-44',
            rg: '11.222.333-4',
            turma: '5ºA',
            turmaId: 101,
            escolaId: 1,
            endereco: 'Rua A, 100',
            bairro: 'Centro',
            cidade: 'São Paulo',
            cep: '01002-000',
            telefone: '(11) 91111-2222',
            responsavel: 'Maria Silva',
            responsavelTelefone: '(11) 92222-3333',
            responsavelEmail: 'maria.silva@gmail.com',
            dataMatricula: '2023-01-15',
            status: 'ativo',
            mediaGeral: 8.5,
            faltas: 2,
            observacoes: ''
        },
        {
            id: 2,
            nome: 'Pedro Santos',
            email: 'pedro.santos@aluno.edu.br',
            matricula: '20230002',
            dataNascimento: '2012-08-20',
            cpf: '222.333.444-55',
            rg: '22.333.444-5',
            turma: '5ºA',
            turmaId: 101,
            escolaId: 1,
            endereco: 'Rua B, 200',
            bairro: 'Centro',
            cidade: 'São Paulo',
            cep: '01003-000',
            telefone: '(11) 92222-3333',
            responsavel: 'Carlos Santos',
            responsavelTelefone: '(11) 93333-4444',
            responsavelEmail: 'carlos.santos@gmail.com',
            dataMatricula: '2023-01-15',
            status: 'ativo',
            mediaGeral: 9.2,
            faltas: 0,
            observacoes: 'Aluno destaque'
        },
        {
            id: 3,
            nome: 'Ana Oliveira',
            email: 'ana.oliveira@escola.gov.br',
            matricula: '20230003',
            dataNascimento: '2011-11-30',
            cpf: '333.444.555-66',
            rg: '33.444.555-6',
            turma: '6ºB',
            turmaId: 202,
            escolaId: 2,
            endereco: 'Rua C, 300',
            bairro: 'Bela Vista',
            cidade: 'São Paulo',
            cep: '01320-000',
            telefone: '(11) 93333-4444',
            responsavel: 'José Oliveira',
            responsavelTelefone: '(11) 94444-5555',
            responsavelEmail: 'jose.oliveira@gmail.com',
            dataMatricula: '2023-01-20',
            status: 'ativo',
            mediaGeral: 7.8,
            faltas: 4,
            observacoes: 'Acompanhamento pedagógico'
        },
        {
            id: 4,
            nome: 'Mariana Souza',
            email: 'mariana.souza@aluno.edu.br',
            matricula: '20230004',
            dataNascimento: '2012-03-10',
            cpf: '444.555.666-77',
            rg: '44.555.666-7',
            turma: '5ºA',
            turmaId: 101,
            escolaId: 1,
            endereco: 'Rua D, 400',
            bairro: 'Centro',
            cidade: 'São Paulo',
            cep: '01004-000',
            telefone: '(11) 94444-5555',
            responsavel: 'Paulo Souza',
            responsavelTelefone: '(11) 95555-6666',
            responsavelEmail: 'paulo.souza@gmail.com',
            dataMatricula: '2023-01-15',
            status: 'ativo',
            mediaGeral: 8.9,
            faltas: 1,
            observacoes: ''
        },
        {
            id: 5,
            nome: 'Lucas Ferreira',
            email: 'lucas.ferreira@aluno.edu.br',
            matricula: '20230005',
            dataNascimento: '2012-07-12',
            cpf: '555.666.777-88',
            rg: '55.666.777-8',
            turma: '5ºB',
            turmaId: 102,
            escolaId: 1,
            endereco: 'Rua E, 500',
            bairro: 'Centro',
            cidade: 'São Paulo',
            cep: '01005-000',
            telefone: '(11) 95555-6666',
            responsavel: 'Fernanda Ferreira',
            responsavelTelefone: '(11) 96666-7777',
            responsavelEmail: 'fernanda.ferreira@gmail.com',
            dataMatricula: '2023-01-18',
            status: 'ativo',
            mediaGeral: 7.5,
            faltas: 3,
            observacoes: ''
        },
        {
            id: 6,
            nome: 'Beatriz Lima',
            email: 'beatriz.lima@aluno.edu.br',
            matricula: '20230006',
            dataNascimento: '2011-09-05',
            cpf: '666.777.888-99',
            rg: '66.777.888-9',
            turma: '6ºA',
            turmaId: 201,
            escolaId: 2,
            endereco: 'Rua F, 600',
            bairro: 'Bela Vista',
            cidade: 'São Paulo',
            cep: '01321-000',
            telefone: '(11) 96666-7777',
            responsavel: 'Roberto Lima',
            responsavelTelefone: '(11) 97777-8888',
            responsavelEmail: 'roberto.lima@gmail.com',
            dataMatricula: '2023-01-20',
            status: 'ativo',
            mediaGeral: 8.2,
            faltas: 2,
            observacoes: ''
        }
    ],

    // ========== TURMAS ==========
    turmas: [
        {
            id: 101,
            nome: '5ºA',
            escolaId: 1,
            professorId: 1,
            totalAlunos: 30,
            periodo: 'matutino',
            sala: '101',
            ano: 2023,
            turno: 'Manhã',
            horarioInicio: '07:30',
            horarioFim: '12:00'
        },
        {
            id: 102,
            nome: '5ºB',
            escolaId: 1,
            professorId: 1,
            totalAlunos: 28,
            periodo: 'matutino',
            sala: '102',
            ano: 2023,
            turno: 'Manhã',
            horarioInicio: '07:30',
            horarioFim: '12:00'
        },
        {
            id: 103,
            nome: '6ºA',
            escolaId: 1,
            professorId: 3,
            totalAlunos: 30,
            periodo: 'vespertino',
            sala: '103',
            ano: 2023,
            turno: 'Tarde',
            horarioInicio: '13:00',
            horarioFim: '17:30'
        },
        {
            id: 104,
            nome: '6ºB',
            escolaId: 1,
            professorId: 4,
            totalAlunos: 28,
            periodo: 'vespertino',
            sala: '104',
            ano: 2023,
            turno: 'Tarde',
            horarioInicio: '13:00',
            horarioFim: '17:30'
        },
        {
            id: 201,
            nome: '6ºA',
            escolaId: 2,
            professorId: 2,
            totalAlunos: 32,
            periodo: 'vespertino',
            sala: '201',
            ano: 2023,
            turno: 'Tarde',
            horarioInicio: '13:00',
            horarioFim: '17:30'
        },
        {
            id: 202,
            nome: '6ºB',
            escolaId: 2,
            professorId: 2,
            totalAlunos: 29,
            periodo: 'vespertino',
            sala: '202',
            ano: 2023,
            turno: 'Tarde',
            horarioInicio: '13:00',
            horarioFim: '17:30'
        },
        {
            id: 203,
            nome: '7ºA',
            escolaId: 2,
            professorId: 5,
            totalAlunos: 28,
            periodo: 'matutino',
            sala: '203',
            ano: 2023,
            turno: 'Manhã',
            horarioInicio: '07:30',
            horarioFim: '12:00'
        },
        {
            id: 204,
            nome: '7ºB',
            escolaId: 2,
            professorId: 5,
            totalAlunos: 27,
            periodo: 'matutino',
            sala: '204',
            ano: 2023,
            turno: 'Manhã',
            horarioInicio: '07:30',
            horarioFim: '12:00'
        }
    ],

    // ========== DISCIPLINAS ==========
    disciplinas: [
        { id: 1, nome: 'Matemática', cargaHoraria: 160, ativa: true },
        { id: 2, nome: 'Português', cargaHoraria: 160, ativa: true },
        { id: 3, nome: 'Ciências', cargaHoraria: 120, ativa: true },
        { id: 4, nome: 'História', cargaHoraria: 80, ativa: true },
        { id: 5, nome: 'Geografia', cargaHoraria: 80, ativa: true },
        { id: 6, nome: 'Inglês', cargaHoraria: 80, ativa: true },
        { id: 7, nome: 'Artes', cargaHoraria: 40, ativa: true },
        { id: 8, nome: 'Educação Física', cargaHoraria: 80, ativa: true }
    ],

    // ========== NOTAS ==========
    notas: [
        {
            id: 1,
            alunoId: 1,
            disciplina: 'Matemática',
            nota1: 8.5,
            nota2: 9.0,
            nota3: 7.5,
            nota4: 8.0,
            media: 8.25,
            recuperacao: null,
            mediaFinal: 8.25,
            situacao: 'aprovado',
            ano: 2023,
            bimestre: 4
        },
        {
            id: 2,
            alunoId: 1,
            disciplina: 'Português',
            nota1: 7.0,
            nota2: 8.5,
            nota3: 9.0,
            nota4: 8.0,
            media: 8.12,
            recuperacao: null,
            mediaFinal: 8.12,
            situacao: 'aprovado',
            ano: 2023,
            bimestre: 4
        },
        {
            id: 3,
            alunoId: 1,
            disciplina: 'Ciências',
            nota1: 8.0,
            nota2: 7.5,
            nota3: 8.5,
            nota4: 9.0,
            media: 8.25,
            recuperacao: null,
            mediaFinal: 8.25,
            situacao: 'aprovado',
            ano: 2023,
            bimestre: 4
        },
        {
            id: 4,
            alunoId: 1,
            disciplina: 'História',
            nota1: 9.0,
            nota2: 8.5,
            nota3: 9.0,
            nota4: 8.5,
            media: 8.75,
            recuperacao: null,
            mediaFinal: 8.75,
            situacao: 'aprovado',
            ano: 2023,
            bimestre: 4
        },
        {
            id: 5,
            alunoId: 2,
            disciplina: 'Matemática',
            nota1: 9.0,
            nota2: 8.5,
            nota3: 9.5,
            nota4: 8.5,
            media: 8.87,
            recuperacao: null,
            mediaFinal: 8.87,
            situacao: 'aprovado',
            ano: 2023,
            bimestre: 4
        },
        {
            id: 6,
            alunoId: 2,
            disciplina: 'Português',
            nota1: 8.5,
            nota2: 9.0,
            nota3: 8.5,
            nota4: 9.0,
            media: 8.75,
            recuperacao: null,
            mediaFinal: 8.75,
            situacao: 'aprovado',
            ano: 2023,
            bimestre: 4
        }
    ],

    // ========== FREQUÊNCIAS ==========
    frequencias: [
        {
            id: 1,
            alunoId: 1,
            disciplina: 'Matemática',
            presencas: 38,
            faltas: 2,
            totalAulas: 40,
            percentual: 95,
            ano: 2023,
            bimestre: 4
        },
        {
            id: 2,
            alunoId: 1,
            disciplina: 'Português',
            presencas: 37,
            faltas: 3,
            totalAulas: 40,
            percentual: 92.5,
            ano: 2023,
            bimestre: 4
        },
        {
            id: 3,
            alunoId: 1,
            disciplina: 'Ciências',
            presencas: 39,
            faltas: 1,
            totalAulas: 40,
            percentual: 97.5,
            ano: 2023,
            bimestre: 4
        },
        {
            id: 4,
            alunoId: 2,
            disciplina: 'Matemática',
            presencas: 40,
            faltas: 0,
            totalAulas: 40,
            percentual: 100,
            ano: 2023,
            bimestre: 4
        }
    ],

    // ========== HORÁRIOS ==========
    horarios: [
        {
            id: 1,
            turmaId: 101,
            dia: 'Segunda',
            disciplina: 'Matemática',
            horarioInicio: '07:30',
            horarioFim: '09:00',
            professor: 'Carlos Santos',
            sala: '101'
        },
        {
            id: 2,
            turmaId: 101,
            dia: 'Segunda',
            disciplina: 'Português',
            horarioInicio: '09:15',
            horarioFim: '10:45',
            professor: 'Júlio Silva',
            sala: '102'
        },
        {
            id: 3,
            turmaId: 101,
            dia: 'Terça',
            disciplina: 'Ciências',
            horarioInicio: '07:30',
            horarioFim: '09:00',
            professor: 'Ana Paula',
            sala: '103'
        },
        {
            id: 4,
            turmaId: 101,
            dia: 'Quarta',
            disciplina: 'Matemática',
            horarioInicio: '07:30',
            horarioFim: '09:00',
            professor: 'Carlos Santos',
            sala: '101'
        },
        {
            id: 5,
            turmaId: 101,
            dia: 'Quinta',
            disciplina: 'Português',
            horarioInicio: '07:30',
            horarioFim: '09:00',
            professor: 'Júlio Silva',
            sala: '102'
        },
        {
            id: 6,
            turmaId: 101,
            dia: 'Sexta',
            disciplina: 'História',
            horarioInicio: '07:30',
            horarioFim: '09:00',
            professor: 'Roberto Lima',
            sala: '104'
        }
    ],

    // ========== FUNCIONALIDADE 1: BIBLIOTECA ==========
    biblioteca: {
        livros: [
            {
                id: 1,
                titulo: 'Dom Casmurro',
                autor: 'Machado de Assis',
                editora: 'Editora Brasil',
                ano: 1899,
                isbn: '978-85-1234-567-8',
                genero: 'Romance',
                paginas: 256,
                exemplares: 5,
                disponiveis: 3,
                localizacao: 'Estante A1',
                dataAquisicao: '2020-03-10',
                estado: 'bom'
            },
            {
                id: 2,
                titulo: 'O Pequeno Príncipe',
                autor: 'Antoine Saint-Exupéry',
                editora: 'Agir',
                ano: 1943,
                isbn: '978-85-5678-123-4',
                genero: 'Infantil',
                paginas: 96,
                exemplares: 8,
                disponiveis: 2,
                localizacao: 'Estante B3',
                dataAquisicao: '2021-05-15',
                estado: 'ótimo'
            },
            {
                id: 3,
                titulo: 'Memórias Póstumas de Brás Cubas',
                autor: 'Machado de Assis',
                editora: 'Editora Brasil',
                ano: 1881,
                isbn: '978-85-4321-876-5',
                genero: 'Romance',
                paginas: 224,
                exemplares: 4,
                disponiveis: 4,
                localizacao: 'Estante A2',
                dataAquisicao: '2020-03-10',
                estado: 'bom'
            },
            {
                id: 4,
                titulo: 'A Moreninha',
                autor: 'Joaquim Manuel de Macedo',
                editora: 'Editora Nacional',
                ano: 1844,
                isbn: '978-85-9876-543-2',
                genero: 'Romance',
                paginas: 200,
                exemplares: 3,
                disponiveis: 1,
                localizacao: 'Estante A3',
                dataAquisicao: '2019-08-22',
                estado: 'regular'
            },
            {
                id: 5,
                titulo: 'Iracema',
                autor: 'José de Alencar',
                editora: 'Editora Nacional',
                ano: 1865,
                isbn: '978-85-2468-135-7',
                genero: 'Romance',
                paginas: 176,
                exemplares: 6,
                disponiveis: 4,
                localizacao: 'Estante C1',
                dataAquisicao: '2021-02-18',
                estado: 'bom'
            },
            {
                id: 6,
                titulo: 'O Cortiço',
                autor: 'Aluísio Azevedo',
                editora: 'Editora Nacional',
                ano: 1890,
                isbn: '978-85-1357-924-6',
                genero: 'Naturalismo',
                paginas: 240,
                exemplares: 4,
                disponiveis: 2,
                localizacao: 'Estante C2',
                dataAquisicao: '2020-11-30',
                estado: 'bom'
            },
            {
                id: 7,
                titulo: 'Vidas Secas',
                autor: 'Graciliano Ramos',
                editora: 'Editora Record',
                ano: 1938,
                isbn: '978-85-2468-975-9',
                genero: 'Romance',
                paginas: 176,
                exemplares: 7,
                disponiveis: 5,
                localizacao: 'Estante D1',
                dataAquisicao: '2022-04-12',
                estado: 'ótimo'
            },
            {
                id: 8,
                titulo: 'Capitães da Areia',
                autor: 'Jorge Amado',
                editora: 'Companhia das Letras',
                ano: 1937,
                isbn: '978-85-3590-123-4',
                genero: 'Romance',
                paginas: 288,
                exemplares: 5,
                disponiveis: 3,
                localizacao: 'Estante D2',
                dataAquisicao: '2022-09-05',
                estado: 'ótimo'
            }
        ],
        emprestimos: [
            {
                id: 1,
                alunoId: 1,
                livroId: 1,
                dataEmprestimo: '2023-11-01',
                dataPrevista: '2023-11-15',
                dataDevolucao: null,
                status: 'emprestado',
                renovacoes: 0,
                observacoes: ''
            },
            {
                id: 2,
                alunoId: 2,
                livroId: 2,
                dataEmprestimo: '2023-11-05',
                dataPrevista: '2023-11-19',
                dataDevolucao: null,
                status: 'emprestado',
                renovacoes: 1,
                observacoes: 'Renovado uma vez'
            },
            {
                id: 3,
                alunoId: 3,
                livroId: 3,
                dataEmprestimo: '2023-10-20',
                dataPrevista: '2023-11-03',
                dataDevolucao: '2023-11-02',
                status: 'devolvido',
                renovacoes: 0,
                observacoes: 'Devolvido no prazo'
            }
        ],
        reservas: [
            {
                id: 1,
                alunoId: 1,
                livroId: 5,
                dataReserva: '2023-11-15',
                status: 'ativa',
                dataExpiracao: '2023-11-22'
            },
            {
                id: 2,
                alunoId: 2,
                livroId: 6,
                dataReserva: '2023-11-16',
                status: 'ativa',
                dataExpiracao: '2023-11-23'
            }
        ],
        multas: [
            {
                id: 1,
                alunoId: 3,
                valor: 5.00,
                motivo: 'Atraso na devolução',
                data: '2023-11-03',
                dataPagamento: '2023-11-05',
                status: 'pago'
            }
        ],
        categorias: [
            { id: 1, nome: 'Romance', quantidade: 25 },
            { id: 2, nome: 'Infantil', quantidade: 40 },
            { id: 3, nome: 'Didático', quantidade: 150 },
            { id: 4, nome: 'Pesquisa', quantidade: 30 }
        ]
    },

    // ========== FUNCIONALIDADE 2: MERENDA ESCOLAR ==========
    merenda: {
        cardapios: [
            {
                id: 1,
                data: '2023-11-20',
                dia: 'Segunda',
                cafe: 'Leite com achocolatado, pão com manteiga',
                almoco: 'Arroz, feijão, frango assado, salada',
                lanche: 'Fruta (maçã)',
                observacoes: 'Cardápio normal'
            },
            {
                id: 2,
                data: '2023-11-21',
                dia: 'Terça',
                cafe: 'Iogurte, biscoito',
                almoco: 'Macarronada, carne moída, legumes',
                lanche: 'Suco natural',
                observacoes: ''
            },
            {
                id: 3,
                data: '2023-11-22',
                dia: 'Quarta',
                cafe: 'Vitamina de frutas, pão integral',
                almoco: 'Peixe assado, arroz, purê de batata',
                lanche: 'Gelatina',
                observacoes: 'Cardápio light'
            },
            {
                id: 4,
                data: '2023-11-23',
                dia: 'Quinta',
                cafe: 'Leite, cereal, fruta',
                almoco: 'Strogonoff de frango, arroz, batata palha',
                lanche: 'Picolé de fruta',
                observacoes: 'Cardápio comemorativo'
            },
            {
                id: 5,
                data: '2023-11-24',
                dia: 'Sexta',
                cafe: 'Achocolatado, pão com queijo',
                almoco: 'Pizza de frango, salada',
                lanche: 'Sorvete',
                observacoes: 'Sexta especial'
            }
        ],
        alunosEspeciais: [
            {
                id: 1,
                alunoId: 1,
                restricoes: ['Glúten'],
                observacoes: 'Necessita dieta especial - doença celíaca',
                tipoDieta: 'Restritiva',
                dataInicio: '2023-01-15',
                ativo: true
            },
            {
                id: 2,
                alunoId: 3,
                restricoes: ['Lactose'],
                observacoes: 'Intolerância à lactose',
                tipoDieta: 'Restritiva',
                dataInicio: '2023-02-10',
                ativo: true
            },
            {
                id: 3,
                alunoId: 5,
                restricoes: ['Amendoim'],
                observacoes: 'Alergia severa',
                tipoDieta: 'Restritiva',
                dataInicio: '2023-03-05',
                ativo: true
            }
        ],
        estoque: [
            {
                id: 1,
                item: 'Arroz',
                quantidade: 150,
                unidade: 'kg',
                dataValidade: '2024-01-15',
                fornecedor: 'Fornecedor A',
                lote: 'L001',
                localizacao: 'Almoxarifado A'
            },
            {
                id: 2,
                item: 'Feijão',
                quantidade: 100,
                unidade: 'kg',
                dataValidade: '2024-02-10',
                fornecedor: 'Fornecedor A',
                lote: 'L002',
                localizacao: 'Almoxarifado A'
            },
            {
                id: 3,
                item: 'Frango',
                quantidade: 80,
                unidade: 'kg',
                dataValidade: '2023-12-05',
                fornecedor: 'Fornecedor B',
                lote: 'L003',
                localizacao: 'Câmara fria 1'
            },
            {
                id: 4,
                item: 'Leite',
                quantidade: 200,
                unidade: 'litros',
                dataValidade: '2023-11-30',
                fornecedor: 'Fornecedor C',
                lote: 'L004',
                localizacao: 'Câmara fria 2'
            }
        ],
        fornecedores: [
            { id: 1, nome: 'Fornecedor A', tipo: 'Alimentos não perecíveis', contato: '(11) 3333-1111', email: 'contato@fornecedora.com' },
            { id: 2, nome: 'Fornecedor B', tipo: 'Carnes e frangos', contato: '(11) 3333-2222', email: 'carnes@fornecedorb.com' },
            { id: 3, nome: 'Fornecedor C', tipo: 'Laticínios', contato: '(11) 3333-3333', email: 'laticinios@fornecedorc.com' }
        ],
        nutricionistas: [
            { id: 1, nome: 'Dra. Ana Paula', crn: '12345', telefone: '(11) 99999-1111' },
            { id: 2, nome: 'Dr. Carlos Eduardo', crn: '54321', telefone: '(11) 99999-2222' }
        ]
    },

    // ========== FUNCIONALIDADE 3: TRANSPORTE ESCOLAR ==========
    transporte: {
        rotas: [
            {
                id: 1,
                nome: 'Rota Centro',
                motorista: 'João Pedro',
                veiculo: 'Ônibus A',
                placa: 'ABC-1234',
                capacidade: 40,
                alunos: 35,
                inicio: '07:00',
                fim: '08:30',
                dias: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                pontos: [
                    { ordem: 1, local: 'Ponto Inicial', horario: '07:00' },
                    { ordem: 2, local: 'Rua A', horario: '07:10' },
                    { ordem: 3, local: 'Praça Central', horario: '07:20' },
                    { ordem: 4, local: 'Av. Principal', horario: '07:30' }
                ]
            },
            {
                id: 2,
                nome: 'Rota Bairro',
                motorista: 'Maria José',
                veiculo: 'Van 01',
                placa: 'DEF-5678',
                capacidade: 20,
                alunos: 18,
                inicio: '06:30',
                fim: '07:45',
                dias: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                pontos: [
                    { ordem: 1, local: 'Ponto Final do Bairro', horario: '06:30' },
                    { ordem: 2, local: 'Rua B', horario: '06:45' },
                    { ordem: 3, local: 'Rua C', horario: '07:00' }
                ]
            }
        ],
        alunosTransporte: [
            {
                id: 1,
                alunoId: 1,
                rotaId: 1,
                ponto: 'Rua A',
                horario: '07:10',
                turno: 'matutino',
                status: 'ativo',
                dataInicio: '2023-02-01'
            },
            {
                id: 2,
                alunoId: 2,
                rotaId: 1,
                ponto: 'Praça Central',
                horario: '07:20',
                turno: 'matutino',
                status: 'ativo',
                dataInicio: '2023-02-01'
            },
            {
                id: 3,
                alunoId: 3,
                rotaId: 2,
                ponto: 'Rua C',
                horario: '07:00',
                turno: 'matutino',
                status: 'ativo',
                dataInicio: '2023-02-01'
            }
        ],
        veiculos: [
            {
                id: 1,
                tipo: 'Ônibus',
                modelo: 'Mercedes-Benz',
                placa: 'ABC-1234',
                ano: 2020,
                capacidade: 40,
                seguro: 'Seguro XYZ - Apólice 12345',
                vistoria: '2023-12-31',
                status: 'ativo',
                observacoes: 'Última manutenção: 15/10/2023'
            },
            {
                id: 2,
                tipo: 'Van',
                modelo: 'Sprinter',
                placa: 'DEF-5678',
                ano: 2021,
                capacidade: 20,
                seguro: 'Seguro XYZ - Apólice 54321',
                vistoria: '2023-12-31',
                status: 'ativo',
                observacoes: 'Última manutenção: 20/10/2023'
            },
            {
                id: 3,
                tipo: 'Ônibus',
                modelo: 'Volvo',
                placa: 'GHI-9012',
                ano: 2019,
                capacidade: 45,
                seguro: 'Seguro ABC - Apólice 67890',
                vistoria: '2023-11-30',
                status: 'manutencao',
                observacoes: 'Em manutenção preventiva'
            }
        ],
        motoristas: [
            {
                id: 1,
                nome: 'João Pedro',
                cnh: '123456789',
                categoria: 'D',
                validade: '2025-05-10',
                telefone: '(11) 98888-1111',
                dataAdmissao: '2020-03-15',
                status: 'ativo'
            },
            {
                id: 2,
                nome: 'Maria José',
                cnh: '987654321',
                categoria: 'D',
                validade: '2024-08-15',
                telefone: '(11) 97777-2222',
                dataAdmissao: '2021-06-20',
                status: 'ativo'
            }
        ]
    },

    // ========== FUNCIONALIDADE 4: OCORRÊNCIAS DISCIPLINARES ==========
    ocorrencias: [
        {
            id: 1,
            alunoId: 3,
            tipo: 'indisciplina',
            data: '2023-11-10',
            hora: '09:30',
            descricao: 'Comportamento inadequado em sala, desrespeitando o professor durante a aula',
            medidas: 'Advertência verbal e conversa com os pais',
            status: 'resolvido',
            registradoPor: 3,
            dataResolucao: '2023-11-12',
            envolvidos: ['Aluno', 'Professor Carlos'],
            anexos: []
        },
        {
            id: 2,
            alunoId: 1,
            tipo: 'atraso',
            data: '2023-11-15',
            hora: '07:45',
            descricao: 'Chegou atrasado 3 vezes na semana',
            medidas: 'Notificação aos responsáveis',
            status: 'pendente',
            registradoPor: 1,
            dataResolucao: null,
            envolvidos: ['Aluno João Silva'],
            anexos: []
        },
        {
            id: 3,
            alunoId: 2,
            tipo: 'material',
            data: '2023-11-14',
            hora: '10:00',
            descricao: 'Não trouxe material escolar repetidamente',
            medidas: 'Contato com os pais',
            status: 'em_andamento',
            registradoPor: 1,
            dataResolucao: null,
            envolvidos: ['Aluno Pedro Santos', 'Pais'],
            anexos: []
        }
    ],

    // ========== FUNCIONALIDADE 5: COMUNICAÇÃO COM RESPONSÁVEIS ==========
    comunicacao: {
        mensagens: [
            {
                id: 1,
                remetente: 'professor',
                remetenteId: 3,
                destinatario: 'responsavel',
                destinatarioId: 1,
                titulo: 'Reunião de Pais',
                mensagem: 'Lembramos da reunião de pais amanhã às 19h no auditório. Sua presença é importante!',
                data: '2023-11-14',
                hora: '14:30',
                lida: false,
                anexos: []
            },
            {
                id: 2,
                remetente: 'escola',
                remetenteId: 1,
                destinatario: 'responsavel',
                destinatarioId: 3,
                titulo: 'Falta do aluno',
                mensagem: 'Comunicamos que o aluno João Silva faltou hoje sem justificativa.',
                data: '2023-11-15',
                hora: '16:00',
                lida: true,
                anexos: []
            },
            {
                id: 3,
                remetente: 'responsavel',
                remetenteId: 1,
                destinatario: 'professor',
                destinatarioId: 3,
                titulo: 'Justificativa de falta',
                mensagem: 'Meu filho não pôde ir à escola por motivo de consulta médica. Segue anexo o atestado.',
                data: '2023-11-15',
                hora: '18:30',
                lida: false,
                anexos: ['atestado.pdf']
            }
        ],
        avisos: [
            {
                id: 1,
                titulo: 'Feriado Municipal',
                conteudo: 'Dia 20/11 não haverá aula devido ao feriado da Consciência Negra.',
                data: '2023-11-10',
                publico: 'todos',
                importante: true,
                autor: 'Secretaria'
            },
            {
                id: 2,
                titulo: 'Entrega de Boletins',
                conteudo: 'Os boletins do 4º bimestre serão entregues dia 15/12.',
                data: '2023-11-13',
                publico: 'pais',
                importante: true,
                autor: 'Direção'
            },
            {
                id: 3,
                titulo: 'Palestra sobre Profissões',
                conteudo: 'Dia 25/11 haverá palestra sobre carreiras para os alunos do 9º ano.',
                data: '2023-11-16',
                publico: 'alunos',
                importante: false,
                autor: 'Orientação'
            }
        ],
        grupos: [
            { id: 1, nome: 'Pais do 5ºA', participantes: [1, 2, 3, 4] },
            { id: 2, nome: 'Professores de Matemática', participantes: [1, 2] }
        ]
    },

    // ========== FUNCIONALIDADE 6: ATIVIDADES / TAREFAS ==========
    atividades: [
        {
            id: 1,
            turmaId: 101,
            titulo: 'Exercícios de Matemática',
            descricao: 'Resolver exercícios 1 a 10 da página 50 do livro didático.',
            dataPublicacao: '2023-11-13',
            dataEntrega: '2023-11-20',
            tipo: 'tarefa',
            professorId: 1,
            valor: 2.0,
            entregues: 25,
            totalAlunos: 30,
            anexos: []
        },
        {
            id: 2,
            turmaId: 101,
            titulo: 'Produção de Texto',
            descricao: 'Escrever uma redação sobre "Meu futuro profissional" com mínimo de 20 linhas.',
            dataPublicacao: '2023-11-10',
            dataEntrega: '2023-11-17',
            tipo: 'redacao',
            professorId: 2,
            valor: 3.0,
            entregues: 22,
            totalAlunos: 30,
            anexos: []
        },
        {
            id: 3,
            turmaId: 102,
            titulo: 'Trabalho de Ciências',
            descricao: 'Pesquisa sobre sistema solar em grupos de 4 alunos. Apresentação em slides.',
            dataPublicacao: '2023-11-05',
            dataEntrega: '2023-11-25',
            tipo: 'trabalho',
            professorId: 3,
            valor: 5.0,
            entregues: 18,
            totalAlunos: 28,
            anexos: []
        }
    ],
    entregas: [
        {
            id: 1,
            atividadeId: 1,
            alunoId: 1,
            dataEntrega: '2023-11-19',
            nota: 9.5,
            comentario: 'Excelente trabalho',
            status: 'avaliado'
        },
        {
            id: 2,
            atividadeId: 1,
            alunoId: 2,
            dataEntrega: '2023-11-20',
            nota: 8.0,
            comentario: 'Bom, mas faltou capricho',
            status: 'avaliado'
        }
    ],

    // ========== FUNCIONALIDADE 7: VAGAS / MATRÍCULAS ==========
    vagas: {
        turmas: [
            {
                id: 101,
                nome: '5ºA',
                totalVagas: 35,
                ocupadas: 30,
                disponiveis: 5,
                listaEspera: 2,
                ano: 2024
            },
            {
                id: 102,
                nome: '5ºB',
                totalVagas: 35,
                ocupadas: 28,
                disponiveis: 7,
                listaEspera: 0,
                ano: 2024
            },
            {
                id: 103,
                nome: '6ºA',
                totalVagas: 35,
                ocupadas: 32,
                disponiveis: 3,
                listaEspera: 3,
                ano: 2024
            },
            {
                id: 104,
                nome: '6ºB',
                totalVagas: 35,
                ocupadas: 33,
                disponiveis: 2,
                listaEspera: 1,
                ano: 2024
            }
        ],
        inscricoes: [
            {
                id: 1,
                nomeAluno: 'Novo Aluno 1',
                dataNascimento: '2012-05-20',
                turmaDesejada: '5ºA',
                data: '2023-11-15',
                status: 'pendente',
                responsavel: 'Pai do Aluno',
                telefone: '(11) 99999-1111',
                email: 'responsavel1@gmail.com'
            },
            {
                id: 2,
                nomeAluno: 'Novo Aluno 2',
                dataNascimento: '2011-08-15',
                turmaDesejada: '6ºA',
                data: '2023-11-16',
                status: 'aprovado',
                responsavel: 'Mãe do Aluno',
                telefone: '(11) 99999-2222',
                email: 'responsavel2@gmail.com'
            },
            {
                id: 3,
                nomeAluno: 'Novo Aluno 3',
                dataNascimento: '2012-01-10',
                turmaDesejada: '5ºB',
                data: '2023-11-14',
                status: 'lista_espera',
                responsavel: 'Responsável',
                telefone: '(11) 99999-3333',
                email: 'responsavel3@gmail.com'
            }
        ],
        rematriculas: [
            {
                id: 1,
                alunoId: 1,
                ano: 2024,
                status: 'confirmada',
                data: '2023-10-15'
            },
            {
                id: 2,
                alunoId: 2,
                ano: 2024,
                status: 'confirmada',
                data: '2023-10-16'
            },
            {
                id: 3,
                alunoId: 3,
                ano: 2024,
                status: 'pendente',
                data: null
            }
        ]
    },

    // ========== FUNCIONALIDADE 8: REUNIÕES E ATAS ==========
    reunioes: [
        {
            id: 1,
            tipo: 'pedagogica',
            titulo: 'Reunião Pedagógica - Planejamento Bimestral',
            data: '2023-11-18',
            horario: '14:00',
            duracao: '2h',
            local: 'Sala de Reuniões',
            pauta: [
                'Avaliações do 4º bimestre',
                'Projetos interdisciplinares para o próximo ano',
                'Análise de resultados'
            ],
            participantes: [1, 2, 3, 4],
            participantesNomes: ['Carlos Santos', 'Júlio Silva', 'Ana Paula', 'Roberto Lima'],
            ata: 'Foram discutidos os resultados do bimestre...',
            status: 'agendada',
            responsavel: 2
        },
        {
            id: 2,
            tipo: 'conselho',
            titulo: 'Conselho de Classe - 4º Bimestre',
            data: '2023-12-05',
            horario: '13:00',
            duracao: '3h',
            local: 'Auditório',
            pauta: [
                'Análise individual dos alunos',
                'Recuperação paralela',
                'Alunos com baixo rendimento'
            ],
            participantes: [1, 2, 3, 4, 5],
            participantesNomes: ['Carlos', 'Júlio', 'Ana', 'Roberto', 'Fernanda'],
            ata: null,
            status: 'agendada',
            responsavel: 2
        }
    ],

    // ========== FUNCIONALIDADE 9: PROJETOS ESCOLARES ==========
    projetos: [
        {
            id: 1,
            titulo: 'Feira de Ciências 2023',
            descricao: 'Apresentação de experimentos científicos pelos alunos do ensino fundamental.',
            objetivos: [
                'Estimular o interesse pela ciência',
                'Desenvolver habilidades de pesquisa',
                'Promover trabalho em equipe'
            ],
            dataInicio: '2023-11-20',
            dataFim: '2023-11-24',
            responsavel: 3,
            professorId: 3,
            turmas: [101, 102, 103],
            alunos: [1, 2, 4, 5],
            status: 'em_andamento',
            orcamento: 1500.00,
            observacoes: 'Cada turma deve preparar 3 experimentos'
        },
        {
            id: 2,
            titulo: 'Semana da Consciência Negra',
            descricao: 'Atividades culturais e educativas sobre a cultura afro-brasileira.',
            dataInicio: '2023-11-13',
            dataFim: '2023-11-17',
            responsavel: 4,
            professorId: 4,
            turmas: [101, 102, 201, 202],
            alunos: [1, 2, 3],
            status: 'concluido',
            orcamento: 800.00,
            observacoes: 'Atividades realizadas com sucesso'
        }
    ],

    // ========== FUNCIONALIDADE 10: SAÚDE ESCOLAR ==========
    saude: {
        alunos: [
            {
                id: 1,
                alunoId: 1,
                tipoSanguineo: 'O+',
                alergias: ['poeira', 'amendoim'],
                medicamentos: ['Ritalina'],
                contatoEmergencia: '(11) 99999-8888',
                planoSaude: 'Unimed',
                observacoes: 'Acompanhamento psicológico'
            },
            {
                id: 2,
                alunoId: 3,
                tipoSanguineo: 'A+',
                alergias: ['lactose'],
                medicamentos: [],
                contatoEmergencia: '(11) 99999-7777',
                planoSaude: 'SUS',
                observacoes: ''
            }
        ],
        ocorrenciasSaude: [
            {
                id: 1,
                alunoId: 1,
                data: '2023-11-10',
                hora: '10:30',
                tipo: 'dor de cabeça',
                descricao: 'Aluno queixou-se de forte dor de cabeça',
                atendimento: 'enfermaria',
                profissional: 'Enf. Maria',
                medidas: 'Administrado paracetamol, repouso',
                status: 'resolvido'
            },
            {
                id: 2,
                alunoId: 3,
                data: '2023-11-15',
                hora: '14:20',
                tipo: 'alergia',
                descricao: 'Reação alérgica após o lanche',
                atendimento: 'enfermaria',
                profissional: 'Enf. João',
                medidas: 'Administrado anti-histamínico',
                status: 'resolvido'
            }
        ],
        exames: [
            {
                id: 1,
                alunoId: 1,
                tipo: 'Acuidade visual',
                data: '2023-10-05',
                resultado: 'Normal',
                observacoes: ''
            }
        ],
        vacinas: [
            {
                id: 1,
                alunoId: 1,
                vacina: 'Tríplice viral',
                dose: '2ª dose',
                data: '2023-03-10',
                proxima: '2026-03-10'
            }
        ]
    },

    // ========== FUNCIONALIDADE 11: BOLSAS / AUXÍLIOS ==========
    auxilios: [
        {
            id: 1,
            alunoId: 3,
            tipo: 'bolsa_familia',
            valor: 150.00,
            dataInicio: '2023-01-01',
            dataFim: null,
            status: 'ativo',
            observacoes: 'Benefício integral'
        },
        {
            id: 2,
            alunoId: 5,
            tipo: 'transporte',
            valor: 80.00,
            dataInicio: '2023-02-01',
            dataFim: null,
            status: 'ativo',
            observacoes: 'Auxílio transporte'
        }
    ],

    // ========== FUNCIONALIDADE 12: ESTÁGIO (ENSINO MÉDIO) ==========
    estagios: [
        {
            id: 1,
            alunoId: 3,
            empresa: 'Empresa Júnior',
            area: 'Administração',
            orientador: 1,
            orientadorNome: 'Carlos Santos',
            cargaHoraria: 20,
            dataInicio: '2023-02-01',
            dataFim: '2023-12-20',
            status: 'em_andamento',
            avaliacao: 'Bom desempenho',
            relatorios: []
        }
    ],

    // ========== FUNCIONALIDADE 13: MONITORIA / TUTORIA ==========
    monitoria: [
        {
            id: 1,
            monitorId: 2,
            monitorNome: 'Pedro Santos',
            disciplina: 'Matemática',
            turmas: [101],
            horarios: ['Segunda 14h', 'Quarta 14h'],
            alunosAtendidos: [1, 4],
            dataInicio: '2023-08-01',
            status: 'ativo'
        }
    ],

    // ========== FUNCIONALIDADE 14: COMPETIÇÕES / OLIMPÍADAS ==========
    competicoes: [
        {
            id: 1,
            nome: 'Olimpíada de Matemática',
            tipo: 'estadual',
            data: '2023-11-25',
            local: 'USP',
            alunosInscritos: [1, 2],
            alunosNomes: ['João Silva', 'Pedro Santos'],
            resultado: null,
            status: 'inscricoes_abertas'
        },
        {
            id: 2,
            nome: 'Feira de Ciências',
            tipo: 'municipal',
            data: '2023-10-10',
            local: 'Escola Estadual',
            alunosInscritos: [4],
            alunosNomes: ['Mariana Souza'],
            resultado: 'Menção Honrosa',
            status: 'concluida'
        }
    ],

    // ========== FUNCIONALIDADE 15: HORAS COMPLEMENTARES ==========
    horasComplementares: [
        {
            id: 1,
            alunoId: 1,
            atividade: 'Palestra sobre Meio Ambiente',
            tipo: 'palestra',
            horas: 4,
            data: '2023-11-10',
            comprovante: true,
            status: 'aprovado',
            observacoes: ''
        },
        {
            id: 2,
            alunoId: 2,
            atividade: 'Visita ao Museu',
            tipo: 'cultural',
            horas: 6,
            data: '2023-10-25',
            comprovante: true,
            status: 'aprovado',
            observacoes: ''
        }
    ],

    // ========== FUNCIONALIDADE 16: PESQUISA DE SATISFAÇÃO ==========
    pesquisas: [
        {
            id: 1,
            titulo: 'Satisfação com a Escola',
            descricao: 'Pesquisa anual de satisfação com pais e alunos',
            questoes: [
                'Como você avalia a qualidade do ensino?',
                'Como você avalia a infraestrutura?',
                'Como você avalia a comunicação escola-família?',
                'Como você avalia a segurança na escola?',
                'Como você avalia a merenda escolar?'
            ],
            respostas: [],
            dataInicio: '2023-11-01',
            dataFim: '2023-11-30',
            publico: 'pais',
            status: 'ativa'
        }
    ],

    // ========== FUNCIONALIDADE 17: DOCUMENTOS / SECRETARIA ONLINE ==========
    documentos: [
        {
            id: 1,
            alunoId: 1,
            tipo: 'historico',
            ano: 2023,
            arquivo: 'historico_2023.pdf',
            dataEmissao: '2023-11-15',
            validado: true,
            assinado: true
        },
        {
            id: 2,
            alunoId: 1,
            tipo: 'declaracao_matricula',
            ano: 2023,
            arquivo: 'declaracao_2023.pdf',
            dataEmissao: '2023-11-10',
            validado: true,
            assinado: true
        },
        {
            id: 3,
            alunoId: 2,
            tipo: 'transferencia',
            ano: 2023,
            arquivo: 'transferencia.pdf',
            dataEmissao: '2023-11-05',
            validado: true,
            assinado: true
        }
    ],

    // ========== FUNCIONALIDADE 18: UNIFORME / MATERIAL ESCOLAR ==========
    uniforme: {
        modelos: [
            {
                id: 1,
                tipo: 'camiseta',
                descricao: 'Camiseta branca com logo da escola',
                tamanhos: ['P', 'M', 'G', 'GG'],
                preco: 45.00,
                disponivel: true
            },
            {
                id: 2,
                tipo: 'calça',
                descricao: 'Calça jeans azul',
                tamanhos: ['P', 'M', 'G', 'GG'],
                preco: 65.00,
                disponivel: true
            },
            {
                id: 3,
                tipo: 'jaqueta',
                descricao: 'Jaqueta de moletom com capuz',
                tamanhos: ['P', 'M', 'G', 'GG'],
                preco: 89.00,
                disponivel: true
            },
            {
                id: 4,
                tipo: 'tenis',
                descricao: 'Tênis branco',
                tamanhos: ['33', '34', '35', '36', '37', '38'],
                preco: 120.00,
                disponivel: true
            }
        ],
        solicitacoes: [
            {
                id: 1,
                alunoId: 1,
                itens: [
                    { tipo: 'camiseta', tamanho: 'M', quantidade: 2 },
                    { tipo: 'calça', tamanho: 'M', quantidade: 2 }
                ],
                data: '2023-11-15',
                valorTotal: 220.00,
                status: 'entregue',
                pagamento: 'confirmado'
            },
            {
                id: 2,
                alunoId: 3,
                itens: [
                    { tipo: 'camiseta', tamanho: 'G', quantidade: 2 },
                    { tipo: 'jaqueta', tamanho: 'G', quantidade: 1 }
                ],
                data: '2023-11-16',
                valorTotal: 179.00,
                status: 'em_andamento',
                pagamento: 'pendente'
            }
        ]
    },

    // ========== FUNCIONALIDADE 19: CURSOS / FORMAÇÃO CONTINUADA ==========
    cursos: [
        {
            id: 1,
            titulo: 'Novas Metodologias de Ensino',
            descricao: 'Curso sobre metodologias ativas e inovação pedagógica',
            cargaHoraria: 40,
            dataInicio: '2023-10-01',
            dataFim: '2023-11-30',
            inscritos: [1, 2, 3],
            inscritosNomes: ['Carlos', 'Júlio', 'Ana'],
            status: 'em_andamento',
            certificado: true,
            instrutor: 'Prof. Marcos'
        },
        {
            id: 2,
            titulo: 'Educação Inclusiva',
            descricao: 'Formação em educação especial e inclusiva',
            cargaHoraria: 60,
            dataInicio: '2023-09-01',
            dataFim: '2023-10-30',
            inscritos: [4, 5],
            inscritosNomes: ['Roberto', 'Fernanda'],
            status: 'concluido',
            certificado: true,
            instrutor: 'Dra. Patricia'
        }
    ],

    // ========== FUNCIONALIDADE 20: FEEDBACK / AVALIAÇÃO INSTITUCIONAL ==========
    avaliacoes: [
        {
            id: 1,
            tipo: 'professor',
            avaliado: 1,
            avaliadoNome: 'Carlos Santos',
            avaliador: 'aluno',
            avaliadorId: 1,
            avaliadorNome: 'João Silva',
            notas: {
                didatica: 8,
                pontualidade: 9,
                relacionamento: 7,
                clareza: 8,
                dominio: 9
            },
            media: 8.2,
            comentario: 'Ótimo professor, explica bem',
            data: '2023-11-15'
        },
        {
            id: 2,
            tipo: 'escola',
            avaliado: 1,
            avaliadoNome: 'EMEF Maria da Silva',
            avaliador: 'pai',
            avaliadorId: 1,
            avaliadorNome: 'Maria Silva',
            notas: {
                infraestrutura: 8,
                seguranca: 9,
                comunicacao: 7,
                ensino: 9,
                merenda: 8
            },
            media: 8.2,
            comentario: 'Escola muito boa, recomendo',
            data: '2023-11-14'
        }
    ]
};

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MOCK_DATA;
}
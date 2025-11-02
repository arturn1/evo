# Sistema de Gerenciamento de Pacientes

Sistema completo de gerenciamento médico com autenticação baseada em roles, CRUD de pacientes e laudos.

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Criar banco de dados
npx prisma migrate dev

# Criar usuário de teste
curl http://localhost:3000/api/seed

# Iniciar servidor
npm run dev
```

Acesse http://localhost:3000 e faça login com:
- **Email**: admin@medical.com
- **Senha**: 123456

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI**: Ant Design + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite + Prisma ORM
- **Auth**: NextAuth v5

## 📁 Estrutura do Projeto

```
├── app/
│   ├── (auth)/login/          # Autenticação
│   ├── (dashboard)/           # Área protegida
│   │   └── dashboard/
│   │       ├── page.tsx       # Dashboard
│   │       ├── patients/      # Gestão de pacientes
│   │       └── laudos/        # Gestão de laudos
│   └── api/                   # API Routes
├── lib/
│   ├── auth/                  # Configuração NextAuth
│   └── prisma/                # Prisma client
├── hooks/                     # Custom hooks (usePatients, useLaudos)
├── prisma/
│   └── schema.prisma          # Schema do banco
└── types/                     # TypeScript definitions
```

## 👥 Tipos de Usuário

### Médico Administrador (DOCTOR_ADMIN)
- Visualiza todos os pacientes
- Cria e gerencia pacientes
- Cria e visualiza laudos

### Médico (DOCTOR)
- Visualiza apenas seus pacientes
- Cria e gerencia seus pacientes
- Cria e visualiza laudos de seus pacientes

### Paciente (PATIENT)
- Visualiza apenas seus próprios laudos
- Acesso somente leitura

## 🔑 Features

- ✅ Autenticação com NextAuth v5
- ✅ Autorização baseada em roles
- ✅ CRUD completo de pacientes
- ✅ CRUD completo de laudos
- ✅ Interface responsiva com Ant Design
- ✅ TypeScript end-to-end
- ✅ SQLite (fácil para desenvolvimento)
- ✅ Custom hooks para data fetching

## 📊 Modelo de Dados

```
User
  ├── Doctor (CRM, especialidade, role)
  │   └── N Patients
  └── Patient (CPF, data nascimento, etc)
      └── N Laudos (título, descrição, diagnóstico)
```

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Visualizar banco de dados
npx prisma studio

# Nova migração
npx prisma migrate dev --name nome_da_migracao

# Regenerar Prisma Client
npx prisma generate

# Build para produção
npm run build
npm start
```

## 📝 Próximos Passos

Para continuar o desenvolvimento, você pode:

1. **Adicionar Upload de Arquivos**: Implementar upload de imagens/PDFs para laudos
2. **Relatórios**: Adicionar geração de relatórios em PDF
3. **Notificações**: Sistema de notificações para novos laudos
4. **Filtros Avançados**: Busca e filtros nas listagens
5. **Exportação**: Exportar dados para Excel/CSV
6. **Testes**: Adicionar testes unitários e E2E
7. **Docker**: Containerizar a aplicação
8. **Deploy**: Configurar CI/CD e deploy em produção

## 📚 Documentação Adicional

Veja `.github/copilot-instructions.md` para documentação detalhada da arquitetura, convenções de código e workflows de desenvolvimento.


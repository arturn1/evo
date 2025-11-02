# Copilot Instructions - Sistema de Gerenciamento de Pacientes

## Project Overview

Aplicação Next.js 14+ com TypeScript para gerenciamento médico de pacientes e laudos. Sistema multi-tenant com autenticação baseada em roles (Médico Admin, Médico, Paciente) usando NextAuth v5, Prisma ORM com SQLite, e Ant Design para UI.

## Architecture

### Tech Stack
- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Ant Design, Tailwind CSS
- **Backend**: Next.js API Routes (app/api/)
- **Database**: SQLite com Prisma ORM
- **Auth**: NextAuth v5 (credentials provider com bcrypt)
- **State**: Custom hooks para data fetching

### Data Model (Prisma Schema)

```prisma
User (email, password, userType: DOCTOR|PATIENT)
  ├── Doctor (crm, speciality, role: DOCTOR|DOCTOR_ADMIN)
  │   └── has many Patients
  └── Patient (cpf, birthDate, phone, address)
      ├── belongs to one Doctor
      └── has many Laudos

Laudo (title, description, diagnosis, examDate, attachments)
  └── belongs to Patient
```

### Directory Structure

```
app/
├── (auth)/login/          # Página de login
├── (dashboard)/           # Layout com sidebar/header
│   └── dashboard/
│       ├── page.tsx       # Dashboard principal
│       ├── patients/      # CRUD de pacientes (só médicos)
│       └── laudos/        # CRUD de laudos
├── api/                   # API Routes
│   ├── auth/[...nextauth] # NextAuth handlers
│   ├── patients/          # CRUD pacientes
│   ├── laudos/            # CRUD laudos
│   ├── doctors/           # Registro médicos
│   └── seed/              # Seed inicial
lib/
├── auth/auth.ts           # NextAuth config
├── prisma/db.ts           # Prisma client singleton
hooks/
├── usePatients.ts         # Hook para API de pacientes
└── useLaudos.ts           # Hook para API de laudos
types/
└── next-auth.d.ts         # Type extensions NextAuth
prisma/
└── schema.prisma          # Database schema
```

## Development Workflow

### Setup Inicial
```bash
npm install
npx prisma migrate dev  # Cria banco SQLite
npm run dev             # http://localhost:3000
```

### Criar Usuário de Teste
```bash
curl http://localhost:3000/api/seed
# Login: admin@medical.com / 123456 (DOCTOR_ADMIN)
```

### Database Commands
```bash
npx prisma studio         # UI para visualizar DB
npx prisma migrate dev    # Nova migração
npx prisma generate       # Regenerar client
```

## Code Conventions

### API Routes Pattern
- **GET**: Listar com filtros por role (médicos veem seus pacientes, pacientes veem só seus dados)
- **POST**: Criar entidade com validação Zod
- Sempre incluir `auth()` check no início
- Retornar `{ error }` em caso de erro

### Custom Hooks Pattern
```typescript
export function useEntity() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const fetchData = useCallback(async () => { ... }, [])
  const createEntity = useCallback(async (data) => { ... }, [])
  
  useEffect(() => { fetchData() }, [])
  
  return { data, loading, error, refetch: fetchData, createEntity }
}
```

### Authorization Logic
- **Middleware** (`middleware.ts`): Redireciona não-autenticados para `/login`
- **API Routes**: Checam `session.user.userType` e `session.user.role`
- **UI**: Componentes condicionais baseados em `useSession()`

### Prisma Patterns
- Client singleton em `lib/prisma/db.ts` (previne múltiplas instâncias)
- Usar `include` para eager loading de relacionamentos
- SQLite não suporta arrays primitivos: usar JSON strings para `attachments`

### Ant Design Integration
- Wrapped com `AntdRegistry` em `app/layout.tsx`
- Locale pt-BR configurado no `ConfigProvider`
- Usar `message` para feedback, `Modal` para confirmações
- Formulários com `Form.Item` + validação inline

## Key Files

- `lib/auth/auth.ts`: Config completa NextAuth com callbacks JWT/session
- `types/next-auth.d.ts`: Extensões de tipos para session (userType, role, doctorId, patientId)
- `middleware.ts`: Proteção de rotas e redirecionamento
- `prisma/schema.prisma`: Schema completo com enums e relacionamentos
- `hooks/usePatients.ts`, `hooks/useLaudos.ts`: Padrão de hooks reutilizáveis

## Role-Based Views

### DOCTOR_ADMIN
- Vê todos os pacientes de todos os médicos
- Pode criar pacientes, laudos
- Acessa: Dashboard, Pacientes, Laudos

### DOCTOR
- Vê apenas seus próprios pacientes
- Pode criar pacientes (auto-associados), laudos
- Acessa: Dashboard, Pacientes, Laudos

### PATIENT
- Vê apenas seus próprios laudos
- Read-only
- Acessa: Dashboard, Laudos

## Common Tasks

### Adicionar Nova Entidade
1. Atualizar `prisma/schema.prisma`
2. `npx prisma migrate dev --name add_entity`
3. Criar `/app/api/entity/route.ts` (GET/POST)
4. Criar `/hooks/useEntity.ts`
5. Criar página em `/app/(dashboard)/dashboard/entity/`

### Adicionar Campo ao Schema
```bash
# Editar schema.prisma
npx prisma migrate dev --name add_field_name
npx prisma generate
```

### Debug Autenticação
- Verificar `.env` tem `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Checar `session` com `useSession()` ou `await auth()` server-side
- Confirmar `types/next-auth.d.ts` tem extensões necessárias

### Deploy Checklist
- Trocar SQLite por PostgreSQL/MySQL para produção
- Gerar `NEXTAUTH_SECRET` seguro: `openssl rand -base64 32`
- Configurar variáveis de ambiente no host
- Rodar migrations: `npx prisma migrate deploy`

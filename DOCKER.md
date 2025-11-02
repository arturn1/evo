# 🐳 Docker - Sistema de Gerenciamento de Pacientes

## Executar com Docker

### 1. Build da imagem

```bash
docker build -t medical-system .
```

### 2. Executar com Docker Compose

```bash
# Criar arquivo .env com suas variáveis
cp .env.example .env

# Editar .env e adicionar NEXTAUTH_SECRET
# Gerar secret: openssl rand -base64 32

# Iniciar aplicação
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar aplicação
docker-compose down
```

### 3. Executar container manualmente

```bash
docker run -d \
  --name medical-system \
  -p 3000:3000 \
  -e DATABASE_URL="file:./dev.db" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e NEXTAUTH_SECRET="seu-secret-aqui" \
  -v $(pwd)/prisma:/app/prisma \
  medical-system
```

### 4. Executar migrations no container

```bash
docker-compose exec app npx prisma migrate deploy
```

### 5. Criar usuário seed

```bash
docker-compose exec app node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function seed() {
  const prisma = new PrismaClient();
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const user = await prisma.user.create({
    data: {
      name: 'Admin Medical',
      email: 'admin@medical.com',
      password: hashedPassword,
      userType: 'DOCTOR',
      doctor: {
        create: {
          crm: '123456',
          speciality: 'Clínico Geral',
          role: 'DOCTOR_ADMIN',
        }
      }
    }
  });
  
  console.log('✅ Usuário criado:', user.email);
}

seed();
"
```

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL do banco de dados | `file:./dev.db` |
| `NEXTAUTH_URL` | URL da aplicação | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret do NextAuth | Gerar com `openssl rand -base64 32` |

## Estrutura do Dockerfile

- **Multi-stage build** para otimizar tamanho da imagem
- **Node 20 Alpine** (imagem leve)
- **Usuário não-root** para segurança
- **Standalone output** do Next.js para produção

## Acessar aplicação

Após iniciar, acesse: http://localhost:3000

**Credenciais padrão:**
- Email: `admin@medical.com`
- Senha: `123456`

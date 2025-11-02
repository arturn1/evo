const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Criando usuário de teste...')

  const hashedPassword = await bcrypt.hash('123456', 10)

  const user = await prisma.user.create({
    data: {
      email: 'admin@medical.com',
      name: 'Dr. Admin',
      password: hashedPassword,
      userType: 'DOCTOR',
      doctor: {
        create: {
          crm: '12345-SP',
          speciality: 'Cardiologia',
          role: 'DOCTOR_ADMIN',
        },
      },
    },
    include: {
      doctor: true,
    },
  })

  console.log('✅ Usuário criado com sucesso!')
  console.log('📧 Email:', user.email)
  console.log('🔑 Senha: 123456')
  console.log('👤 Tipo:', user.userType)
  console.log('⚕️  Role:', user.doctor?.role)
}

main()
  .catch((e) => {
    if (e.code === 'P2002') {
      console.log('ℹ️  Usuário já existe!')
      console.log('📧 Email: admin@medical.com')
      console.log('🔑 Senha: 123456')
      process.exit(0)
    } else {
      console.error('❌ Erro:', e.message)
      process.exit(1)
    }
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

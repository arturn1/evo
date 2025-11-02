import { prisma } from '@/lib/prisma/db'
import { NextRequest, NextResponse } from 'next/server'

// GET - Endpoint de seed para criar usuário inicial de teste
export async function GET(request: NextRequest) {
  try {
    const bcrypt = require('bcryptjs')

    // Criar médico admin de teste
    const hashedPassword = await bcrypt.hash('123456', 10)

    const doctor = await prisma.user.create({
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

    return NextResponse.json({
      message: 'Usuário de teste criado com sucesso!',
      credentials: {
        email: 'admin@medical.com',
        password: '123456',
        type: 'DOCTOR_ADMIN',
      },
      doctor,
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Usuário de teste já existe', email: 'admin@medical.com', password: '123456' },
        { status: 200 }
      )
    }
    console.error('Erro ao criar seed:', error)
    return NextResponse.json({ error: 'Erro ao criar seed' }, { status: 500 })
  }
}

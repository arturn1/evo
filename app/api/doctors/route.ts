import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma/db'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const doctorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  crm: z.string().min(5),
  speciality: z.string().min(3),
  role: z.enum(['DOCTOR', 'DOCTOR_ADMIN']).optional(),
})

// GET - Listar médicos (apenas DOCTOR_ADMIN)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas DOCTOR_ADMIN pode listar médicos
    const doctor = await prisma.doctor.findUnique({
      where: { id: session.user.doctorId! },
    })

    if (doctor?.role !== 'DOCTOR_ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const whereClause = includeInactive ? {} : { active: true }

    const doctors = await prisma.doctor.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { patients: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(doctors)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}

// POST - Criar novo médico (apenas DOCTOR_ADMIN)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas DOCTOR_ADMIN pode criar médicos
    const currentDoctor = await prisma.doctor.findUnique({
      where: { id: session.user.doctorId! },
    })

    if (currentDoctor?.role !== 'DOCTOR_ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const data = doctorSchema.parse(body)

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const doctor = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        userType: 'DOCTOR',
        doctor: {
          create: {
            crm: data.crm,
            speciality: data.speciality,
            role: data.role || 'DOCTOR',
          },
        },
      },
      include: {
        doctor: true,
      },
    })

    return NextResponse.json(
      { message: 'Médico criado com sucesso', doctor },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}

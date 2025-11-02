import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const patientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  cpf: z.string().length(11),
  birthDate: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  password: z.string().min(6),
})

// GET - Listar pacientes
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { userType, doctorId } = session.user
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    let patients

    if (userType === 'DOCTOR') {
      // Médico vê apenas seus pacientes (ou todos se for admin)
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId! },
      })

      const whereClause = includeInactive ? {} : { active: true }

      if (doctor?.role === 'DOCTOR_ADMIN') {
        patients = await prisma.patient.findMany({
          where: whereClause,
          include: {
            user: { select: { name: true, email: true } },
            doctor: { include: { user: { select: { name: true } } } },
            _count: { select: { laudos: true } },
          },
          orderBy: { createdAt: 'desc' },
        })
      } else {
        patients = await prisma.patient.findMany({
          where: { doctorId: doctorId!, ...whereClause },
          include: {
            user: { select: { name: true, email: true } },
            doctor: { include: { user: { select: { name: true } } } },
            _count: { select: { laudos: true } },
          },
          orderBy: { createdAt: 'desc' },
        })
      }
    } else {
      // Paciente vê apenas seus próprios dados
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    return NextResponse.json(patients)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}

// POST - Criar novo paciente
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.userType !== 'DOCTOR') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const data = patientSchema.parse(body)

    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const patient = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        userType: 'PATIENT',
        patient: {
          create: {
            cpf: data.cpf,
            birthDate: new Date(data.birthDate),
            phone: data.phone,
            address: data.address,
            doctorId: session.user.doctorId!,
          },
        },
      },
      include: {
        patient: true,
      },
    })

    return NextResponse.json(patient, { status: 201 })
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

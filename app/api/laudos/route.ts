import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const laudoSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  diagnosis: z.string().min(10),
  examDate: z.string(),
  patientId: z.string(),
  attachments: z.array(z.string()).optional(),
})

// GET - Listar laudos
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    const { userType, doctorId, patientId: userPatientId } = session.user

    let laudos

    if (userType === 'DOCTOR') {
      // Médico vê laudos de seus pacientes
      const whereClause: any = {
        patient: { doctorId: doctorId! },
      }

      if (patientId) {
        whereClause.patientId = patientId
      }

      laudos = await prisma.laudo.findMany({
        where: whereClause,
        include: {
          patient: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
        orderBy: { examDate: 'desc' },
      })
    } else if (userType === 'PATIENT') {
      // Paciente vê apenas seus laudos
      laudos = await prisma.laudo.findMany({
        where: { patientId: userPatientId! },
        include: {
          patient: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
        orderBy: { examDate: 'desc' },
      })
    } else {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Parse attachments JSON
    const laudosWithAttachments = laudos.map(laudo => ({
      ...laudo,
      attachments: JSON.parse(laudo.attachments || '[]'),
    }))

    return NextResponse.json(laudosWithAttachments)
  } catch (error) {
    console.error('Erro ao buscar laudos:', error)
    return NextResponse.json({ error: 'Erro ao buscar laudos' }, { status: 500 })
  }
}

// POST - Criar novo laudo
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.userType !== 'DOCTOR') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const data = laudoSchema.parse(body)

    // Verificar se o paciente pertence ao médico
    const patient = await prisma.patient.findFirst({
      where: {
        id: data.patientId,
        doctorId: session.user.doctorId!,
      },
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente não encontrado ou não pertence a este médico' },
        { status: 404 }
      )
    }

    const laudo = await prisma.laudo.create({
      data: {
        title: data.title,
        description: data.description,
        diagnosis: data.diagnosis,
        examDate: new Date(data.examDate),
        patientId: data.patientId,
        attachments: JSON.stringify(data.attachments || []),
      },
      include: {
        patient: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json(
      {
        ...laudo,
        attachments: JSON.parse(laudo.attachments),
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Erro ao criar laudo:', error)
    return NextResponse.json({ error: 'Erro ao criar laudo' }, { status: 500 })
  }
}

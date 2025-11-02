import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updatePatientSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  cpf: z.string().length(11).optional(),
  birthDate: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

// PATCH - Editar paciente (apenas pelo médico criador)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.userType !== 'DOCTOR') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const data = updatePatientSchema.parse(body)

    // Verificar se o paciente existe e pertence ao médico
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 })
    }

    // Verificar se o médico é o criador do paciente (ou é admin)
    const doctor = await prisma.doctor.findUnique({
      where: { id: session.user.doctorId! },
    })

    if (patient.doctorId !== session.user.doctorId && doctor?.role !== 'DOCTOR_ADMIN') {
      return NextResponse.json(
        { error: 'Você só pode editar pacientes criados por você' },
        { status: 403 }
      )
    }

    // Atualizar dados do usuário e paciente
    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        cpf: data.cpf,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        phone: data.phone,
        address: data.address,
        user: {
          update: {
            name: data.name,
            email: data.email,
          },
        },
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    })

    return NextResponse.json(updatedPatient)
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

// DELETE - Desabilitar paciente (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.userType !== 'DOCTOR') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Verificar se o paciente existe e pertence ao médico
    const patient = await prisma.patient.findUnique({
      where: { id },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 })
    }

    // Verificar se o médico é o criador do paciente (ou é admin)
    const doctor = await prisma.doctor.findUnique({
      where: { id: session.user.doctorId! },
    })

    if (patient.doctorId !== session.user.doctorId && doctor?.role !== 'DOCTOR_ADMIN') {
      return NextResponse.json(
        { error: 'Você só pode desabilitar pacientes criados por você' },
        { status: 403 }
      )
    }

    // Soft delete - apenas marcar como inativo
    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json({
      message: 'Paciente desabilitado com sucesso',
      patient: updatedPatient
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}

// PUT - Reabilitar paciente (reverter soft delete)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.userType !== 'DOCTOR') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Verificar se o paciente existe
    const patient = await prisma.patient.findUnique({
      where: { id },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 })
    }

    // Verificar se o médico é o criador do paciente (ou é admin)
    const doctor = await prisma.doctor.findUnique({
      where: { id: session.user.doctorId! },
    })

    if (patient.doctorId !== session.user.doctorId && doctor?.role !== 'DOCTOR_ADMIN') {
      return NextResponse.json(
        { error: 'Você só pode reabilitar pacientes criados por você' },
        { status: 403 }
      )
    }

    // Reabilitar paciente
    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: { active: true },
    })

    return NextResponse.json({
      message: 'Paciente reabilitado com sucesso',
      patient: updatedPatient
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}

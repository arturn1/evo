import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateDoctorSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  crm: z.string().min(5).optional(),
  speciality: z.string().min(3).optional(),
  role: z.enum(['DOCTOR', 'DOCTOR_ADMIN']).optional(),
})

// PATCH - Editar médico (apenas DOCTOR_ADMIN)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas DOCTOR_ADMIN pode editar médicos
    const currentDoctor = await prisma.doctor.findUnique({
      where: { id: session.user.doctorId! },
    })

    if (currentDoctor?.role !== 'DOCTOR_ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const data = updateDoctorSchema.parse(body)

    // Verificar se o médico existe
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Médico não encontrado' }, { status: 404 })
    }

    // Impedir que o admin se auto-desabilite editando sua própria role
    if (id === session.user.doctorId && data.role === 'DOCTOR') {
      return NextResponse.json(
        { error: 'Você não pode remover seu próprio acesso de administrador' },
        { status: 400 }
      )
    }

    // Atualizar dados do usuário e médico
    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        crm: data.crm,
        speciality: data.speciality,
        role: data.role,
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

    return NextResponse.json(updatedDoctor)
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

// DELETE - Desabilitar médico (soft delete - apenas DOCTOR_ADMIN)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas DOCTOR_ADMIN pode desabilitar médicos
    const currentDoctor = await prisma.doctor.findUnique({
      where: { id: session.user.doctorId! },
    })

    if (currentDoctor?.role !== 'DOCTOR_ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params

    // Impedir auto-desabilitação
    if (id === session.user.doctorId) {
      return NextResponse.json(
        { error: 'Você não pode desabilitar sua própria conta' },
        { status: 400 }
      )
    }

    // Verificar se o médico existe
    const doctor = await prisma.doctor.findUnique({
      where: { id },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Médico não encontrado' }, { status: 404 })
    }

    // Soft delete - apenas marcar como inativo
    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json({
      message: 'Médico desabilitado com sucesso',
      doctor: updatedDoctor
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}

// PUT - Reabilitar médico (reverter soft delete - apenas DOCTOR_ADMIN)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas DOCTOR_ADMIN pode reabilitar médicos
    const currentDoctor = await prisma.doctor.findUnique({
      where: { id: session.user.doctorId! },
    })

    if (currentDoctor?.role !== 'DOCTOR_ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params

    // Verificar se o médico existe
    const doctor = await prisma.doctor.findUnique({
      where: { id },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Médico não encontrado' }, { status: 404 })
    }

    // Reabilitar médico
    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: { active: true },
    })

    return NextResponse.json({
      message: 'Médico reabilitado com sucesso',
      doctor: updatedDoctor
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}

import { prisma } from "@/lib/prisma/db"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        doctor: true,
        patient: {
          include: {
            doctor: true,
          },
        },
      },
    })

    // Não informar se usuário existe ou não (segurança)
    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas. Verifique seus dados e tente novamente." },
        { status: 401 }
      )
    }

    // Verificar senha antes de checar status da conta
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Credenciais inválidas. Verifique seus dados e tente novamente." },
        { status: 401 }
      )
    }

    // Verificar se é médico e se está ativo
    if (user.userType === 'DOCTOR' && user.doctor && !user.doctor.active) {
      return NextResponse.json(
        { error: "Acesso negado. Entre em contato com o administrador." },
        { status: 403 }
      )
    }

    // Verificar se é paciente e se está ativo
    if (user.userType === 'PATIENT' && user.patient && !user.patient.active) {
      return NextResponse.json(
        { error: "Acesso negado. Entre em contato com o suporte." },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos. Verifique os campos." },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erro ao processar solicitação. Tente novamente." },
      { status: 500 }
    )
  }
}
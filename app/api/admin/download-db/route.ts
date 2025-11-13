import { auth } from '@/lib/auth/auth'
import fs from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'DOCTOR_ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem baixar o backup.' },
        { status: 403 }
      )
    }

    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')

    if (!fs.existsSync(dbPath)) {
      return NextResponse.json(
        { error: 'Arquivo de banco de dados não encontrado' },
        { status: 404 }
      )
    }

    const fileBuffer = fs.readFileSync(dbPath)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const fileName = `backup-${timestamp}.db`

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/x-sqlite3',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}

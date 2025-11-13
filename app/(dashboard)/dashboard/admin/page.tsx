'use client'

import { DatabaseOutlined, DownloadOutlined, WarningOutlined } from '@ant-design/icons'
import { Alert, App, Button, Card, Descriptions, Space, Typography } from 'antd'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const { Title, Text } = Typography

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { message } = App.useApp()
  const [downloading, setDownloading] = useState(false)

  if (session?.user.role !== 'DOCTOR_ADMIN') {
    router.push('/dashboard')
    return null
  }

  const handleDownloadDatabase = async () => {
    try {
      setDownloading(true)
      message.loading({ content: 'Preparando backup...', key: 'download' })

      const response = await fetch('/api/admin/download-db')

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao baixar backup')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      const contentDisposition = response.headers.get('Content-Disposition')
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `backup-${new Date().toISOString()}.db`

      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      message.success({ content: 'Backup baixado com sucesso!', key: 'download' })
    } catch (error) {
      message.error({
        content: error instanceof Error ? error.message : 'Erro ao baixar backup',
        key: 'download',
      })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      <Title level={2}>Administração do Sistema</Title>
      <Text type="secondary">Gerenciamento e configurações avançadas</Text>

      <Card
        title={
          <Space>
            <DatabaseOutlined />
            <span>Backup do Banco de Dados</span>
          </Space>
        }
        style={{ marginTop: 24 }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            message="Atenção"
            description="O backup contém todos os dados do sistema incluindo usuários, pacientes, laudos e senhas (criptografadas). Mantenha o arquivo em local seguro."
            type="warning"
            icon={<WarningOutlined />}
            showIcon
          />

          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tipo de Banco">SQLite</Descriptions.Item>
            <Descriptions.Item label="Formato do Arquivo">.db (SQLite Database)</Descriptions.Item>
            <Descriptions.Item label="Conteúdo">
              Todos os registros de usuários, médicos, pacientes e laudos
            </Descriptions.Item>
            <Descriptions.Item label="Nome do Arquivo">
              backup-[timestamp].db
            </Descriptions.Item>
          </Descriptions>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size="large"
            onClick={handleDownloadDatabase}
            loading={downloading}
            block
          >
            Baixar Backup do Banco de Dados
          </Button>

          <Alert
            message="Como restaurar o backup"
            description={
              <ol style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>Pare a aplicação (docker compose down ou npm stop)</li>
                <li>Substitua o arquivo prisma/dev.db pelo arquivo de backup</li>
                <li>Reinicie a aplicação (docker compose up ou npm run dev)</li>
              </ol>
            }
            type="info"
          />
        </Space>
      </Card>
    </div>
  )
}

'use client'

import { useLaudos } from '@/hooks/useLaudos'
import { usePatients } from '@/hooks/usePatients'
import { FileTextOutlined, UserOutlined } from '@ant-design/icons'
import { Card, Col, Row, Statistic, Typography } from 'antd'
import { useSession } from 'next-auth/react'

const { Title } = Typography

export default function DashboardPage() {
  const { data: session } = useSession()
  const { patients, loading: loadingPatients } = usePatients()
  const { laudos, loading: loadingLaudos } = useLaudos()

  const isDoctor = session?.user.userType === 'DOCTOR'
  const isDoctorAdmin = session?.user.role === 'DOCTOR_ADMIN'

  return (
    <div>
      <Title level={2}>
        Bem-vindo, {session?.user.name}!
      </Title>
      <Title level={5} type="secondary">
        {isDoctor
          ? isDoctorAdmin
            ? 'Médico Administrador'
            : 'Médico'
          : 'Paciente'}
      </Title>

      <Row gutter={16} style={{ marginTop: 24 }}>
        {isDoctor && (
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Total de Pacientes"
                value={patients.length}
                prefix={<UserOutlined />}
                loading={loadingPatients}
              />
            </Card>
          </Col>
        )}
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title={isDoctor ? 'Total de Laudos' : 'Meus Laudos'}
              value={laudos.length}
              prefix={<FileTextOutlined />}
              loading={loadingLaudos}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

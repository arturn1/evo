'use client'

import { useLaudos } from '@/hooks/useLaudos'
import { usePatients } from '@/hooks/usePatients'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  PaperClipOutlined,
  PlusOutlined,
  UserOutlined
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message
} from 'antd'
import dayjs from 'dayjs'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

const { Title, Text, Paragraph } = Typography

function LaudosContent() {
  const searchParams = useSearchParams()
  const patientIdFilter = searchParams.get('patientId')

  const { laudos, loading, createLaudo } = useLaudos(patientIdFilter || undefined)
  const { patients } = usePatients()
  const { data: session } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedLaudo, setSelectedLaudo] = useState<any>(null)
  const [form] = Form.useForm()

  const isDoctor = session?.user.userType === 'DOCTOR'

  const handleCreate = async (values: any) => {
    try {
      await createLaudo({
        ...values,
        examDate: values.examDate.format('YYYY-MM-DD'),
      })
      message.success('Laudo criado com sucesso!')
      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      message.error('Erro ao criar laudo')
    }
  }

  const columns = [
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Paciente',
      dataIndex: ['patient', 'user', 'name'],
      key: 'patient',
    },
    {
      title: 'Data do Exame',
      dataIndex: 'examDate',
      key: 'examDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Diagnóstico',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      ellipsis: true,
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setSelectedLaudo(record)
              setIsDetailModalOpen(true)
            }}
          >
            Ver Detalhes
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>Laudos {patientIdFilter && '- Filtrados por Paciente'}</h1>
        {isDoctor && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Novo Laudo
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={laudos}
        loading={loading}
        rowKey="id"
      />

      {isDoctor && (
        <Modal
          title="Novo Laudo"
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false)
            form.resetFields()
          }}
          footer={null}
          width={800}
        >
          <Form form={form} layout="vertical" onFinish={handleCreate}>
            <Form.Item
              name="patientId"
              label="Paciente"
              rules={[{ required: true, message: 'Campo obrigatório' }]}
              initialValue={patientIdFilter || undefined}
            >
              <Select
                placeholder="Selecione um paciente"
                showSearch
                optionFilterProp="children"
              >
                {patients.map((patient) => (
                  <Select.Option key={patient.id} value={patient.id}>
                    {patient.user.name} - {patient.cpf}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="title"
              label="Título"
              rules={[{ required: true, message: 'Campo obrigatório' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="examDate"
              label="Data do Exame"
              rules={[{ required: true, message: 'Campo obrigatório' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Descrição"
              rules={[{ required: true, message: 'Campo obrigatório' }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name="diagnosis"
              label="Diagnóstico"
              rules={[{ required: true, message: 'Campo obrigatório' }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setIsModalOpen(false)
                  form.resetFields()
                }}>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit">
                  Criar
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      )}

      {/* Modal de Detalhes do Laudo - Moderno e Informativo */}
      <Modal
        title={null}
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false)
          setSelectedLaudo(null)
        }}
        footer={null}
        width={900}
        style={{ top: 100 }}
      >
        {selectedLaudo && (
          <div>
            {/* Header do Modal */}
            <div style={{
              background: '#001529',
              padding: '24px',
              margin: '-24px -24px 24px -24px',
              borderRadius: '8px 8px 0 0'
            }}>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                <FileTextOutlined style={{ marginRight: 12 }} />
                {selectedLaudo.title}
              </Title>
              <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Tag color="blue">
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {dayjs(selectedLaudo.examDate).format('DD/MM/YYYY')}
                </Tag>
                <Tag color="cyan">
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  Criado em {dayjs(selectedLaudo.createdAt).format('DD/MM/YYYY')}
                </Tag>
              </div>
            </div>

            {/* Informações do Paciente */}
            <Card
              size="small"
              style={{ marginBottom: 24, background: '#f0f5ff', borderColor: '#1890ff' }}
              bodyStyle={{ padding: '16px' }}
            >
              <Row gutter={16}>
                <Col span={24}>
                  <Space size="large">
                    <div>
                      <UserOutlined style={{ fontSize: 18, color: '#1890ff', marginRight: 8 }} />
                      <Text strong>Paciente:</Text>
                      <br />
                      <Text style={{ fontSize: 16, marginLeft: 26 }}>
                        {selectedLaudo.patient.user.name}
                      </Text>
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Descrição */}
            <div style={{ marginBottom: 24 }}>
              <Title level={5} style={{ color: '#1890ff', marginBottom: 12 }}>
                <FileTextOutlined style={{ marginRight: 8 }} />
                Descrição do Exame
              </Title>
              <Card
                size="small"
                bodyStyle={{ background: '#fafafa' }}
              >
                <Paragraph
                  style={{
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    lineHeight: 1.8
                  }}
                >
                  {selectedLaudo.description}
                </Paragraph>
              </Card>
            </div>

            <Divider style={{ margin: '24px 0' }} />

            {/* Diagnóstico */}
            <div style={{ marginBottom: 24 }}>
              <Title level={5} style={{ color: '#1890ff', marginBottom: 12 }}>
                <MedicineBoxOutlined style={{ marginRight: 8 }} />
                Diagnóstico
              </Title>
              <Card
                size="small"
                bodyStyle={{ background: '#fff7e6', borderLeft: '4px solid #1890ff' }}
              >
                <Paragraph
                  style={{
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    lineHeight: 1.8,
                    fontWeight: 500
                  }}
                >
                  {selectedLaudo.diagnosis}
                </Paragraph>
              </Card>
            </div>

            {/* Anexos */}
            {selectedLaudo.attachments && selectedLaudo.attachments.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <Title level={5} style={{ color: '#1890ff', marginBottom: 12 }}>
                  <PaperClipOutlined style={{ marginRight: 8 }} />
                  Anexos ({selectedLaudo.attachments.length})
                </Title>
                <Card size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {selectedLaudo.attachments.map((att: string, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          padding: '8px 12px',
                          background: '#f0f5ff',
                          borderRadius: 4,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <PaperClipOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                        <Text>{att}</Text>
                      </div>
                    ))}
                  </Space>
                </Card>
              </div>
            )}

            {/* Footer com botão */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              paddingTop: 16,
              borderTop: '1px solid #f0f0f0'
            }}>
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  setIsDetailModalOpen(false)
                  setSelectedLaudo(null)
                }}
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default function LaudosPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LaudosContent />
    </Suspense>
  )
}
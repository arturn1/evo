'use client'

import { UpdatePatientData, usePatients } from '@/hooks/usePatients'
import {
  CheckCircleOutlined,
  EditOutlined,
  FileTextOutlined,
  PlusOutlined,
  StopOutlined
} from '@ant-design/icons'
import { App, Button, DatePicker, Form, Input, Modal, Space, Table, Tag, Tooltip } from 'antd'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function PatientsPage() {
  const { patients, loading, createPatient, updatePatient, toggleActive } = usePatients(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [patientToToggle, setPatientToToggle] = useState<any>(null)
  const [editingPatient, setEditingPatient] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()
  const router = useRouter()
  const { message } = App.useApp()

  const handleCreate = async (values: any) => {
    try {
      setSubmitting(true)
      await createPatient({
        ...values,
        birthDate: values.birthDate.format('YYYY-MM-DD'),
      })
      message.success('Paciente criado com sucesso!')
      setIsCreateModalOpen(false)
      createForm.resetFields()
    } catch (error: any) {
      const errorMessage = error?.message || ''

      if (errorMessage.includes('email')) {
        message.error('Email já cadastrado. Utilize outro email.')
      } else if (errorMessage.includes('cpf')) {
        message.error('CPF já cadastrado. Verifique os dados.')
      } else if (errorMessage.includes('Não autorizado')) {
        message.error('Operação não autorizada.')
      } else {
        message.error('Erro ao processar solicitação. Tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (values: any) => {
    try {
      setSubmitting(true)
      const data: UpdatePatientData = {
        ...values,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : undefined,
      }
      await updatePatient(editingPatient.id, data)
      message.success('Paciente atualizado com sucesso!')
      setIsEditModalOpen(false)
      setEditingPatient(null)
      editForm.resetFields()
    } catch (error: any) {
      const errorMessage = error?.message || ''

      if (errorMessage.includes('email')) {
        message.error('Email já cadastrado. Utilize outro email.')
      } else if (errorMessage.includes('cpf')) {
        message.error('CPF já cadastrado. Verifique os dados.')
      } else if (errorMessage.includes('não encontrado')) {
        message.error('Registro não encontrado.')
      } else if (errorMessage.includes('editar pacientes criados por você')) {
        message.error('Operação não autorizada.')
      } else {
        message.error('Erro ao processar solicitação. Tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = (patient: any) => {
    setPatientToToggle(patient)
    setIsConfirmModalOpen(true)
  }

  const confirmToggleActive = async () => {
    if (!patientToToggle) return

    try {
      setSubmitting(true)
      await toggleActive(patientToToggle.id, patientToToggle.active)
      message.success(
        patientToToggle.active
          ? 'Paciente desabilitado com sucesso!'
          : 'Paciente reabilitado com sucesso!'
      )
      setIsConfirmModalOpen(false)
      setPatientToToggle(null)
    } catch (error: any) {
      const errorMessage = error?.message || ''

      if (errorMessage.includes('não encontrado')) {
        message.error('Registro não encontrado.')
      } else if (errorMessage.includes('desabilitar pacientes criados por você')) {
        message.error('Operação não autorizada.')
      } else {
        message.error('Erro ao processar solicitação. Tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (patient: any) => {
    setEditingPatient(patient)
    editForm.setFieldsValue({
      name: patient.user.name,
      email: patient.user.email,
      cpf: patient.cpf,
      birthDate: dayjs(patient.birthDate),
      phone: patient.phone,
      address: patient.address,
    })
    setIsEditModalOpen(true)
  }

  const columns = [
    {
      title: 'Nome',
      dataIndex: ['user', 'name'],
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: ['user', 'email'],
      key: 'email',
    },
    {
      title: 'CPF',
      dataIndex: 'cpf',
      key: 'cpf',
    },
    {
      title: 'Telefone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || '-',
    },
    {
      title: 'Laudos',
      dataIndex: ['_count', 'laudos'],
      key: 'laudos',
      render: (count: number) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'default'} icon={active ? <CheckCircleOutlined /> : <StopOutlined />}>
          {active ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Ver Laudos">
            <Button
              type="link"
              icon={<FileTextOutlined />}
              onClick={() => router.push(`/dashboard/laudos?patientId=${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title={record.active ? 'Desabilitar' : 'Reabilitar'}>
            <Button
              type="link"
              danger={record.active}
              icon={record.active ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={() => handleToggleActive(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>Gerenciar Pacientes</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
          Novo Paciente
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={patients}
        loading={loading}
        rowKey="id"
      />

      {/* Modal de Criação */}
      <Modal
        title="Novo Paciente"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false)
          createForm.resetFields()
        }}
        footer={null}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Nome"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Campo obrigatório' },
              { type: 'email', message: 'Email inválido' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="cpf"
            label="CPF"
            rules={[
              { required: true, message: 'Campo obrigatório' },
              { len: 11, message: 'CPF deve ter 11 dígitos' },
            ]}
          >
            <Input maxLength={11} />
          </Form.Item>
          <Form.Item
            name="birthDate"
            label="Data de Nascimento"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="phone" label="Telefone">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Endereço">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="password"
            label="Senha"
            rules={[
              { required: true, message: 'Campo obrigatório' },
              { min: 6, message: 'Senha deve ter no mínimo 6 caracteres' },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsCreateModalOpen(false)
                createForm.resetFields()
              }}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Criar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        title="Editar Paciente"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false)
          setEditingPatient(null)
          editForm.resetFields()
        }}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item
            name="name"
            label="Nome"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Campo obrigatório' },
              { type: 'email', message: 'Email inválido' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="cpf"
            label="CPF"
            rules={[
              { required: true, message: 'Campo obrigatório' },
              { len: 11, message: 'CPF deve ter 11 dígitos' },
            ]}
          >
            <Input maxLength={11} />
          </Form.Item>
          <Form.Item
            name="birthDate"
            label="Data de Nascimento"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="phone" label="Telefone">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Endereço">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsEditModalOpen(false)
                setEditingPatient(null)
                editForm.resetFields()
              }}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Salvar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Confirmação */}
      <Modal
        title={patientToToggle?.active ? 'Desabilitar Paciente' : 'Reabilitar Paciente'}
        open={isConfirmModalOpen}
        onCancel={() => {
          setIsConfirmModalOpen(false)
          setPatientToToggle(null)
        }}
        onOk={confirmToggleActive}
        okText={patientToToggle?.active ? 'Desabilitar' : 'Reabilitar'}
        okButtonProps={{ danger: patientToToggle?.active, loading: submitting }}
        cancelText="Cancelar"
        cancelButtonProps={{ disabled: submitting }}
      >
        <p>
          {patientToToggle?.active
            ? `Tem certeza que deseja desabilitar ${patientToToggle?.user?.name}? O paciente não poderá mais acessar o sistema.`
            : `Tem certeza que deseja reabilitar ${patientToToggle?.user?.name}? O paciente poderá acessar o sistema novamente.`}
        </p>
      </Modal>
    </div>
  )
}

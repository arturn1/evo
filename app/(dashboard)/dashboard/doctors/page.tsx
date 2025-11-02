'use client'

import { UpdateDoctorData, useDoctors } from '@/hooks/useDoctors'
import {
  CheckCircleOutlined,
  EditOutlined,
  PlusOutlined,
  StopOutlined
} from '@ant-design/icons'
import { App, Button, Form, Input, Modal, Select, Space, Table, Tag, Tooltip } from 'antd'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DoctorsPage() {
  const { doctors, loading, createDoctor, updateDoctor, toggleActive } = useDoctors(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [doctorToToggle, setDoctorToToggle] = useState<any>(null)
  const [editingDoctor, setEditingDoctor] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()
  const router = useRouter()
  const { message } = App.useApp()

  const handleCreate = async (values: any) => {
    try {
      setSubmitting(true)
      await createDoctor(values)
      message.success('Médico criado com sucesso!')
      setIsCreateModalOpen(false)
      createForm.resetFields()
    } catch (error: any) {
      const errorMessage = error?.message || ''

      if (errorMessage.includes('email')) {
        message.error('Email já cadastrado. Utilize outro email.')
      } else if (errorMessage.includes('crm')) {
        message.error('CRM já cadastrado. Verifique os dados.')
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
      const data: UpdateDoctorData = {
        name: values.name,
        email: values.email,
        crm: values.crm,
        speciality: values.speciality,
        role: values.role,
      }
      await updateDoctor(editingDoctor.id, data)
      message.success('Médico atualizado com sucesso!')
      setIsEditModalOpen(false)
      setEditingDoctor(null)
      editForm.resetFields()
    } catch (error: any) {
      const errorMessage = error?.message || ''

      if (errorMessage.includes('email')) {
        message.error('Email já cadastrado. Utilize outro email.')
      } else if (errorMessage.includes('crm')) {
        message.error('CRM já cadastrado. Verifique os dados.')
      } else if (errorMessage.includes('não encontrado')) {
        message.error('Registro não encontrado.')
      } else if (errorMessage.includes('Não autorizado')) {
        message.error('Operação não autorizada.')
      } else {
        message.error('Erro ao processar solicitação. Tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = (doctor: any) => {
    setDoctorToToggle(doctor)
    setIsConfirmModalOpen(true)
  }

  const confirmToggleActive = async () => {
    if (!doctorToToggle) return

    try {
      setSubmitting(true)
      await toggleActive(doctorToToggle.id, doctorToToggle.active)
      message.success(
        doctorToToggle.active
          ? 'Médico desabilitado com sucesso!'
          : 'Médico reabilitado com sucesso!'
      )
      setIsConfirmModalOpen(false)
      setDoctorToToggle(null)
    } catch (error: any) {
      const errorMessage = error?.message || ''

      if (errorMessage.includes('não encontrado')) {
        message.error('Registro não encontrado.')
      } else if (errorMessage.includes('não pode desabilitar a si mesmo')) {
        message.error('Não é possível desabilitar sua própria conta.')
      } else if (errorMessage.includes('Não autorizado')) {
        message.error('Operação não autorizada.')
      } else {
        message.error('Erro ao processar solicitação. Tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (doctor: any) => {
    setEditingDoctor(doctor)
    editForm.setFieldsValue({
      name: doctor.user.name,
      email: doctor.user.email,
      crm: doctor.crm,
      speciality: doctor.speciality,
      role: doctor.role,
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
      title: 'CRM',
      dataIndex: 'crm',
      key: 'crm',
    },
    {
      title: 'Especialidade',
      dataIndex: 'speciality',
      key: 'speciality',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'DOCTOR_ADMIN' ? 'gold' : 'blue'}>
          {role === 'DOCTOR_ADMIN' ? 'Administrador' : 'Médico'}
        </Tag>
      ),
    },
    {
      title: 'Pacientes',
      dataIndex: ['_count', 'patients'],
      key: 'patients',
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
        <h1>Gerenciar Médicos</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
          Novo Médico
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={doctors}
        loading={loading}
        rowKey="id"
      />

      {/* Modal de Criação */}
      <Modal
        title="Novo Médico"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false)
          createForm.resetFields()
        }}
        footer={null}
        width={600}
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
            name="crm"
            label="CRM"
            rules={[
              { required: true, message: 'Campo obrigatório' },
              { min: 5, message: 'CRM deve ter no mínimo 5 caracteres' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="speciality"
            label="Especialidade"
            rules={[
              { required: true, message: 'Campo obrigatório' },
              { min: 3, message: 'Especialidade deve ter no mínimo 3 caracteres' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Tipo de Acesso"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Select>
              <Select.Option value="DOCTOR">Médico</Select.Option>
              <Select.Option value="DOCTOR_ADMIN">Administrador</Select.Option>
            </Select>
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
        title="Editar Médico"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false)
          setEditingDoctor(null)
          editForm.resetFields()
        }}
        footer={null}
        width={600}
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
            name="crm"
            label="CRM"
            rules={[
              { required: true, message: 'Campo obrigatório' },
              { min: 5, message: 'CRM deve ter no mínimo 5 caracteres' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="speciality"
            label="Especialidade"
            rules={[
              { required: true, message: 'Campo obrigatório' },
              { min: 3, message: 'Especialidade deve ter no mínimo 3 caracteres' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Tipo de Acesso"
            rules={[{ required: true, message: 'Campo obrigatório' }]}
          >
            <Select>
              <Select.Option value="DOCTOR">Médico</Select.Option>
              <Select.Option value="DOCTOR_ADMIN">Administrador</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsEditModalOpen(false)
                setEditingDoctor(null)
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
        title={doctorToToggle?.active ? 'Desabilitar Médico' : 'Reabilitar Médico'}
        open={isConfirmModalOpen}
        onCancel={() => {
          setIsConfirmModalOpen(false)
          setDoctorToToggle(null)
        }}
        onOk={confirmToggleActive}
        okText={doctorToToggle?.active ? 'Desabilitar' : 'Reabilitar'}
        okButtonProps={{ danger: doctorToToggle?.active, loading: submitting }}
        cancelText="Cancelar"
        cancelButtonProps={{ disabled: submitting }}
      >
        <p>
          {doctorToToggle?.active
            ? `Tem certeza que deseja desabilitar ${doctorToToggle?.user?.name}? O médico não poderá mais acessar o sistema.`
            : `Tem certeza que deseja reabilitar ${doctorToToggle?.user?.name}? O médico poderá acessar o sistema novamente.`}
        </p>
      </Modal>
    </div>
  )
}

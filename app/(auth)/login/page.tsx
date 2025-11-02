'use client'

import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input } from 'antd'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { message } = App.useApp()

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoading(true)

      // Primeiro, validar credenciais com nossa API customizada
      const validateResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      })

      const validateData = await validateResponse.json()

      if (!validateResponse.ok) {
        message.error(validateData.error || 'Erro ao validar credenciais.')
        return
      }

      // Se validação passou, fazer o signIn
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (result?.error) {
        message.error('Credenciais inválidas. Verifique seus dados.')
        return
      }

      if (!result?.ok) {
        message.error('Erro ao processar solicitação. Tente novamente.')
        return
      }

      message.success('Login realizado com sucesso!')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      message.error('Erro ao processar solicitação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card title="Login - Sistema Médico" className="w-full max-w-md">
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Por favor, insira seu email!' },
              { type: 'email', message: 'Email inválido!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Senha"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              size="large"
              loading={loading}
            >
              Entrar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

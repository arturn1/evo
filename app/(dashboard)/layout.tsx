'use client'

import {
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MedicineBoxOutlined,
  MenuOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Drawer, Dropdown, Layout, Menu, Typography } from 'antd'
import { signOut, useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const { Header, Content, Sider } = Layout
const { Text } = Typography

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => {
        router.push('/dashboard')
        setDrawerOpen(false)
      },
    },
    ...(session?.user.userType === 'DOCTOR'
      ? [
        {
          key: '/dashboard/patients',
          icon: <UserOutlined />,
          label: 'Pacientes',
          onClick: () => {
            router.push('/dashboard/patients')
            setDrawerOpen(false)
          },
        },
      ]
      : []),
    {
      key: '/dashboard/laudos',
      icon: <FileTextOutlined />,
      label: 'Laudos',
      onClick: () => {
        router.push('/dashboard/laudos')
        setDrawerOpen(false)
      },
    },
  ]

  const userMenuItems = [
    ...(session?.user.userType === 'DOCTOR'
      ? [
        {
          key: 'manage-patients',
          icon: <UserOutlined />,
          label: 'Gerenciar Pacientes',
          onClick: () => router.push('/dashboard/patients'),
        },
      ]
      : []),
    ...(session?.user.role === 'DOCTOR_ADMIN'
      ? [
        {
          key: 'manage-doctors',
          icon: <TeamOutlined />,
          label: 'Gerenciar Médicos',
          onClick: () => router.push('/dashboard/doctors'),
        },
      ]
      : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      onClick: handleLogout,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#001529',
          padding: '0 16px',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MenuOutlined
            style={{ fontSize: '20px', color: '#fff', cursor: 'pointer', display: 'none' }}
            className="mobile-menu-icon"
            onClick={() => setDrawerOpen(true)}
          />
          <MedicineBoxOutlined style={{ fontSize: '24px', color: '#fff' }} />
          <Text style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }} className="header-title">
            Sistema Médico
          </Text>
        </div>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <Text style={{ color: '#fff' }} className="user-name">{session?.user?.name}</Text>
            <Avatar icon={<UserOutlined />} />
          </div>
        </Dropdown>
      </Header>

      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={250}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
        />
      </Drawer>

      <Layout>
        <Sider
          width={200}
          style={{ background: '#fff' }}
          className="desktop-sider"
          breakpoint="lg"
          collapsedWidth={0}
        >
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        <Layout style={{ padding: '16px' }}>
          <Content
            style={{
              padding: 16,
              margin: 0,
              minHeight: 280,
              background: '#fff',
              borderRadius: '8px',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

'use client'

import { useCallback, useEffect, useState } from 'react'

export interface Doctor {
  id: string
  crm: string
  speciality: string
  role: string
  active: boolean
  user: {
    name: string
    email: string
  }
  _count: {
    patients: number
  }
}

interface UseDoctors {
  doctors: Doctor[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createDoctor: (data: CreateDoctorData) => Promise<void>
  updateDoctor: (id: string, data: UpdateDoctorData) => Promise<void>
  toggleActive: (id: string, currentStatus: boolean) => Promise<void>
}

export interface CreateDoctorData {
  name: string
  email: string
  password: string
  crm: string
  speciality: string
  role?: 'DOCTOR' | 'DOCTOR_ADMIN'
}

export interface UpdateDoctorData {
  name?: string
  email?: string
  crm?: string
  speciality?: string
  role?: 'DOCTOR' | 'DOCTOR_ADMIN'
}

export function useDoctors(includeInactive: boolean = false): UseDoctors {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const url = includeInactive ? '/api/doctors?includeInactive=true' : '/api/doctors'
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Erro ao buscar médicos')
      }

      const data = await response.json()
      setDoctors(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [includeInactive])

  const createDoctor = useCallback(async (data: CreateDoctorData) => {
    try {
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar médico')
      }

      await fetchDoctors()
    } catch (err) {
      throw err
    }
  }, [fetchDoctors])

  const updateDoctor = useCallback(async (id: string, data: UpdateDoctorData) => {
    try {
      const response = await fetch(`/api/doctors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar médico')
      }

      await fetchDoctors()
    } catch (err) {
      throw err
    }
  }, [fetchDoctors])

  const toggleActive = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      const method = currentStatus ? 'DELETE' : 'PUT'
      const response = await fetch(`/api/doctors/${id}`, {
        method,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao alterar status do médico')
      }

      await fetchDoctors()
    } catch (err) {
      throw err
    }
  }, [fetchDoctors])

  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  return {
    doctors,
    loading,
    error,
    refetch: fetchDoctors,
    createDoctor,
    updateDoctor,
    toggleActive,
  }
}

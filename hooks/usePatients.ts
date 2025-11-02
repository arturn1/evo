'use client'

import { useCallback, useEffect, useState } from 'react'

export interface Patient {
  id: string
  cpf: string
  birthDate: string
  phone?: string
  address?: string
  active: boolean
  user: {
    name: string
    email: string
  }
  doctor: {
    user: {
      name: string
    }
  }
  _count: {
    laudos: number
  }
}

interface UsePatients {
  patients: Patient[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createPatient: (data: CreatePatientData) => Promise<void>
  updatePatient: (id: string, data: UpdatePatientData) => Promise<void>
  toggleActive: (id: string, currentStatus: boolean) => Promise<void>
}

export interface CreatePatientData {
  name: string
  email: string
  cpf: string
  birthDate: string
  phone?: string
  address?: string
  password: string
}

export interface UpdatePatientData {
  name?: string
  email?: string
  cpf?: string
  birthDate?: string
  phone?: string
  address?: string
}

export function usePatients(includeInactive: boolean = false): UsePatients {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const url = includeInactive ? '/api/patients?includeInactive=true' : '/api/patients'
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Erro ao buscar pacientes')
      }

      const data = await response.json()
      setPatients(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [includeInactive])

  const createPatient = useCallback(async (data: CreatePatientData) => {
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar paciente')
      }

      await fetchPatients()
    } catch (err) {
      throw err
    }
  }, [fetchPatients])

  const updatePatient = useCallback(async (id: string, data: UpdatePatientData) => {
    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar paciente')
      }

      await fetchPatients()
    } catch (err) {
      throw err
    }
  }, [fetchPatients])

  const toggleActive = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      const method = currentStatus ? 'DELETE' : 'PUT'
      const response = await fetch(`/api/patients/${id}`, {
        method,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao alterar status do paciente')
      }

      await fetchPatients()
    } catch (err) {
      throw err
    }
  }, [fetchPatients])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  return {
    patients,
    loading,
    error,
    refetch: fetchPatients,
    createPatient,
    updatePatient,
    toggleActive,
  }
}

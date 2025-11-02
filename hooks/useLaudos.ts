'use client'

import { useCallback, useEffect, useState } from 'react'

export interface Laudo {
  id: string
  title: string
  description: string
  diagnosis: string
  examDate: string
  attachments: string[]
  patient: {
    user: {
      name: string
      email: string
    }
  }
  createdAt: string
  updatedAt: string
}

interface UseLaudos {
  laudos: Laudo[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createLaudo: (data: CreateLaudoData) => Promise<void>
}

export interface CreateLaudoData {
  title: string
  description: string
  diagnosis: string
  examDate: string
  patientId: string
  attachments?: string[]
}

export function useLaudos(patientId?: string): UseLaudos {
  const [laudos, setLaudos] = useState<Laudo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLaudos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const url = patientId
        ? `/api/laudos?patientId=${patientId}`
        : '/api/laudos'

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Erro ao buscar laudos')
      }

      const data = await response.json()
      setLaudos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  const createLaudo = useCallback(async (data: CreateLaudoData) => {
    try {
      const response = await fetch('/api/laudos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar laudo')
      }

      await fetchLaudos()
    } catch (err) {
      throw err
    }
  }, [fetchLaudos])

  useEffect(() => {
    fetchLaudos()
  }, [fetchLaudos])

  return {
    laudos,
    loading,
    error,
    refetch: fetchLaudos,
    createLaudo,
  }
}

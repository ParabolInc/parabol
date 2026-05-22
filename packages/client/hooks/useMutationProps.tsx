import {useCallback, useEffect, useRef, useState} from 'react'
import type {PayloadError} from 'relay-runtime'

interface MutationServerError {
  message: string
  path: string[]
}
interface RelayMustFixError extends MutationServerError {
  type: 'mustfix'
  framesToPop: number
  name: 'RelayNetwork'
  source: MutationServerError[]
}

export type MenuMutationProps = {
  onCompleted: (res?: any, errors?: any) => void
  onError: (error?: any) => void
  submitMutation: () => void
  submitting: boolean
}

export const getOnCompletedError = (
  res?: unknown,
  errors?: readonly PayloadError[] | null
): MutationServerError | PayloadError | undefined => {
  if (res && typeof res === 'object') {
    const payload = Object.values(res as Record<string, unknown>)[0]
    if (payload && typeof payload === 'object' && 'error' in payload) {
      const err = (payload as {error?: MutationServerError}).error
      if (err) return err
    }
  }
  return (errors && errors[0]) || undefined
}

const useMutationProps = () => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<{message: string} | undefined>(undefined)
  const isMountedRef = useRef(true)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const onCompleted = useCallback(
    (res?: unknown, errors?: readonly PayloadError[] | null) => {
      if (isMountedRef.current) {
        setSubmitting(false)
        setError(getOnCompletedError(res, errors))
      }
    },
    []
  )

  const onError = useCallback((error: Error | MutationServerError | RelayMustFixError) => {
    setSubmitting(false)
    const sourceError = (error as any)?.source?.errors?.[0]
    setError(sourceError || error)
  }, [])

  const submitMutation = useCallback(() => {
    setSubmitting(true)
  }, [])

  return {submitting, submitMutation, error, onError, onCompleted}
}

export default useMutationProps

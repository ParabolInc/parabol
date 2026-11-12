// Deprecated. Use useMutation hooks instead, which provide this same functionality

import {useCallback, useEffect, useRef, useState} from 'react'
import type {PayloadError} from 'relay-runtime'
import getMutationError, {type MutationError} from '../utils/relay/getMutationError'
import {withStaleClientNote} from '../utils/staleClientNote'

export type MenuMutationProps = {
  onCompleted: (res?: any, errors?: any) => void
  onError: (error?: any) => void
  submitMutation: () => void
  submitting: boolean
}

const withStaleClientNoteOnError = (error: MutationError | undefined) =>
  error && {...error, message: withStaleClientNote(error.message)}

const useMutationProps = () => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<MutationError | undefined>(undefined)
  const isMountedRef = useRef(true)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const onCompleted = useCallback((res?: unknown, errors?: readonly PayloadError[] | null) => {
    if (isMountedRef.current) {
      setSubmitting(false)
      setError(withStaleClientNoteOnError(getMutationError(res, errors)))
    }
  }, [])

  // the OAuth popups fail with a plain {message}
  const onError = useCallback((error: Error | {message: string}) => {
    setSubmitting(false)
    const mutationError =
      error instanceof Error ? getMutationError(error) : {message: error.message}
    setError(withStaleClientNoteOnError(mutationError))
  }, [])

  const submitMutation = useCallback(() => {
    setSubmitting(true)
  }, [])

  return {submitting, submitMutation, error, onError, onCompleted}
}

export default useMutationProps

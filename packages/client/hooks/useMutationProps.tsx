// Deprecated. Use useMutation hooks instead, which provide this same functionality

import {useCallback, useEffect, useRef, useState} from 'react'
import type {PayloadError} from 'relay-runtime'
import {snackOnError} from '../mutations/handlers/snackOnError'
import getMutationError, {type MutationError} from '../utils/relay/getMutationError'
import {withStaleClientNote} from '../utils/staleClientNote'
import useAtmosphere from './useAtmosphere'

export type MenuMutationProps = {
  onCompleted: (res?: any, errors?: any) => void
  onError: (error?: any) => void
  submitMutation: () => void
  submitting: boolean
}

interface MutationProps {
  submitting: boolean
  submitMutation: () => void
  // the OAuth popups fail with a plain {message}
  onError: (error: Error | {message: string}) => void
  onCompleted: (res?: unknown, errors?: readonly PayloadError[] | null) => void
}

interface InlineErrorMutationProps extends MutationProps {
  error: MutationError | undefined
}

interface InlineErrorOptions {
  errorDisplay: 'inline'
}

const withStaleClientNoteOnError = (error: MutationError | undefined) =>
  error && {...error, message: withStaleClientNote(error.message)}

// A failure shows in a snackbar, unless the caller asks for the error to render it inline
function useMutationProps(): MutationProps
function useMutationProps(options: InlineErrorOptions): InlineErrorMutationProps
function useMutationProps(options?: InlineErrorOptions): MutationProps | InlineErrorMutationProps {
  const isInline = options?.errorDisplay === 'inline'
  const atmosphere = useAtmosphere()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<MutationError | undefined>(undefined)
  const isMountedRef = useRef(true)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const onCompleted = useCallback(
    (res?: unknown, errors?: readonly PayloadError[] | null) => {
      const mutationError = getMutationError(res, errors)
      // snack even after unmount, e.g. from a dialog that closes before the mutation returns
      if (!isInline && mutationError) snackOnError(atmosphere)(mutationError)
      if (!isMountedRef.current) return
      setSubmitting(false)
      if (isInline) setError(withStaleClientNoteOnError(mutationError))
    },
    [atmosphere, isInline]
  )

  const onError = useCallback(
    (error: Error | {message: string}) => {
      setSubmitting(false)
      const mutationError =
        error instanceof Error ? getMutationError(error) : {message: error.message}
      if (isInline) {
        setError(withStaleClientNoteOnError(mutationError))
      } else {
        snackOnError(atmosphere)(mutationError)
      }
    },
    [atmosphere, isInline]
  )

  const submitMutation = useCallback(() => {
    setSubmitting(true)
  }, [])

  const mutationProps = {submitting, submitMutation, onError, onCompleted}
  return isInline ? {...mutationProps, error} : mutationProps
}

export default useMutationProps

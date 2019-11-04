import {useCallback, useEffect, useRef, useState} from 'react'
import {PayloadError} from 'relay-runtime'
import {WithMutationProps} from '../utils/relay/withMutationProps'

interface MutationServerError {
  message: string
  path: string[]
}

export type MenuMutationProps = Pick<
  WithMutationProps,
  'onCompleted' | 'onError' | 'submitMutation' | 'submitting'
>

const getOnCompletedError = (
  res?: null | {[operationNames: string]: {error?: MutationServerError}},
  errors?: readonly PayloadError[] | null
) => {
  const payload = res && res[Object.keys(res)[0]]
  return (payload && payload.error) || (errors && errors[0]) || undefined
}

const useMutationProps = () => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<{message: string} | undefined>(undefined)
  const isMountedRef = useRef(true)
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const onCompleted = useCallback(
    (
      res?: null | {[operationNames: string]: {error?: MutationServerError}},
      errors?: readonly PayloadError[] | null
    ) => {
      if (isMountedRef.current) {
        setSubmitting(false)
        setError(getOnCompletedError(res, errors))
      }
    },
    []
  )

  const onError = useCallback((error: Error | MutationServerError) => {
    setSubmitting(false)
    setError(error)
  }, [])

  const submitMutation = useCallback(() => {
    setSubmitting(true)
  }, [])

  return {submitting, submitMutation, error, onError, onCompleted}
}

export default useMutationProps

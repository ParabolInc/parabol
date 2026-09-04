import {useEffect, useRef} from 'react'

interface Options {
  enabled: boolean
  hasItems: boolean
  hasWorkItems: boolean
  submitting: boolean
  generate: () => void
}

const useInspirationAutoGenerate = (options: Options) => {
  const {enabled, hasItems, hasWorkItems, submitting, generate} = options
  const attemptedRef = useRef(false)
  useEffect(() => {
    if (!enabled || attemptedRef.current || hasItems || !hasWorkItems || submitting) return
    attemptedRef.current = true
    generate()
  }, [enabled, hasItems, hasWorkItems, submitting, generate])
}

export default useInspirationAutoGenerate

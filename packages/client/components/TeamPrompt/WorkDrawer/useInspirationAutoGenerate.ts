import {useEffect, useRef} from 'react'
import useSessionStorageState from '../../../hooks/useSessionStorageState'

interface Options {
  enabled: boolean
  meetingId: string
  service: string
  hasItems: boolean
  hasWorkItems: boolean
  submitting: boolean
  generate: () => void
}

const useInspirationAutoGenerate = (options: Options) => {
  const {enabled, meetingId, service, hasItems, hasWorkItems, submitting, generate} = options
  const [attempted, setAttempted] = useSessionStorageState<boolean>(
    `Inspiration:autoDrafted:${meetingId}:${service}`,
    false
  )
  // the stored value survives remounts; the ref guards the double effect a remount runs
  const attemptedRef = useRef(attempted)
  useEffect(() => {
    if (!enabled || attemptedRef.current || hasItems || !hasWorkItems || submitting) return
    attemptedRef.current = true
    setAttempted(true)
    generate()
  }, [enabled, hasItems, hasWorkItems, submitting, generate, setAttempted])
}

export default useInspirationAutoGenerate

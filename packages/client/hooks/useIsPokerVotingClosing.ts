import {useEffect, useRef, useState} from 'react'

const useIsPokerVotingClosing = (isVoting: boolean, stageId: string) => {
  const [isClosing, setIsClosing] = useState(false)
  const oldStageIdRef = useRef(stageId)
  const wasVotingRef = useRef(isVoting)

  useEffect(() => {
    if (stageId !== oldStageIdRef.current) {
      oldStageIdRef.current = stageId
      wasVotingRef.current = isVoting
      setIsClosing(false)
      return
    }
    if (wasVotingRef.current === isVoting) return
    wasVotingRef.current = isVoting
    if (!isVoting) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsClosing(false)
      }, 300)
      return () => {
        clearTimeout(timer)
      }
    }
    return
  }, [stageId, isVoting])
  return isClosing
}

export default useIsPokerVotingClosing

import {useEffect, useRef, useState} from 'react'

const useIsPokerVotingClosing = (isVoting: boolean) => {
  const wasVotingRef = useRef(isVoting)
  const [isClosing, setIsClosing] = useState(false)
  useEffect(() => {
    if (isVoting === wasVotingRef.current) return
    wasVotingRef.current = isVoting
    if (!isVoting) {
      setIsClosing(true)
      setTimeout(() => {
        setIsClosing(false)
      }, 300)
    }
  }, [isVoting])
  return isClosing || (wasVotingRef.current && !isVoting)
}

export default useIsPokerVotingClosing

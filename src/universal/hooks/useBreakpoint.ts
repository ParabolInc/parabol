import {useEffect, useState} from 'react'

const useBreakpoint = (breakpoint: number) => {
  const query = `(min-width: ${breakpoint}px)`
  const mql = window.matchMedia(query)
  const [match, setMatch] = useState(mql.matches)
  useEffect(() => {
    const updateMatch = () => setMatch(mql.matches)
    mql.addEventListener('change', updateMatch)
    return () => {
      mql.removeEventListener('change', updateMatch)
    }
  }, [])

  return match
}

export default useBreakpoint

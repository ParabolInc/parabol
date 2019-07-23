import {useEffect, useState} from 'react'

const useBreakpoint = (breakpoint: number) => {
  const query = `(min-width: ${breakpoint}px)`
  const mql = window.matchMedia(query)
  const [match, setMatch] = useState(mql.matches)
  useEffect(() => {
    const updateMatch = () => setMatch(mql.matches)
    if (!mql.addEventListener) {
      // fallback for safari https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList#Browser_compatibility
      mql.addListener(updateMatch) // tslint:disable-line
      return () => {
        mql.removeListener(updateMatch) // tslint:disable-line
      }
    } else {
      mql.addEventListener('change', updateMatch)
      return () => {
        mql.removeEventListener('change', updateMatch)
      }
    }
  }, [])

  return match
}

export default useBreakpoint

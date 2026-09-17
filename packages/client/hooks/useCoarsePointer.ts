import {useEffect, useState} from 'react'

const QUERY = '(pointer: coarse)'

const useCoarsePointer = () => {
  const [isCoarse, setIsCoarse] = useState(() => window.matchMedia(QUERY).matches)
  useEffect(() => {
    const mql = window.matchMedia(QUERY)
    const update = () => setIsCoarse(mql.matches)
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])
  return isCoarse
}

export default useCoarsePointer

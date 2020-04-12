import {useEffect, useState} from 'react'

const root = document.getElementById('root')!

const useScrollY = () => {
  const [scrollY, setScrollY] = useState(root.scrollTop)
  useEffect(() => {
    const handler = () => {
      setScrollY(root.scrollTop)
    }
    root.addEventListener('scroll', handler, {passive: true})
    return () => root.removeEventListener('scroll', handler)
  }, [])
  return scrollY
}

export default useScrollY

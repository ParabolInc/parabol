import {useEffect, useState} from 'react'

const useScrollY = () => {
  const [scrollY, setScrollY] = useState(window.scrollY)
  useEffect(() => {
    const handler = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handler, {passive: true})
    return () => window.removeEventListener('scroll', handler)
  })
  return scrollY
}

export default useScrollY

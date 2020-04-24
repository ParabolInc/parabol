import {useEffect} from 'react'

const useCanonical = (hint: string) => {
  useEffect(() => {
    const {origin} = window.location
    const link = document.createElement('link')
    link.rel = 'canonical'
    link.href = `${origin}/${hint}`
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [hint])
}

export default useCanonical

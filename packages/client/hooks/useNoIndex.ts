import {useEffect} from 'react'

const useNoIndex = () => {
  useEffect(() => {
    let tag = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null
    if (!tag) {
      tag = document.createElement('meta')
      tag.name = 'robots'
      tag.content = 'noindex'
      document.head.appendChild(tag)
    }
    return () => {
      if (tag) {
        document.head.removeChild(tag)
      }
    }
  }, [])
}

export default useNoIndex

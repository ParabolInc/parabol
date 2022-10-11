import {useEffect} from 'react'

const useMetaTagContent = (content: string) => {
  useEffect(() => {
    let tag = document.head.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!tag) {
      tag = document.createElement('meta')
      tag.name = 'description'
      document.head.appendChild(tag)
    }
    tag.content = content
  }, [content])
}

export default useMetaTagContent

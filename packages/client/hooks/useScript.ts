import {useEffect, useState} from 'react'

interface Options {
  crossOrigin?: boolean
}
const cachedScripts: string[] = []
const useScript = (src: string, options: Options = {}) => {
  const [state, setState] = useState({
    loaded: false,
    error: false
  })

  useEffect(() => {
    if (cachedScripts.includes(src)) {
      setState({
        loaded: true,
        error: false
      })
    } else {
      cachedScripts.push(src)

      // Create script
      const script = document.createElement('script')
      script.src = src
      script.async = true
      if (options.crossOrigin) {
        script.crossOrigin = ''
      }
      script.onload = () => {
        setState({
          loaded: true,
          error: false
        })
      }
      script.onerror = () => {
        // Remove from cachedScripts we can try loading again
        const index = cachedScripts.indexOf(src)
        if (index >= 0) cachedScripts.splice(index, 1)
        script.remove()

        setState({
          loaded: false,
          error: true
        })
      }

      document.body.appendChild(script)
    }
  }, [src])

  return [state.loaded, state.error]
}

export default useScript

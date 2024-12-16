import {useEffect, useRef, useState} from 'react'

const useSVG = (src: string, onLoad?: (el: SVGElement) => void) => {
  const [svg, setSVG] = useState<string | null>(null)
  const svgRef = useRef<any>(null)
  const isMountedRef = useRef(false)
  // const [isReady, setIsReady] = useState(false)
  useEffect(() => {
    isMountedRef.current = true
    const fetchSVG = async () => {
      if (!src) {
        setSVG(null)
        return
      }
      const res = await fetch(src)
      const res2 = await res.text()
      if (!isMountedRef.current) return
      if (onLoad) {
        const div = document.createElement('div')
        div.innerHTML = res2
        onLoad(div.firstChild as SVGElement)
        setSVG(div.innerHTML)
      } else {
        setSVG(res2)
      }
    }
    fetchSVG().catch(() => {
      /*ignore*/
    })
    return () => {
      isMountedRef.current = false
    }
  }, [src])
  return {svg, svgRef}
}

export default useSVG

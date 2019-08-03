import React, {useEffect, useRef, useState} from 'react'

interface Props {
  className?: string
  src: string
  setLayout?: (svg: SVGElement) => void,
}

const SVG = (props: Props) => {
  const {src, className, setLayout} = props
  const objRef = useRef<HTMLObjectElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const onLoad = () => {
    setIsLoaded(true)
  }
  useEffect(() => {
    if (!isLoaded) return
    const doc = objRef.current!.contentDocument as Document
    const svgEl = doc.firstChild as SVGElement
    if (setLayout && svgEl) {
      setLayout(svgEl)
    }
  }, [isLoaded])
  return (
    <object ref={objRef} className={className} type="image/svg+xml" data={src}
            onLoad={onLoad} />
  )
}

export default SVG

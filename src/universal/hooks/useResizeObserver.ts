import {useEffect} from 'react'
import ResizeObserverPolyfill from 'resize-observer-polyfill'

declare global {
  interface Window {
    ResizeObserver: {new (callback: ResizeObserverCallback): ResizeObserver}
  }
}

const ResizeObserver = window.ResizeObserver || (ResizeObserverPolyfill as {new (): ResizeObserver})

const useResizeObserver = (el: HTMLElement | null, cb: ResizeObserverCallback) => {
  useEffect(() => {
    if (!el) return
    const resizeObserver = new ResizeObserver(cb)
    resizeObserver.observe(el)
    return () => {
      resizeObserver.disconnect()
    }
  }, [el])
}

export default useResizeObserver

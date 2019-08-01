import {useEffect} from 'react'
import ResizeObserverPolyfill from 'resize-observer-polyfill'
import useEventCallback from './useEventCallback'

declare global {
  interface Window {
    ResizeObserver: {new (callback: ResizeObserverCallback): ResizeObserver}
  }
}

const ResizeObserver = window.ResizeObserver || (ResizeObserverPolyfill as {new (): ResizeObserver})

const useResizeObserver = (el: HTMLElement | null, cb: ResizeObserverCallback) => {
  const eventCb = useEventCallback(cb)
  useEffect(() => {
    if (!el) return
    const resizeObserver = new ResizeObserver(eventCb)
    resizeObserver.observe(el)
    return () => {
      resizeObserver.disconnect()
    }
  }, [el, eventCb])
}

export default useResizeObserver

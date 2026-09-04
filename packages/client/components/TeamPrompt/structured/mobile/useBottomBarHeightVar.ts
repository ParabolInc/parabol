import {type RefObject, useEffect} from 'react'

const useBottomBarHeightVar = (ref: RefObject<HTMLElement | null>, enabled: boolean) => {
  useEffect(() => {
    const root = document.documentElement
    const el = ref.current
    if (!enabled || !el) {
      root.style.removeProperty('--tp-bottom-bar')
      return
    }
    const apply = () =>
      root.style.setProperty('--tp-bottom-bar', `${el.getBoundingClientRect().height}px`)
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(el)
    return () => {
      observer.disconnect()
      root.style.removeProperty('--tp-bottom-bar')
    }
  }, [ref, enabled])
}

export default useBottomBarHeightVar

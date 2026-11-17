const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const

export const keepArrivalInView = (
  getTarget: () => HTMLElement | null,
  layoutRoot: HTMLElement,
  durationMs: number
) => {
  const center = () => getTarget()?.scrollIntoView({block: 'center'})
  const observer = new ResizeObserver(center)
  const stop = () => {
    observer.disconnect()
    window.clearTimeout(timeout)
    USER_SCROLL_EVENTS.forEach((type) => window.removeEventListener(type, stop, true))
  }
  const timeout = window.setTimeout(stop, durationMs)
  center()
  observer.observe(layoutRoot)
  USER_SCROLL_EVENTS.forEach((type) => window.addEventListener(type, stop, true))
  return stop
}

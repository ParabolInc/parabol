// dom lookups, cached for just a tick

import {BBox} from '../../types/animations'

const cache = new Map<RectElement, BBox>()
let timer: number | undefined

export interface RectElement {
  getBoundingClientRect: HTMLElement['getBoundingClientRect']
}

const getBBox = (el: RectElement | null | Text) => {
  if (!el || !('getBoundingClientRect' in el)) return null
  if (!cache.has(el)) {
    const {height, width, top, left} = el.getBoundingClientRect()
    cache.set(el, {height, width, top, left})
    if (!timer) {
      timer = window.setTimeout(() => {
        timer = undefined
        cache.clear()
      })
    }
  }
  return cache.get(el) || null
}

export default getBBox

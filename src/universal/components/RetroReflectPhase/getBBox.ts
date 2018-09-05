// dom lookups, cached for just a tick

import {BBox} from 'types/animations'

const cache = new Map<HTMLElement, BBox>()
let timer

const getBBox = (el: HTMLElement | null) => {
  if (!el) return null
  if (!cache.has(el)) {
    const {height, width, top, left} = el.getBoundingClientRect()
    cache.set(el, {height, width, top, left})
    if (!timer) {
      timer = setTimeout(() => {
        timer = undefined
        cache.clear()
      })
    }
  }
  return cache.get(el) || null
}

export default getBBox

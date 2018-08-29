import {BBox} from 'universal/components/RetroReflectPhase/FLIPModal'

class ParentCache {
  el: HTMLElement
  bbox: BBox
  // columnLefts: Array<number>
  setCoords(el: HTMLElement, {height, width}, maxBBox: BBox) {
    this.el = el
    const top = (maxBBox.height - height) / 2 + maxBBox.top
    const left = (maxBBox.width - width) / 2 + maxBBox.left
    this.bbox = {height, width, top, left}
    el.style.width = `${width}px`
    el.style.height = `${height}px`
    el.style.top = `${top}px`
    el.style.left = `${left}px`
  }
}

export default ParentCache

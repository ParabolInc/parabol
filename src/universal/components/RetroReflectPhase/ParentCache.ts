import setElementBBox from 'universal/components/RetroReflectPhase/setElementBBox'
import {BBox} from 'types/animations'

class ParentCache {
  el!: HTMLElement
  bbox!: BBox
  // columnLefts: Array<number>
  setCoords(el: HTMLElement, {height, width}, maxBBox: BBox) {
    this.el = el
    const top = (maxBBox.height - height) / 2 + maxBBox.top
    const left = (maxBBox.width - width) / 2 + maxBBox.left
    this.bbox = {height, width, top, left}
    setElementBBox(el, {width, height, top, left})
  }
}

export default ParentCache

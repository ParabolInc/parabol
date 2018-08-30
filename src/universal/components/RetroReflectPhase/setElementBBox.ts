import {BBox} from 'universal/components/RetroReflectPhase/FLIPModal'

const setElementBBox = (el: HTMLElement, bbox: Partial<BBox>) => {
  Object.keys(bbox).forEach((key) => {
    el.style[key] = `${bbox[key]}px`
  })
}

export default setElementBBox

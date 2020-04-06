import {DragAttribute} from 'types/constEnums'

interface ControlBarCoverable {
  el: HTMLDivElement
  left: number
  right: number
  isExpanded: boolean
}

let coverables = [] as ControlBarCoverable[]
// must be sorted from left to right
const initCoverables = () => {
  const els = [...document.querySelectorAll(`div[${DragAttribute.CONTROL_BAR_COVERABLE}='true']`)]
  return els.map((el) => ({
    el,
    left: 0,
    right: 0,
    isExpanded: false
  }))
}

// on initial load, trust nothing
// on dragstart, trust elements, don't trust cached bboxes (if any)
// on mousemove, trust bboxes

export type CoverableState = 'load' | 'start' | 'move'

const collectControlBarCoverables = (state: CoverableState) => {
  if (state === 'load') {
    coverables = initCoverables()
  }

  if (state !== 'move') {
    coverables.forEach((coverable) => {
      const bbox = coverable.el.getBoundingClientRect()
      coverable.left = bbox.left
      coverable.right = bbox.right
    })
  }
  return coverables
}

export default collectControlBarCoverables

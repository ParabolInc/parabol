import {BBox} from 'universal/components/RetroReflectPhase/FLIPModal'

interface Options {
  scale?: boolean
}

export interface Point {
  left: number
  top: number
}

const getTransform = (first: Point | BBox, last: Point | BBox, {scale}: Options = {}) => {
  const dX = first.left - last.left
  const dY = first.top - last.top
  let scaleStr = ''
  if (scale && 'width' in first && 'width' in last && 'height' in first && 'height' in last) {
    const dW = first.width / last.width
    const dH = first.height / last.height
    scaleStr = `scale(${dW},${dH}`
  }
  return `translate(${dX}px,${dY}px)${scaleStr}`
}

export default getTransform

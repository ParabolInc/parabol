import {BBox} from 'universal/components/RetroReflectPhase/FLIPModal'

interface Options {
  scale?: boolean
}

const getTransform = (first: Partial<BBox>, last: Partial<BBox>, {scale}: Options = {}) => {
  const dX = first.left - last.left
  const dY = first.top - last.top
  let scaleStr = ''
  if (scale) {
    const dW = first.width / last.width
    const dH = first.height / last.height
    scaleStr = `scale(${dW},${dH}`
  }
  return `translate(${dX}px,${dY}px)${scaleStr}`
}

export default getTransform

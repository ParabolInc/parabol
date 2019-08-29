import getBBox from '../../components/RetroReflectPhase/getBBox'
import {Elevation} from '../../styles/elevation'
import {BezierCurve, Times} from '../../types/constEnums'

const updateClonePosition = (targetEl: HTMLDivElement, reflectionId: string) => {
  const clone = document.getElementById(`clone-${reflectionId}`)
  if (!clone) return
  const bbox = getBBox(targetEl)
  if (!bbox) {
    document.body.removeChild(clone)
    return
  }
  const {left, top} = bbox
  const {style} = clone
  style.transform = `translate(${left}px,${top}px)`
  style.boxShadow = Elevation.CARD_SHADOW
  style.transition = `box-shadow ${Times.REFLECTION_DROP_DURATION}ms ${BezierCurve.DECELERATE}, transform ${Times.REFLECTION_DROP_DURATION}ms ${BezierCurve.DECELERATE}`
}

export default updateClonePosition

import {Elevation} from '../../styles/elevation'
import {ZIndex} from '../../types/constEnums'

const cloneReflection = (element: HTMLElement, reflectionId: string) => {
  const cloneContainer = document.createElement('div')
  cloneContainer.style.boxShadow = Elevation.CARD_DRAGGING
  cloneContainer.style.position = 'absolute'
  cloneContainer.style.left = '0'
  cloneContainer.style.top = '0'
  cloneContainer.style.pointerEvents = 'none'
  cloneContainer.style.zIndex = `${ZIndex.REFLECTION_IN_FLIGHT_LOCAL}`
  cloneContainer.id = `clone-${reflectionId}`
  const clone = element.cloneNode(true)
  cloneContainer.appendChild(clone)
  document.body.appendChild(cloneContainer)
  return cloneContainer
}

export default cloneReflection

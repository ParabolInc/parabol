import {commitLocalUpdate} from 'react-relay'
import {Elevation} from '../../styles/elevation'
import {ElementWidth, ZIndex} from '../../types/constEnums'

const cloneReflection = (element: HTMLElement, reflectionId: string, atmosphere) => {
  commitLocalUpdate(atmosphere, (store) => {
    const reflection = store.get(reflectionId)!
    reflection.setValue(true, 'isDraggingWidthExpanded')
  })
  const cloneContainer = document.createElement('div')
  cloneContainer.style.background = '#FFF'
  cloneContainer.style.boxShadow = Elevation.CARD_DRAGGING
  cloneContainer.style.borderRadius = '3px'
  cloneContainer.style.position = 'absolute'
  cloneContainer.style.left = '0'
  cloneContainer.style.top = '0'
  cloneContainer.style.pointerEvents = 'none'
  cloneContainer.style.zIndex = `${ZIndex.REFLECTION_IN_FLIGHT_LOCAL}`
  cloneContainer.id = `clone-${reflectionId}`
  const clone = element.cloneNode(true)
  cloneContainer.appendChild(clone)
  cloneContainer.style.width = `${ElementWidth.REFLECTION_CARD_EXPANDED}px`
  document.body.appendChild(cloneContainer)
  return cloneContainer
}

export default cloneReflection

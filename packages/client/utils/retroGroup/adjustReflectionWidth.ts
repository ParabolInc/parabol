import {ElementWidth} from '../../types/constEnums'

const adjustReflectionWidth = (element: HTMLDivElement, isColumnExpanded: boolean) => {
  const clonedReflectionElement = element.lastElementChild?.children as HTMLCollectionOf<
    HTMLElement
  >
  clonedReflectionElement[0].style.width = `${
    isColumnExpanded ? ElementWidth.REFLECTION_CARD_EXPANDED : ElementWidth.REFLECTION_CARD
  }px`
  return element
}

export default adjustReflectionWidth

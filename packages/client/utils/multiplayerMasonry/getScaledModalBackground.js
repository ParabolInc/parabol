import {CARD_PADDING, MODAL_PADDING, REFLECTION_WIDTH} from './masonryConstants'

const getScaledModalBackground = (modalHeight, modalWidth, topCardHeight, headerHeight) => {
  const scaleX = (REFLECTION_WIDTH + CARD_PADDING * 2) / modalWidth
  const scaleY = (topCardHeight + headerHeight + MODAL_PADDING) / modalHeight
  return `scale(${scaleX}, ${scaleY})`
}

export default getScaledModalBackground

import {
  ANIMATE_IN_TOTAL_DURATION,
  ITEM_DURATION,
  MIN_ITEM_DELAY,
  MIN_VAR_ITEM_DELAY,
} from 'universal/utils/multiplayerMasonry/masonryConstants'

const getStaggerDelay = (childrenLen) => {
  const shuffleDelay = (ANIMATE_IN_TOTAL_DURATION - ITEM_DURATION - MIN_ITEM_DELAY) / childrenLen
  return Math.max(MIN_VAR_ITEM_DELAY, shuffleDelay)
}

export default getStaggerDelay

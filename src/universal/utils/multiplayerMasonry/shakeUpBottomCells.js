import getLastCardPerColumn from 'universal/utils/multiplayerMasonry/getLastCardPerColumn'

const AXIS_ANIMATION_DURATION = 100
// increasing this decreases movement, but increases the probability of 1 column being much taller than the others
export const MIN_SAVINGS = 24 // in pixels, must be > 0
// taxing the # of columns it has to move encourages shorter moves
export const COST_PER_COLUMN = 24

const shakeUpBottomCells = (childrenCache, columnLefts) => {
  for (let safeLoop = 0; safeLoop < 20; safeLoop++) {
    const lastCardPerColumn = getLastCardPerColumn(childrenCache, columnLefts)
    const totalSavings = []
    for (let ii = 0; ii < columnLefts.length; ii++) {
      // source is the suspected tall column, target is a possibly shorter column
      const sourceLeft = columnLefts[ii]
      totalSavings[ii] = new Array(columnLefts.length).fill(0)
      const sourceChildCache = lastCardPerColumn[sourceLeft]
      // if the column is empty, you can't shake anything from it
      if (!sourceChildCache) continue
      const {boundingBox: sourceBox} = sourceChildCache
      const savings = totalSavings[ii]
      for (let jj = 0; jj < columnLefts.length; jj++) {
        if (jj === ii) continue
        const targetLeft = columnLefts[jj]
        const targetBottom = lastCardPerColumn[targetLeft]
          ? lastCardPerColumn[targetLeft].boundingBox.height +
            lastCardPerColumn[targetLeft].boundingBox.top
          : 0
        const targetSavings = sourceBox.top - targetBottom
        savings[jj] = targetSavings - COST_PER_COLUMN * Math.abs(jj - ii)
      }
    }
    const topSavingsPerSource = totalSavings.map((savings) => Math.max(...savings))
    const maxSavingsValue = Math.max(...topSavingsPerSource)
    if (maxSavingsValue < MIN_SAVINGS) return
    const bestSourceIdx = topSavingsPerSource.indexOf(maxSavingsValue)
    const bestSourceLeft = columnLefts[bestSourceIdx]
    const targetSavings = totalSavings[bestSourceIdx]
    const bestTargetIdx = targetSavings.indexOf(maxSavingsValue)
    const bestTargetLeft = columnLefts[bestTargetIdx]
    const sourceChildCache = lastCardPerColumn[bestSourceLeft]
    const {boundingBox: sourceBox, el: sourceEl} = sourceChildCache
    const oldBottom = lastCardPerColumn[bestTargetLeft]

    const {top: oldTop} = sourceBox
    sourceBox.left = bestTargetLeft
    sourceBox.top = oldBottom ? oldBottom.boundingBox.top + oldBottom.boundingBox.height : 0

    // animate! move horizontally first, then vertically
    // delay each move so it looks more natural
    sourceEl.style.transform = `translate(${sourceBox.left}px, ${oldTop}px)`
    sourceEl.style.transitionDuration = `${AXIS_ANIMATION_DURATION}ms`
    const delay = (safeLoop + 1) * 100
    sourceEl.style.transitionDelay = `${delay}ms`
    setTimeout(() => {
      sourceEl.style.transitionDelay = ''
      sourceEl.style.transform = `translate(${sourceBox.left}px, ${sourceBox.top}px`
      setTimeout(() => {
        sourceEl.style.transitionDuration = ''
      }, AXIS_ANIMATION_DURATION)
    }, delay + AXIS_ANIMATION_DURATION)
  }
}

export default shakeUpBottomCells

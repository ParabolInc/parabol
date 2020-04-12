const UNCERTAINTY_THRESHOLD = 3 // pixels to move along 1 plane until we determine intent
const getIsDrag = (clientX: number, clientY: number, startX: number, startY: number) => {
  const dx = Math.abs(startX - clientX)
  const dy = Math.abs(startY - clientY)
  return dx > UNCERTAINTY_THRESHOLD || dy > UNCERTAINTY_THRESHOLD
}

export default getIsDrag

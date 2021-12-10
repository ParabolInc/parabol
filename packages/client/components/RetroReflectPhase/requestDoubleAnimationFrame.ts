// CHROME IS AN OVER AGGRESSIVE BATCHER - I use this in hopes that I can someday deprecate it
const requestDoubleAnimationFrame = (cb: () => void) =>
  requestAnimationFrame(() => requestAnimationFrame(cb))

export default requestDoubleAnimationFrame

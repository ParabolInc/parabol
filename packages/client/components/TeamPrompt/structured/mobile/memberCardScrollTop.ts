export const STICKY_HEADER_OFFSET = 120

interface Options {
  containerScrollTop: number
  containerTop: number
  cardTop: number
}

const memberCardScrollTop = (options: Options) => {
  const {containerScrollTop, containerTop, cardTop} = options
  return Math.max(0, containerScrollTop + cardTop - containerTop - STICKY_HEADER_OFFSET)
}

export default memberCardScrollTop

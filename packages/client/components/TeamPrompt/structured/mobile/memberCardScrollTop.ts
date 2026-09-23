export const STICKY_HEADER_OFFSET = 64

interface Options {
  containerScrollTop: number
  containerTop: number
  cardTop: number
  offset?: number
}

const memberCardScrollTop = (options: Options) => {
  const {containerScrollTop, containerTop, cardTop, offset = STICKY_HEADER_OFFSET} = options
  return Math.max(0, containerScrollTop + cardTop - containerTop - offset)
}

export default memberCardScrollTop

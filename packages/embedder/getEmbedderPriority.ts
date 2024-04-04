import ms from 'ms'

export const getEmbedderPriority = (maxDelayInDays: number) => {
  const maxDelayInSeconds = maxDelayInDays * ms('1d')
  // priority is a signed 4 bytes in PG, which overflows in 2038 so bitshift left so it works until 2106
  // timestamp is used so the queue is generally FIFO, but flexible
  return -(2 ** 31) + ~~(Date.now() / 1000) + maxDelayInSeconds
}

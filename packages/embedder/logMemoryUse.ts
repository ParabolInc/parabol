import {Logger} from '../server/utils/Logger'

// Not for use in prod, but useful for dev
export const logMemoryUse = () => {
  const MB = 2 ** 20
  setInterval(() => {
    const memoryUsage = process.memoryUsage()
    const {rss} = memoryUsage
    const usedMB = Math.floor(rss / MB)
    Logger.log('Memory use:', usedMB, 'MB')
  }, 10000).unref()
}

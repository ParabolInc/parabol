import profiler from 'v8-profiler-next'
import fs from 'fs'

const MB = 2 ** 20
const monitorMemory = () => {
  let nextThresh = 300 * MB // start recording at 300MB
  let isSnapping = false
  const heapDump = () => {
    if (isSnapping) return
    const memoryUsage = process.memoryUsage()
    const {rss} = memoryUsage
    if (rss > nextThresh) {
      isSnapping = true
      nextThresh = rss + 50 * MB // take a new snapshot every 50 MB
      const snap = profiler.takeSnapshot()
      const transform = snap.export()
      const usedMB = Math.floor(rss / MB)
      console.log('creating new snap', usedMB)
      transform.pipe(fs.createWriteStream(`snapshot-${usedMB}.json`))
      transform.on('finish', () => {
        isSnapping = false
        snap.delete()
      })
    }
  }

  setInterval(() => {
    setImmediate(heapDump)
  }, 5000)
}

export default monitorMemory()

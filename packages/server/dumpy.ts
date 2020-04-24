// import profiler from 'v8-profiler-next'
// import fs from 'fs'
// import path from 'path'

interface Options {
  path?: string
  checkEvery?: number
  dumpEvery?: number
}

let isInstalled = false
const dumpy = (options: Options) => {
  if (isInstalled) {
    console.log('Dumpy: Double Dump Disabled')
    return
  }
  isInstalled = true
  const checkEvery = options.checkEvery || 5000
  const dumpEvery = options.dumpEvery || 50
  console.log('Node PID:', process.pid)
  const MB = 2 ** 20
  let isEnabled = false
  let intervalId: NodeJS.Timeout
  let nextThresh = 0

  const stopMonitor = () => {
    console.log('Dumpy: MONITORING STOPPED')
    isEnabled = false
    clearInterval(intervalId)
  }

  const startMonitor = () => {
    console.log('Dumpy: MONITORING STARTED')
    isEnabled = true
    let isSnapping = false
    const heapDump = () => {
      if (isSnapping) return
      const memoryUsage = process.memoryUsage()
      const {rss} = memoryUsage
      if (rss > nextThresh) {
        isSnapping = true
        nextThresh = rss + dumpEvery * MB // take a new snapshot every 50 MB
        // const snap = profiler.takeSnapshot()
        // const transform = snap.export()
        // const usedMB = Math.floor(rss / MB)
        // const now = new Date().toJSON()
        // const fileName = `Dumpy_${now}-${usedMB}.json`
        // console.log(`Dumpy: New Dump! ${fileName}`)
        // const pathName = path.join(options.path || __dirname, fileName)
        // transform.pipe(fs.createWriteStream(pathName))
        // transform.on('error', (err) => {
        //   snap.delete()
        //   console.log('Dumpy: Error writing heap dump to disk')
        //   console.log(err)
        //   stopMonitor()
        // })
        // transform.on('finish', () => {
        //   isSnapping = false
        //   snap.delete()
        // })
      }
    }

    intervalId = setInterval(() => {
      setImmediate(heapDump)
    }, checkEvery)
  }

  const toggleMonitor = () => {
    if (isEnabled) {
      stopMonitor()
    } else {
      startMonitor()
    }
  }
  process.on('SIGPIPE', () => {
    toggleMonitor()
  })
}

export default dumpy

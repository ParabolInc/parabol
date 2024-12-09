const memwatch = require('memwatch-next')
const fs = require('fs')
const path = require('path')
import {Logger} from './Logger'

const startMemwatch = () => {
  Logger.log('starting memwatch')
  memwatch.on('leak', (info) => {
    Logger.error('Mem leak detected', info)
  })
  let snapStart
  let snapStop
  let heapDiff
  memwatch.on('stats', (stats) => {
    Logger.log(stats.current_base)
    if (stats.current_base > 137062320 && stats.current_base < 139000000 && !snapStart) {
      snapStart = true
      Logger.log('startMemwatch heapDiff')
      heapDiff = new memwatch.HeapDiff()
    }
    if (stats.current_base > 145000000 && snapStart && !snapStop) {
      snapStop = true
      const end = heapDiff.end()
      Logger.log('heapDiff end', end)
      const jsonPath = path.join(process.cwd(), 'leak.json')
      fs.writeFileSync(jsonPath, JSON.stringify(end, null, 2))
    }
  })
}

export default startMemwatch

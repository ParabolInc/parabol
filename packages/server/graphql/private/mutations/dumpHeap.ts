import fs from 'fs'
import inspector from 'inspector'
import path from 'path'
import {MutationResolvers} from '../resolverTypes'

declare const __PROJECT_ROOT__: string

const dumpHeap: MutationResolvers['dumpHeap'] = async (_source, {isDangerous}, {authToken}) => {
  if (!isDangerous)
    return 'This action will block the server for about 1 minute, Must ack the danger!'
  return new Promise((resolve) => {
    global.gc?.()
    const memoryUsage = process.memoryUsage()
    const {rss} = memoryUsage
    const session = new inspector.Session()
    const MB = 2 ** 20
    const usedMB = Math.floor(rss / MB)
    const now = new Date().toJSON()
    const fileName = `Dumpy_${now}-${usedMB}.heapsnapshot`
    const pathName = path.join(__PROJECT_ROOT__, fileName)
    const fd = fs.openSync(pathName, 'w')
    session.connect()
    session.on('HeapProfiler.addHeapSnapshotChunk', (m) => {
      fs.writeSync(fd, m.params.chunk)
    })
    session.post('HeapProfiler.takeHeapSnapshot', undefined, (err) => {
      session.disconnect()
      fs.closeSync(fd)
      resolve(err || pathName)
    })
  })
}

export default dumpHeap

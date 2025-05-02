import fs from 'fs'
import inspector from 'inspector'
import os from 'os'
import path from 'path'
import sleep from '../../../../client/utils/sleep'
import {disconnectAllSockets} from '../../../disconnectAllSockets'
import {setIsBusy} from '../../../getIsBusy'
import {Logger} from '../../../utils/Logger'
import {MutationResolvers} from '../resolverTypes'

const {SERVER_ID} = process.env

const dumpHeap: MutationResolvers['dumpHeap'] = async (
  _source,
  {isDangerous, disconnectSockets}
) => {
  if (!isDangerous)
    return 'This action will block the server for about 1 minute, Must ack the danger!'
  Logger.log('[Heap Dump]: Marking server as busy')
  setIsBusy(true)
  // wait 10 seconds for the readiness probe to fail
  await sleep(10_000)
  if (disconnectSockets) {
    Logger.log('[Heap Dump]: Disconnecting Sockets')
    await disconnectAllSockets()
  }
  Logger.log('[Heap Dump]: Ready to Dump')
  return new Promise((resolve) => {
    global.gc?.()
    const memoryUsage = process.memoryUsage()
    const {rss} = memoryUsage
    const session = new inspector.Session()
    const MB = 2 ** 20
    const usedMB = Math.floor(rss / MB)
    const now = new Date().toJSON()
    const fileName = `Dumpy_${now}_${SERVER_ID}_${usedMB}.heapsnapshot`
    const pathName = path.join(os.tmpdir(), fileName)
    const fd = fs.openSync(pathName, 'w')
    session.connect()
    session.on('HeapProfiler.addHeapSnapshotChunk', (m) => {
      fs.writeSync(fd, m.params.chunk)
    })
    session.post('HeapProfiler.takeHeapSnapshot', undefined, (err) => {
      session.disconnect()
      fs.closeSync(fd)
      Logger.log('[Heap Dump]: Dump Complete')
      setIsBusy(false)
      resolve(err?.toString() || pathName)
    })
  })
}

process.on('SIGUSR2', () => {
  dumpHeap({}, {isDangerous: true}, {} as any, {} as any)
})
export default dumpHeap

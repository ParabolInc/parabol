import {GraphQLBoolean, GraphQLNonNull, GraphQLString} from 'graphql'
import {requireSU} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'
import fs from 'fs'
import path from 'path'
import inspector from 'inspector'

const dumpHeap = {
  type: GraphQLString,
  description: 'dump the memory heap to a file',
  args: {
    isDangerous: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'must pass true to make it work'
    }
  },
  resolve: async (
    _source: unknown,
    {isDangerous}: {isDangerous: boolean},
    {authToken}: GQLContext
  ) => {
    // AUTH
    requireSU(authToken)
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
      const PROJECT_ROOT = path.join(__dirname, '..', '..', '..', '..', '..')
      const pathName = path.join(PROJECT_ROOT, fileName)
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
}

export default dumpHeap

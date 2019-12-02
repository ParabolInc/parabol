import {GraphQLBoolean, GraphQLNonNull, GraphQLString} from 'graphql'
import {requireSU} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'
import fs from 'fs'
import path from 'path'
import profiler from 'v8-profiler-next'

const dumpHeap = {
  type: GraphQLString,
  description: 'dump the memory heap to a file',
  args: {
    isDangerous: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'must pass true to make it work'
    }
  },
  resolve: async (_source, {isDangerous}, {authToken}: GQLContext) => {
    // AUTH
    requireSU(authToken)
    if (!isDangerous)
      return 'This action will block the server for about 1 minute, Must ack the danger!'
    global.gc?.()
    const memoryUsage = process.memoryUsage()
    const {rss} = memoryUsage
    const snap = profiler.takeSnapshot()
    const transform = snap.export()
    const MB = 2 ** 20
    const usedMB = Math.floor(rss / MB)
    const now = new Date().toJSON()
    const fileName = `Dumpy_${now}-${usedMB}.heapsnapshot`
    const PROJECT_ROOT = path.join(__dirname, '..', '..', '..', '..', '..')
    const pathName = path.join(PROJECT_ROOT, fileName)
    transform.pipe(fs.createWriteStream(pathName))
    return new Promise((resolve, reject) => {
      transform.on('error', (err) => {
        snap.delete()
        console.log('Error writing heap dump to disk')
        console.log(err)
        reject(err)
      })
      transform.on('finish', () => {
        snap.delete()
        resolve(pathName)
      })
    })
  }
}

export default dumpHeap

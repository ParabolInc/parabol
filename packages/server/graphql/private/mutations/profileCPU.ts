import fs from 'fs'
import inspector from 'inspector'
import {MutationResolvers} from '../resolverTypes'

let session: inspector.Session

const enable = () => {
  return new Promise<void>((resolve) => {
    session.post('Profiler.enable', () => {
      resolve()
    })
  })
}

const start = () => {
  return new Promise<void>((resolve) => {
    session.post('Profiler.start', () => {
      resolve()
    })
  })
}

const stop = () => {
  return new Promise((resolve, reject) => {
    session.post('Profiler.stop', (err, {profile}) => {
      session.disconnect()
      ;(session as any) = undefined
      if (err) {
        reject(err)
      } else {
        resolve(profile)
      }
    })
  })
}

const profileCPU: MutationResolvers['profileCPU'] = async (_source, _args, {authToken}) => {
  if (!session) {
    session = new inspector.Session()
    session.connect()
    await enable()
    await start()
    return 'CPU Profiling started'
  }

  const profile = await stop()
  const profileStr = JSON.stringify(profile)
  const name = `cpu-${new Date().toJSON()}.cpuprofile`
  fs.writeFileSync(name, profileStr)
  return `CPU Profile: ${name}`
}

export default profileCPU

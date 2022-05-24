//import executeGraphQL, {GQLRequest} from '../graphql/executeGraphQL'
import getPubSub from './getPubSub'
import Redis from 'ioredis'

const {REDIS_URL} = process.env


export interface SubOptions {
  mutatorId?: string
  operationId?: string | null
}

const redis = new Redis(REDIS_URL, {connectionName: 'subscription'})
const resolve = async (channel: string, rootValue, subOptions: SubOptions) => {
  const {operationId} = subOptions

  const subscriptions = redis.hscanStream(`subscription:${channel}`)

  subscriptions.on('data', async ([socketId, data]) => {
    try {

      const request = JSON.parse(data)

      // requrie here to avoid circular imports
      const executeGraphQL = require('../graphql/executeGraphQL').default
      const response = await executeGraphQL({
        ...request,
        rootValue,
        dataLoaderId: operationId ?? undefined
      })

      getPubSub()
        .publish(`${socketId}:${channel}`, response)
        .catch(console.error)
    } catch(error) {
      console.error(error)
    }
  })
}

const publish = <T>(
  topic: T,
  channel: string,
  type: any,
  payload: {[key: string]: any},
  subOptions: SubOptions = {}
) => {
  const subName = `${topic}Subscription`
  const data = {...payload, type}
  const rootValue = {[subName]: data}

  resolve(`${topic}.${channel}`, rootValue, subOptions)
}

export default publish

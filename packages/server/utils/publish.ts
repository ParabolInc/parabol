import getPubSub from './getPubSub'
import GQLExecutorId from '../../client/shared/gqlIds/GQLExecutorId'

export interface SubOptions {
  mutatorId?: string
  operationId?: string | null
}

const {SERVER_ID} = process.env
const serverChannel = GQLExecutorId.join(SERVER_ID!)

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
  getPubSub()
    .publish(`${topic}.${channel}`, {rootValue, serverChannel, ...subOptions})
    .catch(console.error)
}

export default publish

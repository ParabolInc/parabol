import getPubSub from './getPubSub'
import {Logger} from './Logger'

export interface SubOptions {
  mutatorId?: string // passing the socket id of the mutator will omit sending a message to that user
  operationId?: string | null
}

const {SERVER_ID} = process.env

const publish = <T>(
  topic: T,
  channel: string,
  type: string,
  payload: {[key: string]: any},
  subOptions: SubOptions = {},
  sendToSelf: boolean = true
) => {
  const subName = `${topic}Subscription`
  const rootValue = {[subName]: {fieldName: type, [type]: payload}}
  const executorServerId = sendToSelf ? SERVER_ID! : undefined
  getPubSub()
    .publish(`${topic}.${channel}`, {rootValue, executorServerId, ...subOptions})
    .catch(Logger.error)
}

export default publish

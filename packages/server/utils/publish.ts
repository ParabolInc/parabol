import getPubSub from './getPubSub'

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
  subOptions: SubOptions = {}
) => {
  const subName = `${topic}Subscription`
  const rootValue = {[subName]: {fieldName: type, [type]: payload}}
  getPubSub()
    .publish(`${topic}.${channel}`, {rootValue, executorServerId: SERVER_ID!, ...subOptions})
    .catch(console.error)
}

export default publish

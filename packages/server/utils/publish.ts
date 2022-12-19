import getPubSub from './getPubSub'

export interface SubOptions {
  mutatorId: string | null // if the viewer's client has received a mutation response from the server, but a subsequent update happens in the mutation, update the client by publishing a subscription. To do this, set mutatorId to null/undefined: https://github.com/ParabolInc/parabol/blob/88a801d80d0c51c38b6c9722dfa80fbca8f7bebd/packages/server/graphql/ResponseStream.ts#L26
  operationId?: string | null
}

const {SERVER_ID} = process.env

const publish = <T>(
  topic: T,
  channel: string,
  type: string,
  payload: {[key: string]: any},
  subOptions: SubOptions = {mutatorId: null}
) => {
  const subName = `${topic}Subscription`
  const data = {...payload, type}
  const rootValue = {[subName]: data}
  getPubSub()
    .publish(`${topic}.${channel}`, {rootValue, executorServerId: SERVER_ID!, ...subOptions})
    .catch(console.error)
}

export default publish

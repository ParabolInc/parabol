import getPubSub from 'server/utils/getPubSub'
import {GraphQLObjectType} from 'graphql'

type Topic = 'team' | 'organization' | 'notification' | 'newAuthToken' | 'task'

interface SubOptions {
  mutatorId?: string
  operationId?: number | null
}

const publish = (
  topic: Topic,
  channel: string,
  type: GraphQLObjectType | 'updated',
  payload: {[key: string]: any},
  subOptions: SubOptions = {}
) => {
  const data = {
    ...payload,
    type
  }

  getPubSub()
    .publish(`${topic}.${channel}`, {data, ...subOptions})
    .catch()
}

export default publish

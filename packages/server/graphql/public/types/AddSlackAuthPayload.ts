import type {AddSlackAuthPayloadResolvers} from '../resolverTypes'

export type AddSlackAuthPayloadSource = {
  slackAuthId: string
  userId: string
}

const AddSlackAuthPayload: AddSlackAuthPayloadResolvers = {
  slackIntegration: async (source, _args, {dataLoader}) => {
    return dataLoader.get('slackAuths').loadNonNull(source.slackAuthId)
  },
  user: async (source, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(source.userId)
  }
}

export default AddSlackAuthPayload

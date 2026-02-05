import type {AddSlackAuthPayloadResolvers} from '../resolverTypes'

export type AddSlackAuthPayloadSource =
  | {
      slackAuthId: string
      userId: string
    }
  | {error: {message: string}}

const AddSlackAuthPayload: AddSlackAuthPayloadResolvers = {
  slackIntegration: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('slackAuths').loadNonNull(source.slackAuthId)
  },
  user: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('users').loadNonNull(source.userId)
  }
}

export default AddSlackAuthPayload

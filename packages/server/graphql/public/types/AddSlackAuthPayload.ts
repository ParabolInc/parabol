import {AddSlackAuthPayloadResolvers} from '../resolverTypes'

export type AddSlackAuthPayloadSource =
  | {
      slackAuthId: string
      userId: string
    }
  | {error: {message: string}}

const AddSlackAuthPayload: AddSlackAuthPayloadResolvers = {
  slackIntegration: async (source, _args, {dataLoader}) => {
    return 'slackAuthId' in source
      ? dataLoader.get('slackAuths').loadNonNull(source.slackAuthId)
      : null
  },

  user: (source, _args, {dataLoader}) => {
    return 'userId' in source ? dataLoader.get('users').loadNonNull(source.userId) : null
  }
}

export default AddSlackAuthPayload

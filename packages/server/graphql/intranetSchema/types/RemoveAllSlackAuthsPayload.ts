import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../../graphql'
import makeMutationPayload from '../../types/makeMutationPayload'

export const RemoveAllSlackAuthsSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'RemoveAllSlackAuthsSuccess',
  fields: () => ({
    slackAuthRes: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Response from removing all Slack auths'
    },
    slackNotificationRes: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Response from removing all Slack notifications'
    }
  })
})

const RemoveAllSlackAuthsPayload = makeMutationPayload(
  'RemoveAllSlackAuthsPayload',
  RemoveAllSlackAuthsSuccess
)

export default RemoveAllSlackAuthsPayload

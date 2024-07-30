import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'

const TeamPromptMeetingSettings: GraphQLObjectType<any, GQLContext> = new GraphQLObjectType<
  any,
  GQLContext
>({
  name: 'TeamPromptMeetingSettings',
  fields: {}
})

export default TeamPromptMeetingSettings

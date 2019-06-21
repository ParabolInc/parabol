import {GraphQLObjectType} from 'graphql'
import NewMeetingStage, {newMeetingStageFields} from 'server/graphql/types/NewMeetingStage'
import NewMeetingTeamMemberStage, {
  newMeetingTeamMemberStageFields
} from 'server/graphql/types/NewMeetingTeamMemberStage'
import {GQLContext} from 'server/graphql/graphql'

const UpdatesStage = new GraphQLObjectType<any, GQLContext, any>({
  name: 'UpdatesStage',
  description: 'A stage that focuses on a single team member',
  interfaces: () => [NewMeetingStage, NewMeetingTeamMemberStage],
  fields: () => ({
    ...newMeetingStageFields(),
    ...newMeetingTeamMemberStageFields()
  })
})

export default UpdatesStage

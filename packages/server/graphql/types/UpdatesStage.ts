import {GraphQLObjectType} from 'graphql'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'
import NewMeetingTeamMemberStage, {
  newMeetingTeamMemberStageFields
} from './NewMeetingTeamMemberStage'
import {GQLContext} from '../graphql'

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

import {GraphQLObjectType} from 'graphql'
import NewMeetingStage, {newMeetingStageFields} from 'server/graphql/types/NewMeetingStage'
import NewMeetingTeamMemberStage, {
  newMeetingTeamMemberStageFields
} from 'server/graphql/types/NewMeetingTeamMemberStage'

const CheckInStage = new GraphQLObjectType({
  name: 'CheckInStage',
  description: 'A stage that focuses on a single team member',
  interfaces: () => [NewMeetingStage, NewMeetingTeamMemberStage],
  fields: () => ({
    ...newMeetingStageFields(),
    ...newMeetingTeamMemberStageFields()
  })
})

export default CheckInStage

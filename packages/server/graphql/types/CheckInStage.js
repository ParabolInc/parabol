import {GraphQLObjectType} from 'graphql'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'
import NewMeetingTeamMemberStage, {
  newMeetingTeamMemberStageFields
} from './NewMeetingTeamMemberStage'

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

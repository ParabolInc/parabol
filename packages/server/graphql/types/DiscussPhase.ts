import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import NewMeetingPhase, {newMeetingPhaseFields} from './NewMeetingPhase'
import RetroDiscussStage from './RetroDiscussStage'

const DiscussPhase = new GraphQLObjectType({
  name: 'DiscussPhase',
  description: 'The meeting phase where all team members discuss the topics with the most votes',
  interfaces: () => [NewMeetingPhase],
  fields: () => ({
    ...newMeetingPhaseFields(),
    stages: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RetroDiscussStage)))
    }
  })
})

export default DiscussPhase

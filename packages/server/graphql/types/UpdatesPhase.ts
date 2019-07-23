import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import NewMeetingPhase, {newMeetingPhaseFields} from 'server/graphql/types/NewMeetingPhase'
import UpdatesStage from 'server/graphql/types/UpdatesStage'

const UpdatesPhase = new GraphQLObjectType({
  name: 'UpdatesPhase',
  description: 'The meeting phase where all team members give updates one-by-one',
  interfaces: () => [NewMeetingPhase],
  fields: () => ({
    ...newMeetingPhaseFields(),
    stages: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UpdatesStage)))
    }
  })
})

export default UpdatesPhase

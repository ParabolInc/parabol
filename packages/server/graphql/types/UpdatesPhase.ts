import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import NewMeetingPhase, {newMeetingPhaseFields} from './NewMeetingPhase'
import UpdatesStage from './UpdatesStage'
import {GQLContext} from '../graphql'

const UpdatesPhase = new GraphQLObjectType<any, GQLContext>({
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

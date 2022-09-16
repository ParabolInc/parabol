import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveGQLStagesFromPhase} from '../resolvers'
import NewMeetingPhase, {newMeetingPhaseFields} from './NewMeetingPhase'
import UpdatesStage from './UpdatesStage'

const UpdatesPhase = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdatesPhase',
  description: 'The meeting phase where all team members give updates one-by-one',
  interfaces: () => [NewMeetingPhase],
  fields: () => ({
    ...newMeetingPhaseFields(),
    stages: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UpdatesStage))),
      resolve: resolveGQLStagesFromPhase
    }
  })
})

export default UpdatesPhase

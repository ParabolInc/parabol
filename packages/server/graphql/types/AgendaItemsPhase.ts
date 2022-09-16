import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveGQLStagesFromPhase} from '../resolvers'
import AgendaItemsStage from './AgendaItemsStage'
import NewMeetingPhase, {newMeetingPhaseFields} from './NewMeetingPhase'

const AgendaItemsPhase = new GraphQLObjectType<any, GQLContext>({
  name: 'AgendaItemsPhase',
  description: 'The meeting phase where all team members discuss the topics with the most votes',
  interfaces: () => [NewMeetingPhase],
  fields: () => ({
    ...newMeetingPhaseFields(),
    stages: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AgendaItemsStage))),
      resolve: resolveGQLStagesFromPhase
    }
  })
})

export default AgendaItemsPhase

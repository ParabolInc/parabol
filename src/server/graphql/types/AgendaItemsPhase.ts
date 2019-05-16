import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import NewMeetingPhase, {newMeetingPhaseFields} from 'server/graphql/types/NewMeetingPhase'
import AgendaItemsStage from 'server/graphql/types/AgendaItemsStage'

const AgendaItemsPhase = new GraphQLObjectType({
  name: 'AgendaItemsPhase',
  description: 'The meeting phase where all team members discuss the topics with the most votes',
  interfaces: () => [NewMeetingPhase],
  fields: () => ({
    ...newMeetingPhaseFields(),
    stages: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AgendaItemsStage)))
    }
  })
})

export default AgendaItemsPhase

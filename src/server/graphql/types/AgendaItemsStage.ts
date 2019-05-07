import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import NewMeetingStage, {newMeetingStageFields} from 'server/graphql/types/NewMeetingStage'

const AgendaItemsStage = new GraphQLObjectType({
  name: 'AgendaItemsStage',
  description: 'The stage where the team discusses a single agenda item',
  interfaces: () => [NewMeetingStage],
  fields: () => ({
    ...newMeetingStageFields(),
    agendaItemId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the agenda item this relates to'
    }
  })
})

export default AgendaItemsStage

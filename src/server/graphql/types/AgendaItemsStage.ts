import {GraphQLFloat, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import NewMeetingStage, {newMeetingStageFields} from 'server/graphql/types/NewMeetingStage'

const AgendaItemsStage = new GraphQLObjectType({
  name: 'AgendaItemsStage',
  description: 'The stage where the team discusses a single agenda item',
  interfaces: () => [NewMeetingStage],
  fields: () => ({
    ...newMeetingStageFields(),
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The sort order for re-prioritizing agenda items'
    }
  })
})

export default AgendaItemsStage

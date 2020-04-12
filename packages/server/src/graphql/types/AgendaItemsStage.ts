import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import AgendaItem from './AgendaItem'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'

const AgendaItemsStage = new GraphQLObjectType<any, GQLContext>({
  name: 'AgendaItemsStage',
  description: 'The stage where the team discusses a single agenda item',
  interfaces: () => [NewMeetingStage],
  fields: () => ({
    ...newMeetingStageFields(),
    agendaItemId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the agenda item this relates to'
    },
    agendaItem: {
      type: new GraphQLNonNull(AgendaItem),
      resolve: ({agendaItemId}, _args, {dataLoader}) => {
        return dataLoader.get('agendaItems').load(agendaItemId)
      }
    }
  })
})

export default AgendaItemsStage

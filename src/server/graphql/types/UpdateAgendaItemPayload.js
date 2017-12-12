import {GraphQLObjectType} from 'graphql';
import AgendaItem from 'server/graphql/types/AgendaItem';

const UpdateAgendaItemPayload = new GraphQLObjectType({
  name: 'UpdateAgendaItemPayload',
  fields: () => ({
    agendaItem: {
      type: AgendaItem
    }
  })
});

export default UpdateAgendaItemPayload;

import {GraphQLObjectType} from 'graphql';
import AgendaItem from 'server/graphql/types/AgendaItem';

const RemoveAgendaItemPayload = new GraphQLObjectType({
  name: 'RemoveAgendaItemPayload',
  fields: () => ({
    agendaItem: {
      type: AgendaItem
    }
  })
});

export default RemoveAgendaItemPayload;

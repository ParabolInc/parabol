import {GraphQLObjectType} from 'graphql';
import AgendaItem from 'server/graphql/types/AgendaItem';

const AddAgendaItemPayload = new GraphQLObjectType({
  name: 'AddAgendaItemPayload',
  fields: () => ({
    agendaItem: {
      type: AgendaItem
    }
  })
});

export default AddAgendaItemPayload;

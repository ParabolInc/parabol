import {GraphQLObjectType} from 'graphql';
import {resolveAgendaItem} from 'server/graphql/resolvers';
import AgendaItem from 'server/graphql/types/AgendaItem';

const AddAgendaItemPayload = new GraphQLObjectType({
  name: 'AddAgendaItemPayload',
  fields: () => ({
    agendaItem: {
      type: AgendaItem,
      resolve: resolveAgendaItem
    }
  })
});

export default AddAgendaItemPayload;

import {GraphQLObjectType} from 'graphql';
import {resolveAgendaItem} from 'server/graphql/resolvers';
import AgendaItem from 'server/graphql/types/AgendaItem';
import StandardMutationError from 'server/graphql/types/StandardMutationError';

const AddAgendaItemPayload = new GraphQLObjectType({
  name: 'AddAgendaItemPayload',
  fields: () => ({
    agendaItem: {
      type: AgendaItem,
      resolve: resolveAgendaItem
    },
    error: {
      type: StandardMutationError
    }
  })
});

export default AddAgendaItemPayload;

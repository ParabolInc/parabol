import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import AddAgendaItemPayload from 'server/graphql/types/AddAgendaItemPayload';
import RemoveAgendaItemPayload from 'server/graphql/types/RemoveAgendaItemPayload';
import UpdateAgendaItemPayload from 'server/graphql/types/UpdateAgendaItemPayload';

const types = [AddAgendaItemPayload, RemoveAgendaItemPayload, UpdateAgendaItemPayload];

export default new GraphQLSubscriptionType('AgendaItemSubscriptionPayload', types);

import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import AddAgendaItemPayload from 'server/graphql/types/AddAgendaItemPayload';
import MoveMeetingPayload from 'server/graphql/types/MoveMeetingPayload';
import RemoveAgendaItemPayload from 'server/graphql/types/RemoveAgendaItemPayload';
import UpdateAgendaItemPayload from 'server/graphql/types/UpdateAgendaItemPayload';

const types = [
  AddAgendaItemPayload,
  RemoveAgendaItemPayload,
  UpdateAgendaItemPayload,
  MoveMeetingPayload
];

export default new GraphQLSubscriptionType('AgendaItemSubscriptionPayload', types);

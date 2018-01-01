import {GraphQLUnionType} from 'graphql';
import NotifyFacilitatorDisconnected from 'server/graphql/types/NotifyFacilitatorDisconnected';
import {FACILITATOR_DISCONNECTED} from 'universal/utils/constants';

const resolveTypeLookup = {
  [FACILITATOR_DISCONNECTED]: NotifyFacilitatorDisconnected
};

const MeetingUpdatedNotification = new GraphQLUnionType({
  name: 'MeetingUpdatedNotification',
  types: () => Object.values(resolveTypeLookup),
  resolveType: ({type}) => resolveTypeLookup[type]
});

export default MeetingUpdatedNotification;

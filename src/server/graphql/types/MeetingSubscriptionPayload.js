import {GraphQLUnionType} from 'graphql';
import MeetingFacilitatorChanged from 'server/graphql/types/MeetingFacilitatorChanged';
import MeetingMoved from 'server/graphql/types/MeetingMoved';
import MeetingUpdated from 'server/graphql/types/MeetingUpdated';
import {FACILITATOR_CHANGED, MOVED, UPDATED} from 'universal/utils/constants';

const MeetingSubscriptionPayload = new GraphQLUnionType({
  name: 'MeetingSubscriptionPayload',
  types: () => [MeetingUpdated, MeetingMoved, MeetingFacilitatorChanged],
  resolveType(value) {
    const resolveTypeLookup = {
      [UPDATED]: MeetingUpdated,
      [MOVED]: MeetingMoved,
      [FACILITATOR_CHANGED]: MeetingFacilitatorChanged
    };

    return resolveTypeLookup[value.type];
  }
});
export default MeetingSubscriptionPayload;

import {GraphQLEnumType} from 'graphql';
import {AGENDA_ITEMS, CHECKIN, FIRST_CALL, LAST_CALL, LOBBY, SUMMARY, UPDATES} from 'universal/utils/constants';

const MeetingPhaseEnum = new GraphQLEnumType({
  name: 'MeetingPhaseEnum',
  description: 'The phase of the meeting',
  values: {
    [LOBBY]: {},
    [CHECKIN]: {},
    [UPDATES]: {},
    [FIRST_CALL]: {},
    [AGENDA_ITEMS]: {},
    [LAST_CALL]: {},
    [SUMMARY]: {}
  }
});

export default MeetingPhaseEnum;

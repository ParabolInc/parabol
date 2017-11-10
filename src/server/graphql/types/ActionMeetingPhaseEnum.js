import {GraphQLEnumType} from 'graphql';
import {CHECKIN, FIRST_CALL, LAST_CALL, LOBBY, SUMMARY, UPDATES} from 'universal/utils/constants';

const ActionMeetingPhaseEnum = new GraphQLEnumType({
  name: 'ActionMeetingPhaseEnum',
  description: 'The phases of an action meeting',
  values: {
    [LOBBY]: {},
    [CHECKIN]: {},
    [UPDATES]: {},
    [FIRST_CALL]: {},
    [LAST_CALL]: {},
    [SUMMARY]: {}
  }
});

export default ActionMeetingPhaseEnum;

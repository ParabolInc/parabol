import {GraphQLEnumType} from 'graphql';
import {ACTION, RETROSPECTIVE} from 'universal/utils/constants';

const MeetingTypeEnum = new GraphQLEnumType({
  name: 'MeetingTypeEnum',
  description: 'The phases of an action meeting',
  values: {
    [ACTION]: {},
    [RETROSPECTIVE]: {}
  }
});

export default MeetingTypeEnum;

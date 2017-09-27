import {GraphQLEnumType} from 'graphql';
import {ENTERPRISE, PERSONAL, PRO} from 'universal/utils/constants';

const TierEnum = new GraphQLEnumType({
  name: 'TierEnum',
  description: 'The phase of the meeting',
  values: {
    [PERSONAL]: {},
    [PRO]: {},
    [ENTERPRISE]: {}
  }
});

export default TierEnum;

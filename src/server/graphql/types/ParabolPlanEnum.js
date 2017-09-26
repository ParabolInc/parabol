import {GraphQLEnumType} from 'graphql';
import {ENTERPRISE, FREE, PRO} from 'universal/utils/constants';

const ParabolPlanEnum = new GraphQLEnumType({
  name: 'ParabolPlanEnum',
  description: 'The phase of the meeting',
  values: {
    [FREE]: {},
    [PRO]: {},
    [ENTERPRISE]: {}
  }
});

export default ParabolPlanEnum;

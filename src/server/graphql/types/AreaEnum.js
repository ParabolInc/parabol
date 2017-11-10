import {GraphQLEnumType} from 'graphql';
import {MEETING} from 'universal/utils/constants';

const AreaEnum = new GraphQLEnumType({
  name: 'AreaEnum',
  description: 'The part of the site that is calling the mutation',
  values: {
    [MEETING]: {}
  }
});

export default AreaEnum;

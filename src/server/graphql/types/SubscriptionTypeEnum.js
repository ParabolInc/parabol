import {GraphQLEnumType} from 'graphql';
import {ADD, DELETE, REPLACE, UPDATE} from 'universal/utils/constants';

const SubscriptionTypeEnum = new GraphQLEnumType({
  name: 'SubscriptionTypeEnum',
  description: 'full doc if ADD or REPLACE, partial if UPDATE, just id if DELETE',
  values: {
    [ADD]: {},
    [UPDATE]: {},
    [DELETE]: {},
    [REPLACE]: {}
  }
});

export default SubscriptionTypeEnum;

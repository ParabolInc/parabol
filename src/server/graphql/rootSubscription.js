import {GraphQLObjectType} from 'graphql';
import team from './models/Team/teamSubscription';
import presence from './models/Presence/presenceSubscription';

const rootFields = Object.assign({},
  team,
  presence
);

export default new GraphQLObjectType({
  name: 'RootSubscription',
  fields: () => rootFields
});

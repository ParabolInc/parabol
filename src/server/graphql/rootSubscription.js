import {GraphQLObjectType} from 'graphql';
import meeting from './models/Meeting/meetingSubscription';
import presence from './models/Presence/presenceSubscription';

const rootFields = Object.assign({},
  meeting,
  presence
);

export default new GraphQLObjectType({
  name: 'RootSubscription',
  fields: () => rootFields
});

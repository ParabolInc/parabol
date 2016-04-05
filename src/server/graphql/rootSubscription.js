import {GraphQLObjectType} from 'graphql';
import meeting from './models/Meeting/meetingSubscription';

const rootFields = Object.assign(meeting);

export default new GraphQLObjectType({
  name: 'RootSubscription',
  fields: () => rootFields
});

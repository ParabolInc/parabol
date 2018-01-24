import {GraphQLObjectType, GraphQLSchema} from 'graphql';
import autopauseUsers from 'server/graphql/intranetSchema/mutations/autopauseUsers';
import endOldMeetings from 'server/graphql/intranetSchema/mutations/endOldMeetings';
import sendBatchNotificationEmails from 'server/graphql/intranetSchema/mutations/sendBatchNotificationEmails';
import intranetPing from 'server/graphql/intranetSchema/queries/intranetPing';

const queryFields = {
  // TODO move 3 of these to mutations. Requires change in chronos i think
  autopauseUsers,
  endOldMeetings,
  sendBatchNotificationEmails,
  intranetPing
};

const query = new GraphQLObjectType({
  name: 'IntranetQuery',
  fields: () => queryFields
});

export default new GraphQLSchema({query});

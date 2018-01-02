/* eslint-disable no-undef */
import {GraphQLSchema} from 'graphql';
import NotifyDenial from 'server/graphql/types/NotifyDenial';
import NotifyFacilitatorRequest from 'server/graphql/types/NotifyFacilitatorRequest';
import NotifyInvitation from 'server/graphql/types/NotifyInvitation';
import NotifyNewTeamMember from 'server/graphql/types/NotifyNewTeamMember';
import NotifyPaymentRejected from 'server/graphql/types/NotifyPaymentRejected';
import NotifyPromoteToOrgLeader from 'server/graphql/types/NotifyPromoteToOrgLeader';
import NotifyTeamArchived from 'server/graphql/types/NotifyTeamArchived';
import NotifyVersionInfo from 'server/graphql/types/NotifyVersionInfo';
import OrganizationAddedNotification from 'server/graphql/types/OrganizationAddedNotification';
import mutation from './rootMutation';
import query from './rootQuery';
import subscription from './rootSubscription';
import NotifyKickedOut from 'server/graphql/types/NotifyKickedOut';
import NotifyProjectInvolves from 'server/graphql/types/NotifyProjectInvolves';
import NotifyFacilitatorDisconnected from 'server/graphql/types/NotifyFacilitatorDisconnected';

export default new GraphQLSchema({
  query,
  mutation,
  subscription,
  types: [
    NotifyDenial,
    NotifyFacilitatorDisconnected,
    NotifyFacilitatorRequest,
    NotifyInvitation,
    NotifyKickedOut,
    NotifyNewTeamMember,
    NotifyPaymentRejected,
    NotifyProjectInvolves,
    NotifyPromoteToOrgLeader,
    NotifyTeamArchived,
    NotifyVersionInfo,
    OrganizationAddedNotification
  ]
});

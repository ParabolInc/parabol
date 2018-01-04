/* eslint-disable no-undef */
import {GraphQLSchema} from 'graphql';
import NotifyAddedToTeam from 'server/graphql/types/NotifyAddedToTeam';
import NotifyDenial from 'server/graphql/types/NotifyDenial';
import NotifyFacilitatorDisconnected from 'server/graphql/types/NotifyFacilitatorDisconnected';
import NotifyFacilitatorRequest from 'server/graphql/types/NotifyFacilitatorRequest';
import NotifyInvitation from 'server/graphql/types/NotifyInvitation';
import NotifyInviteeApproved from 'server/graphql/types/NotifyInviteeApproved';
import NotifyKickedOut from 'server/graphql/types/NotifyKickedOut';
import NotifyNewTeamMember from 'server/graphql/types/NotifyNewTeamMember';
import NotifyPaymentRejected from 'server/graphql/types/NotifyPaymentRejected';
import NotifyProjectInvolves from 'server/graphql/types/NotifyProjectInvolves';
import NotifyPromoteToOrgLeader from 'server/graphql/types/NotifyPromoteToOrgLeader';
import NotifyTeamArchived from 'server/graphql/types/NotifyTeamArchived';
import NotifyVersionInfo from 'server/graphql/types/NotifyVersionInfo';
import mutation from './rootMutation';
import query from './rootQuery';
import subscription from './rootSubscription';

export default new GraphQLSchema({
  query,
  mutation,
  subscription,
  types: [
    NotifyAddedToTeam,
    NotifyDenial,
    NotifyFacilitatorDisconnected,
    NotifyFacilitatorRequest,
    NotifyInvitation,
    NotifyInviteeApproved,
    NotifyKickedOut,
    NotifyNewTeamMember,
    NotifyPaymentRejected,
    NotifyProjectInvolves,
    NotifyPromoteToOrgLeader,
    NotifyTeamArchived,
    NotifyVersionInfo
  ]
});

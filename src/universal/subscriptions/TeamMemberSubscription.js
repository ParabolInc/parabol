import {acceptTeamInviteTeamMemberUpdater} from 'universal/mutations/AcceptTeamInviteMutation';
import {inviteTeamMembersTeamMemberUpdater} from 'universal/mutations/InviteTeamMembersMutation';
import {removeTeamMemberTeamMemberUpdater} from 'universal/mutations/RemoveTeamMemberMutation';

// ... on TeamMemberAdded {
//  teamMember {
//  ...CompleteTeamMemberFrag
//  }
//  notification {
//    type
//      team {
//      name
//    }
//    teamMember {
//      preferredName
//    }
//  }
//  removedInvitation {
//    id
//    teamId
//  }
// }
// ... on TeamMemberUpdated {
//  teamMember {
//  ...CompleteTeamMemberFrag
//  }
// }

const subscription = graphql`
  subscription TeamMemberSubscription {
    teamMemberSubscription {
      __typename
      ...AcceptTeamInviteMutation_teamMember
      ...RemoveTeamMemberMutation_teamMember
      ...InviteTeamMembersMutation_teamMember
      ...MeetingCheckInMutation_teamMember
      ...PromoteToTeamLeadMutation_teamMember
    }
  }
`;

const TeamMemberSubscription = (environment, queryVariables, subParams) => {
  const {dispatch} = subParams;
  const {viewerId} = environment;
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('teamMemberSubscription');
      const type = payload.getValue('__typename');
      switch (type) {
        case 'AcceptTeamInviteNotificationPayload':
        case 'AcceptTeamInviteEmailPayload':
          acceptTeamInviteTeamMemberUpdater(payload, store, viewerId, dispatch);
          break;
        case 'RemoveTeamMemberPayload':
          removeTeamMemberTeamMemberUpdater(payload, store);
          break;
        case 'InviteTeamMembersPayload':
          inviteTeamMembersTeamMemberUpdater(payload, store, dispatch);
          break;

        default:
          console.error('TeamMemberSubscription case fail', type);
      }
      // if (type === 'TeamMemberAdded') {
      //  const notification = payload.getLinkedRecord('notification');
      //  const removedInvitation = payload.getLinkedRecord('removedInvitation');
      //  const removedInvitationId = getInProxy(removedInvitation, 'id');
      //  const removedInvitationTeamId = getInProxy(removedInvitation, 'teamId');
      //  handleAddTeamMembers(teamMember, store);
      //  handleAddNotifications(notification, {dispatch, environment, store});
      //  handleRemoveInvitations(removedInvitationId, store, removedInvitationTeamId);
      // } else if (type === 'TeamMemberUpdated') {
      //  handleUpdateTeamMembers(teamMember, store);
      // }
    }
  };
};

export default TeamMemberSubscription;

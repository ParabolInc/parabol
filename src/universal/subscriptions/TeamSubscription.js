import {acceptTeamInviteTeamUpdater} from 'universal/mutations/AcceptTeamInviteMutation';
import {addTeamTeamUpdater} from 'universal/mutations/AddTeamMutation';
import {archiveTeamTeamUpdater} from 'universal/mutations/ArchiveTeamMutation';
import {endMeetingTeamUpdater} from 'universal/mutations/EndMeetingMutation';
import {inviteTeamMembersTeamUpdater} from 'universal/mutations/InviteTeamMembersMutation';
import {removeTeamMemberTeamUpdater} from 'universal/mutations/RemoveTeamMemberMutation';

// ... on TeamAdded {
//  notification {
//    id
//    team {
//      id
//      name
//    }
//  }
//  removedTeamInviteNotification {
//    id
//  }
//  team {
//  ...CompleteTeamFragWithMembers @relay(mask: false)
//  }
// }
// ... on TeamUpdated {
//  team {
//  ...CompleteTeamFrag @relay(mask: false)
//  }
// }
// ... on TeamRemoved {
//  team {
//    id
//  }
//  notification {
//    id
//    orgId
//    startAt
//    type
//  ... on NotifyTeamArchived {
//      team {
//        name
//      }
//    }
//  ... on NotifyKickedOut {
//      isKickout
//      team {
//        id
//        name
//      }
//    }
//  }
// }
const subscription = graphql`
  subscription TeamSubscription {
    teamSubscription {
      __typename
      ...AcceptTeamInviteEmailMutation_team
      ...AcceptTeamInviteMutation_team
      ...RemoveTeamMemberMutation_team
      ...AddTeamMutation_team
      ...ArchiveTeamMutation_team,
      ...EndMeetingMutation_team
      ...InviteTeamMembersMutation_team
    }
  }
`;

const TeamSubscription = (environment, queryVariables, subParams) => {
  const {dispatch, history, location} = subParams;
  const {viewerId} = environment;
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('teamSubscription');
      const type = payload.getValue('__typename');
      switch (type) {
        case 'AcceptTeamInvitePayload':
        case 'AcceptTeamInviteEmailPayload':
          acceptTeamInviteTeamUpdater(payload, store, viewerId);
          break;
        case 'RemoveTeamMemberSelfPayload':
          removeTeamMemberTeamUpdater(payload, store, viewerId, {dispatch, history, location});
          break;
        case 'AddTeamMutationPayload':
          addTeamTeamUpdater(payload, store, viewerId);
          break;
        case 'ArchiveTeamMutationPayload':
          archiveTeamTeamUpdater(payload, store, environment, dispatch);
          break;
        case 'EndMeetingPayload':
          endMeetingTeamUpdater(payload, store);
          break;
        case 'InviteTeamMembersPayload':
          inviteTeamMembersTeamUpdater(payload, store, viewerId);
          break;

        default:
          console.error('TeamSubscription case fail', type);
      }

      // const team = payload.getLinkedRecord('team');
      // const notification = payload.getLinkedRecord('notification');
      // if (type === 'TeamAdded') {
      //  const removedNotification = payload.getLinkedRecord('removedTeamInviteNotification');
      //  const removedNotificationId = removedNotification && removedNotification.getValue('id');
      //  handleAddTeams(team, store, viewerId);
      //  handleRemoveNotifications(removedNotificationId, store, viewerId);
      // } else if (type === 'TeamRemoved') {
      //  const teamId = team.getValue('id');
      //  handleRemoveTeam(store, viewerId, teamId);
      // }
      // handleAddNotifications(notification, {dispatch, environment, store});
    }
  };
};

export default TeamSubscription;

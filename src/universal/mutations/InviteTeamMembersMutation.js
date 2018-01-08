import {commitMutation} from 'react-relay';
import {showInfo, showSuccess} from 'universal/modules/toast/ducks/toastDuck';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import handleAddInvitations from 'universal/mutations/handlers/handleAddInvitations';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleAddOrgApprovals from 'universal/mutations/handlers/handleAddOrgApprovals';
import handleAddTeamMembers from 'universal/mutations/handlers/handleAddTeamMembers';
import handleAddTeams from 'universal/mutations/handlers/handleAddTeams';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleRemoveOrgApprovals from 'universal/mutations/handlers/handleRemoveOrgApprovals';
import popTeamInviteNotificationToast from 'universal/mutations/toasts/popTeamInviteNotificationToast';
import getInProxy from 'universal/utils/relay/getInProxy';

graphql`
  fragment InviteTeamMembersMutation_invitation on InviteTeamMembersPayload {
    invitationsSent {
      ...CompleteInvitationFrag @relay(mask: false)
    }
  }
`;

graphql`
  fragment InviteTeamMembersMutation_notification on InviteTeamMembersPayload {
    reactivationNotification {
      type
      ...AddedToTeam_notification @relay(mask: false)
    }
    teamInviteNotification {
      type
      ...TeamInvite_notification @relay(mask: false)
    }
    removedRequestNotification {
      id
    }
    requestNotification {
      type
      ...RequestNewUser_notification @relay(mask: false)
    }
    team {
      ...CompleteTeamFragWithMembers @relay(mask: false)
    }
  }
`;

graphql`
  fragment InviteTeamMembersMutation_orgApproval on InviteTeamMembersPayload {
    orgApprovalsSent {
      ...CompleteOrgApprovalFrag @relay(mask: false)
    }
    orgApprovalsRemoved {
      id
      teamId
    }
  }
`;

graphql`
  fragment InviteTeamMembersMutation_teamMember on InviteTeamMembersPayload {
    reactivatedTeamMembers {
      ...CompleteTeamMemberFrag @relay(mask: false)
    }
    team {
      name
    }
  }
`;


const mutation = graphql`
  mutation InviteTeamMembersMutation($teamId: ID!, $invitees: [Invitee!]!) {
    inviteTeamMembers(invitees: $invitees, teamId: $teamId) {
      ...InviteTeamMembersMutation_invitation @relay(mask: false)
      ...InviteTeamMembersMutation_notification @relay(mask:false)
      ...InviteTeamMembersMutation_orgApproval @relay(mask: false)
      ...InviteTeamMembersMutation_teamMember @relay(mask: false)
    }
  }
`;

const popInvitationToast = (payload, dispatch) => {
  const invitationsSent = payload.getLinkedRecords('invitationsSent');
  const emails = getInProxy(invitationsSent, 'email');
  if (!emails) return;
  const emailStr = emails.join(', ');
  dispatch(showSuccess({
    title: 'Invitation sent!',
    message: `An invitation has been sent to ${emailStr}`
  }));
};

const popReactivationToast = (reactivatedTeamMembers, dispatch) => {
  const names = getInProxy(reactivatedTeamMembers, 'preferredName');
  if (!names) return;
  const isSingular = names.length === 1;
  const nameStr = names.join(', ');
  const message = isSingular ?
    `${nameStr} used to be on this team, so they were automatically approved` :
    `The following team members have been reinstated: ${nameStr}`;
  dispatch(showSuccess({
    title: 'Back in it!',
    message
  }));
};

const popReactivatedNotificationToast = (reactivationNotification, {dispatch, environment}) => {
  const teamName = getInProxy(reactivationNotification, 'team', 'name');
  if (!teamName) return;
  const notificationId = getInProxy(reactivationNotification, 'id');
  dispatch(showInfo({
    autoDismiss: 10,
    title: 'Congratulations!',
    message: `You’ve been added to team ${teamName}`,
    action: {
      label: 'Great!',
      callback: () => {
        ClearNotificationMutation(environment, notificationId);
      }
    }
  }));
};

const popOrgApprovalToast = (payload, dispatch) => {
  const orgApprovalsSent = payload.getLinkedRecords('orgApprovalsSent');
  const emails = getInProxy(orgApprovalsSent, 'email');
  if (!emails) return;
  const [firstEmail] = emails;
  const emailStr = emails.join(', ');
  dispatch(showSuccess({
    title: 'Request sent to admin',
    message: emails.length === 1 ?
      `A request to add ${firstEmail} has been sent to your organization admin` :
      `The following invitations are awaiting approval from your organization admin: ${emailStr}`
  }));
};

const popTeamMemberReactivatedToast = (payload, dispatch) => {
  // pop 1 toast per reactivation. simple for now
  const teamName = getInProxy(payload, 'team', 'name');
  const reactivatedTeamMembers = payload.getLinkedRecords('reactivatedTeamMembers');
  const names = getInProxy(reactivatedTeamMembers, 'preferredName');
  names.forEach((name) => {
    dispatch(showInfo({
      autoDismiss: 10,
      title: 'They’re back!',
      message: `${name} has rejoined ${teamName}`
    }));
  });
};

const popRequestNewUserNotificationToast = (requestNotification, {dispatch, history}) => {
  const inviterName = getInProxy(requestNotification, 'inviter', 'preferredName');
  if (!inviterName) return;
  dispatch(showInfo({
    autoDismiss: 10,
    title: 'Approval Requested!',
    message: `${inviterName} would like to invite someone to their team`,
    action: {
      label: 'Check it out',
      callback: () => {
        history.push('/me/notifications');
      }
    }
  }));
};

export const inviteTeamMembersInvitationUpdater = (payload, store) => {
  const invitationsSent = payload.getLinkedRecords('invitationsSent');
  handleAddInvitations(invitationsSent, store);
};

export const inviteTeamMembersNotificationUpdater = (payload, store, viewerId, options) => {
  const reactivationNotification = payload.getLinkedRecord('reactivationNotification');
  handleAddNotifications(reactivationNotification, store, viewerId);
  popReactivatedNotificationToast(reactivationNotification, options);

  const teamInviteNotification = payload.getLinkedRecord('teamInviteNotification');
  handleAddNotifications(teamInviteNotification, store, viewerId);
  popTeamInviteNotificationToast(teamInviteNotification, options);

  const removedRequestNotificationId = getInProxy(payload, 'removedRequestNotification', 'id');
  handleRemoveNotifications(removedRequestNotificationId, store, viewerId);

  const requestNotification = payload.getLinkedRecord('requestNotification');
  handleAddNotifications(requestNotification, store, viewerId);
  popRequestNewUserNotificationToast(requestNotification, options);

  const team = payload.getLinkedRecord('team');
  handleAddTeams(team, store, viewerId);
};

export const inviteTeamMembesrOrgApprovalUpdater = (payload, store) => {
  const orgApprovalsRemoved = payload.getLinkedRecords('orgApprovalsRemoved');
  handleRemoveOrgApprovals(orgApprovalsRemoved, store);

  const orgApprovalsSent = payload.getLinkedRecords('orgApprovalsSent');
  handleAddOrgApprovals(orgApprovalsSent, store);
};

export const inviteTeamMembersTeamUpdater = (payload, store, viewerId) => {
  const team = payload.getLinkedRecord('team');
  handleAddTeams(team, store, viewerId);
};

export const inviteTeamMembersTeamMemberUpdater = (payload, store, dispatch, isMutator) => {
  const reactivatedTeamMembers = payload.getLinkedRecords('reactivatedTeamMembers');
  handleAddTeamMembers(reactivatedTeamMembers, store);
  if (isMutator) {
    popReactivationToast(reactivatedTeamMembers, dispatch);
  } else {
    popTeamMemberReactivatedToast(payload, dispatch);
  }
};

const InviteTeamMembersMutation = (environment, invitees, teamId, dispatch, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {invitees, teamId},
    updater: (store) => {
      const payload = store.getRootField('inviteTeamMembers');
      inviteTeamMembersInvitationUpdater(payload, store);
      popInvitationToast(payload, dispatch);
      inviteTeamMembesrOrgApprovalUpdater(payload, store);
      popOrgApprovalToast(payload, dispatch);
      inviteTeamMembersTeamMemberUpdater(payload, store, dispatch, true);
    },
    onCompleted,
    onError
  });
};

export default InviteTeamMembersMutation;

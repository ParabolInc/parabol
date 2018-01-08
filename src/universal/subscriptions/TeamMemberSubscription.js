import {acceptTeamInviteTeamMemberUpdater} from 'universal/mutations/AcceptTeamInviteMutation';
import {inviteTeamMembersTeamMemberUpdater} from 'universal/mutations/InviteTeamMembersMutation';
import {removeTeamMemberTeamMemberUpdater} from 'universal/mutations/RemoveTeamMemberMutation';

const subscription = graphql`
  subscription TeamMemberSubscription {
    teamMemberSubscription {
      __typename
      ...AcceptTeamInviteMutation_teamMember
      ...AcceptTeamInviteEmailMutation_teamMember
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
        case 'MeetingCheckInPayload':
          break;
        default:
          console.error('TeamMemberSubscription case fail', type);
      }
    }
  };
};

export default TeamMemberSubscription;

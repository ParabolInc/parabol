import {acceptTeamInviteTeamUpdater} from 'universal/mutations/AcceptTeamInviteMutation';
import {addTeamTeamUpdater} from 'universal/mutations/AddTeamMutation';
import {archiveTeamTeamUpdater} from 'universal/mutations/ArchiveTeamMutation';
import {endMeetingTeamUpdater} from 'universal/mutations/EndMeetingMutation';
import {inviteTeamMembersTeamUpdater} from 'universal/mutations/InviteTeamMembersMutation';
import {killMeetingTeamUpdater} from 'universal/mutations/KillMeetingMutation';
import {promoteFacilitatorTeamUpdater} from 'universal/mutations/PromoteFacilitatorMutation';
import {removeTeamMemberTeamUpdater} from 'universal/mutations/RemoveTeamMemberMutation';
import {requestFacilitatorTeamUpdater} from 'universal/mutations/RequestFacilitatorMutation';

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
      ...InviteTeamMembersMutationInvitee_team
      ...KillMeetingMutation_team
      ...MoveMeetingMutation_team
      ...PromoteFacilitatorMutation_team
      ...RequestFacilitatorMutation_team
      ...StartMeetingMutation_team
      ...UpdateCheckInQuestionMutation_team
      ...UpdateTeamNameMutation_team
      ...UpgradeToProMutation_organization
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
        case 'InviteTeamMembersInviteePayload':
          inviteTeamMembersTeamUpdater(payload, store, viewerId);
          break;
        case 'KillMeetingPayload':
          killMeetingTeamUpdater();
          break;
        case 'PromoteFacilitatorPayload':
          promoteFacilitatorTeamUpdater(payload, viewerId, dispatch);
          break;
        case 'RequestFacilitatorPayload':
          requestFacilitatorTeamUpdater(payload, {dispatch, environment});
          break;
        default:
          console.error('TeamSubscription case fail', type);
      }
    }
  };
};

export default TeamSubscription;

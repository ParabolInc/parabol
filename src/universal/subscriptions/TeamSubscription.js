import {acceptTeamInviteTeamUpdater} from 'universal/mutations/AcceptTeamInviteMutation';
import {addOrgMutationNotificationUpdater} from 'universal/mutations/AddOrgMutation';
import {addTeamMutationNotificationUpdater, addTeamTeamUpdater} from 'universal/mutations/AddTeamMutation';
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
      ...AddTeamMutation_team
      ...RemoveTeamMemberMutation_team
      ...AddTeamMutation_team
      ...ArchiveTeamMutation_team,
      ...EndMeetingMutation_team
      ...InviteTeamMembersMutation_team
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
      const options = {store, environment, dispatch, history, location};
      switch (type) {
        case 'AcceptTeamInvitePayload':
        case 'AcceptTeamInviteEmailPayload':
          acceptTeamInviteTeamUpdater(payload, store, viewerId);
          break;
        case 'AddOrgCreatorPayload':
          addOrgMutationNotificationUpdater(payload, store, viewerId, options);
          break;
        case 'AddTeamCreatorPayload':
          addTeamMutationNotificationUpdater(payload, store, viewerId, options);
          break;
        case 'RemoveTeamMemberSelfPayload':
          removeTeamMemberTeamUpdater(payload, store, viewerId, options);
          break;
        case 'AddTeamMutationPayload':
          addTeamTeamUpdater(payload, store, viewerId);
          break;
        case 'ArchiveTeamPayload':
          archiveTeamTeamUpdater(payload, store, viewerId, options);
          break;
        case 'EndMeetingPayload':
          endMeetingTeamUpdater(payload, store);
          break;
        case 'InviteTeamMembersPayload':
          inviteTeamMembersTeamUpdater(payload, store, viewerId);
          break;
        case 'KillMeetingPayload':
          killMeetingTeamUpdater();
          break;
        case 'PromoteFacilitatorPayload':
          promoteFacilitatorTeamUpdater(payload, viewerId, dispatch);
          break;
        case 'RequestFacilitatorPayload':
          requestFacilitatorTeamUpdater(payload, options);
          break;
        default:
          console.error('TeamSubscription case fail', type);
      }
    }
  };
};

export default TeamSubscription;

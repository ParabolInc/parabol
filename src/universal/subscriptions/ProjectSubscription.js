import {createProjectProjectUpdater} from 'universal/mutations/CreateProjectMutation';
import {deleteProjectProjectUpdater} from 'universal/mutations/DeleteProjectMutation';
import {editProjectProjectUpdater} from 'universal/mutations/EditProjectMutation';
import {removeTeamMemberProjectsUpdater} from 'universal/mutations/RemoveTeamMemberMutation';
import {updateProjectProjectUpdater} from 'universal/mutations/UpdateProjectMutation';
import {endMeetingProjectUpdater} from 'universal/mutations/EndMeetingMutation';
import {removeOrgUserProjectUpdater} from 'universal/mutations/RemoveOrgUserMutation';
import {cancelApprovalProjectUpdater} from 'universal/mutations/CancelApprovalMutation';
import {rejectOrgApprovalProjectUpdater} from 'universal/mutations/RejectOrgApprovalMutation';
import {cancelTeamInviteProjectUpdater} from 'universal/mutations/CancelTeamInviteMutation';

const subscription = graphql`
  subscription ProjectSubscription {
    projectSubscription {
      __typename
      ...RemoveTeamMemberMutation_project
      ...CancelApprovalMutation_project
      ...CancelTeamInviteMutation_project
      ...CreateGitHubIssueMutation_project,
      ...CreateProjectMutation_project,
      ...DeleteProjectMutation_project,
      ...EditProjectMutation_project
      ...EndMeetingMutation_project
      ...RejectOrgApprovalMutation_project
      ...RemoveOrgUserMutation_project
      ...UpdateProjectMutation_project
    }
  }
`;

const ProjectSubscription = (environment, queryVariables, {dispatch, history, location}) => {
  const {viewerId} = environment;
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('projectSubscription');
      const type = payload.getValue('__typename');
      switch (type) {
        case 'RemoveTeamMemberOtherPayload':
          removeTeamMemberProjectsUpdater(payload, store, viewerId);
          break;
        case 'CancelApprovalPayload':
          cancelApprovalProjectUpdater(payload, store, viewerId);
          break;
        case 'CancelTeamInvitePayload':
          cancelTeamInviteProjectUpdater(payload, store, viewerId);
          break;
        case 'CreateProjectPayload':
          createProjectProjectUpdater(payload, store, viewerId, false);
          break;
        case 'DeleteProjectPayload':
          deleteProjectProjectUpdater(payload, store, viewerId);
          break;
        case 'EditProjectPayload':
          editProjectProjectUpdater(payload, store);
          break;
        case 'EndMeetingPayload':
          endMeetingProjectUpdater(payload, store, viewerId);
          break;
        case 'RejectOrgApprovalPayload':
          rejectOrgApprovalProjectUpdater(payload, store, viewerId);
          break;
        case 'RemoveOrgUserPayload':
          removeOrgUserProjectUpdater(payload, store, viewerId);
          break;
        case 'UpdateProjectPayload':
          updateProjectProjectUpdater(payload, store, viewerId, {dispatch, history, location});
          break;
        default:
          console.error('TeamSubscription case fail', type);
      }
    }
  };
};

export default ProjectSubscription;

// ... on ProjectAdded {
//  project {
//  ...CompleteProjectFrag @relay(mask: false)
//  }
// }
// ... on ProjectUpdated {
//  project {
//  ...CompleteProjectFrag @relay(mask: false)
//  }
// }
// ... on ProjectRemoved {
//  project {
//    id
//  }
// }
// ... on ProjectEdited {

// }

import {createProjectProjectUpdater} from 'universal/mutations/CreateProjectMutation';
import {deleteProjectProjectUpdater} from 'universal/mutations/DeleteProjectMutation';
import {editProjectProjectUpdater} from 'universal/mutations/EditProjectMutation';
import {removeTeamMemberProjectsUpdater} from 'universal/mutations/RemoveTeamMemberMutation';
import {updateProjectProjectUpdater} from 'universal/mutations/UpdateProjectMutation';

const subscription = graphql`
  subscription ProjectSubscription {
    projectSubscription {
      __typename
      ...RemoveTeamMemberMutation_project
      ...CreateGitHubIssueMutation_project,
      ...CreateProjectMutation_project,
      ...DeleteProjectMutation_project,
      ...EditProjectMutation_project
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
        case 'CreateProjectPayload':
          createProjectProjectUpdater(payload, store, viewerId, false);
          break;
        case 'DeleteProjectPayload':
          deleteProjectProjectUpdater(payload, store, viewerId);
          break;
        case 'EditProjectPayload':
          editProjectProjectUpdater(payload, store);
          break;
        case 'UpdateProjectPayload':
          updateProjectProjectUpdater(payload, store, viewerId, {dispatch, history, location});
          break;
        default:
          console.error('TeamSubscription case fail', type);
      }
    }

    // const project = payload.getLinkedRecord('project');
    // const type = payload.getValue('__typename');
    // if (type === 'ProjectAdded') {
    //  handleUpsertProjects(project, store, viewerId);
    // } else if (type === 'ProjectUpdated') {
    //  handleUpsertProjects(project, store, viewerId);
    // } else if (type === 'ProjectRemoved') {
    //  const projectId = getInProxy(project, 'id');
    //  handleRemoveProjects(projectId, store, viewerId);
    // } else if (type === 'ProjectEdited') {
    //  handleEditProject(payload, store);
    // }
  };
};

export default ProjectSubscription;

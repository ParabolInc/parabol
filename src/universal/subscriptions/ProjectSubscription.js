import handleEditProject from 'universal/mutations/handlers/handleEditProject';
import handleRemoveProjects from 'universal/mutations/handlers/handleRemoveProjects';
import handleUpsertProjects from 'universal/mutations/handlers/handleUpsertProjects';
import getInProxy from 'universal/utils/relay/getInProxy';

const subscription = graphql`
  subscription ProjectSubscription {
    projectSubscription {
      __typename
      ... on ProjectAdded {
        project {
          ...CompleteProjectFrag @relay(mask: false)
        }
      }
      ... on ProjectUpdated {
        project {
          ...CompleteProjectFrag @relay(mask: false)
        }
      }
      ... on ProjectRemoved {
        project {
          id
        }
      }
      ... on ProjectEdited {
        project {
          id
        }
        editor {
          id
          preferredName
        }
        isEditing
      }
    }
  }
`;

const ProjectSubscription = (environment) => {
  const {viewerId} = environment;
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('projectSubscription');
      const project = payload.getLinkedRecord('project');
      const type = payload.getValue('__typename');
      if (type === 'ProjectAdded') {
        handleUpsertProjects(project, store, viewerId);
      } else if (type === 'ProjectUpdated') {
        handleUpsertProjects(project, store, viewerId);
      } else if (type === 'ProjectRemoved') {
        const projectId = getInProxy(project, 'id');
        handleRemoveProjects(projectId, store, viewerId);
      } else if (type === 'ProjectEdited') {
        handleEditProject(payload, store);
      }
    }
  };
};

export default ProjectSubscription;

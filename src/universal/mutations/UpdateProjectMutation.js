import {commitMutation} from 'react-relay';
import handleUpsertProjects from 'universal/mutations/handlers/handleUpsertProjects';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';
import updateProxyRecord from 'universal/utils/relay/updateProxyRecord';

const mutation = graphql`
  mutation UpdateProjectMutation($updatedProject: UpdateProjectInput!) {
    updateProject(updatedProject: $updatedProject) {
      project {
        ...CompleteProjectFrag @relay(mask: false)
      }
    }
  }
`;

const UpdateProjectMutation = (environment, updatedProject, area, onCompleted, onError) => {
  const {viewerId} = environment;
  // use this as a temporary fix until we get rid of cashay because otherwise relay will roll back the change
  // which means we'll have 2 items, then 1, then 2, then 1. i prefer 2, then 1.
  return commitMutation(environment, {
    mutation,
    variables: {
      area,
      updatedProject
    },
    updater: (store) => {
      const project = store.getRootField('updateProject').getLinkedRecord('project');
      handleUpsertProjects(project, store, viewerId);
    },
    optimisticUpdater: (store) => {
      const {id, content, userId} = updatedProject;
      const project = store.get(id);
      if (!project) return;
      const now = new Date();
      const optimisticProject = {
        ...updatedProject,
        updatedAt: now.toJSON()
      };
      updateProxyRecord(project, optimisticProject);
      if (userId) {
        const teamMemberId = toTeamMemberId(project.getValue('teamId'), userId);
        project.setValue(teamMemberId, 'teamMemberId');
        const teamMember = store.get(teamMemberId);
        if (teamMember) {
          project.setLinkedRecord(teamMember, 'teamMember');
        }
      }
      if (content) {
        const {entityMap} = JSON.parse(content);
        const nextTags = getTagsFromEntityMap(entityMap);
        project.setValue(nextTags, 'tags');
      }
      handleUpsertProjects(project, store, viewerId);
    },
    onCompleted,
    onError
  });
};

export default UpdateProjectMutation;

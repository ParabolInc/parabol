import {commitMutation} from 'react-relay';
import {ConnectionHandler} from 'relay-runtime';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import toGlobalId from 'universal/utils/relay/toGlobalId';

const mutation = graphql`
  mutation UpdateProjectMutation($updatedProject: ProjectInput!) {
    updateProject(updatedProject: $updatedProject) {
      project {
        id
        tags
      }
    }
  }
`;

export const removeFromArchive = (viewer, projectId, teamId) => {
  const conn = ConnectionHandler.getConnection(
    viewer,
    'TeamArchive_archivedProjects',
    {teamId}
  );
  if (!conn) return;
  ConnectionHandler.deleteNode(conn, projectId);
};

const UpdateProjectMutation = (environment, updatedProject, onCompleted, onError) => {
  const {viewerId} = environment;
  const [teamId] = updatedProject.id.split('::');
  return commitMutation(environment, {
    mutation,
    variables: {updatedProject},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const project = store.getRootField('updateProject').getLinkedRecord('project');
      const projectId = project.getDataID();
      const tags = project.getValue('tags');
      if (!tags.includes('archived')) {
        removeFromArchive(viewer, projectId, teamId);
      }
    },
    optimisticUpdater: (store) => {
      const {id, content} = updatedProject;
      if (!content) return;
      // FIXME when we remove cashay, this should be a globalId
      const globalId = toGlobalId('Project', id);
      const project = store.get(globalId);
      if (!project) return;
      const tags = project.getValue('tags');
      if (!tags.includes('archived')) return;
      const {entityMap} = JSON.parse(content);
      const nextTags = getTagsFromEntityMap(entityMap);
      if (!nextTags.includes('archived')) {
        const viewer = store.get(viewerId);
        removeFromArchive(viewer, globalId, teamId);
      }
    },
    onCompleted,
    onError
  });
};

export default UpdateProjectMutation;

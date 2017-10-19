import {commitMutation} from 'react-relay';
import {ConnectionHandler} from 'relay-runtime';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import filterNodesInConn from 'universal/utils/relay/filterNodesInConn';
import {insertEdgeAfter} from 'universal/utils/relay/insertEdge';
import toGlobalId from 'universal/utils/relay/toGlobalId';

// const mutation = graphql`
//  mutation UpdateProjectMutation($updatedProject: ProjectInput!) {
//    updateProject(updatedProject: $updatedProject) {
//      project {
//        id
//        tags
//      }
//    }
//  }
// `;
const mutation = graphql`
  mutation UpdateProjectMutation($updatedProject: ProjectInput!) {
    updateProject(updatedProject: $updatedProject)
  }
`;

const getArchiveConnection = (viewer, teamId) => ConnectionHandler.getConnection(
  viewer,
  'TeamArchive_archivedProjects',
  {teamId}
);

export const adjustArchive = (store, viewerId, project, teamId) => {
  const viewer = store.get(viewerId);
  const projectId = project.getValue('id');
  const tags = project.getValue('tags');
  const conn = getArchiveConnection(viewer, teamId);
  if (conn) {
    const matchingNode = filterNodesInConn(conn, (node) => node.getValue('id') === projectId)[0];
    const isNowArchived = tags.includes('archived');
    if (matchingNode && !isNowArchived) {
      ConnectionHandler.deleteNode(conn, projectId);
    } else if (!matchingNode && isNowArchived) {
      const newEdge = ConnectionHandler.createEdge(
        store,
        conn,
        project,
        'RelayProjectEdge'
      );
      newEdge.setValue(project.getValue('updatedAt'), 'cursor');
      insertEdgeAfter(conn, newEdge, 'updatedAt');
    }
  }
};

const UpdateProjectMutation = (environment, updatedProject, onCompleted, onError) => {
  const {viewerId} = environment;
  const [teamId] = updatedProject.id.split('::');
  // use this as a temporary fix until we get rid of cashay because otherwise relay will roll back the change
  // which means we'll have 2 items, then 1, then 2, then 1. i prefer 2, then 1.
  const optimisticUpdater = (store) => {
    const {id, content} = updatedProject;
    if (!content) return;
    // FIXME when we remove cashay, this should be a globalId
    const globalId = toGlobalId('Project', id);
    const project = store.get(globalId);
    if (!project) return;
    const tags = project.getValue('tags');
    const {entityMap} = JSON.parse(content);
    const nextTags = getTagsFromEntityMap(entityMap);
    const wasArchived = tags.includes('archived');
    const willArchive = nextTags.includes('archived');
    const viewer = store.get(viewerId);
    const conn = getArchiveConnection(viewer, teamId);
    if (conn) {
      if (!wasArchived && willArchive) {
        // add
        const newEdge = ConnectionHandler.createEdge(
          store,
          conn,
          project,
          'RelayProjectEdge'
        );
        newEdge.setValue(project.getValue('updatedAt'), 'cursor');
        insertEdgeAfter(conn, newEdge, 'updatedAt');
      } else if (wasArchived && !willArchive) {
        // delete
        ConnectionHandler.deleteNode(conn, globalId);
      }
    }
  };
  return commitMutation(environment, {
    mutation,
    variables: {updatedProject},
    updater: optimisticUpdater,
    optimisticUpdater,
    onCompleted,
    onError
  });
};

export default UpdateProjectMutation;

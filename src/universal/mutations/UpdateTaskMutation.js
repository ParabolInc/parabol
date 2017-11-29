import {commitMutation} from 'react-relay';
import {ConnectionHandler} from 'relay-runtime';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import filterNodesInConn from 'universal/utils/relay/filterNodesInConn';
import {insertEdgeAfter} from 'universal/utils/relay/insertEdge';
import toGlobalId from 'universal/utils/relay/toGlobalId';

// const mutation = graphql`
//  mutation UpdateTaskMutation($updatedTask: TaskInput!) {
//    updateTask(updatedTask: $updatedTask) {
//      task {
//        id
//        tags
//      }
//    }
//  }
// `;
const mutation = graphql`
  mutation UpdateTaskMutation($updatedTask: TaskInput!) {
    updateTask(updatedTask: $updatedTask)
  }
`;

const getArchiveConnection = (viewer, teamId) => ConnectionHandler.getConnection(
  viewer,
  'TeamArchive_archivedTasks',
  {teamId}
);

export const adjustArchive = (store, viewerId, task, teamId) => {
  const viewer = store.get(viewerId);
  const taskId = task.getValue('id');
  const tags = task.getValue('tags');
  const conn = getArchiveConnection(viewer, teamId);
  if (conn) {
    const matchingNode = filterNodesInConn(conn, (node) => node.getValue('id') === taskId)[0];
    const isNowArchived = tags.includes('archived');
    if (matchingNode && !isNowArchived) {
      ConnectionHandler.deleteNode(conn, taskId);
    } else if (!matchingNode && isNowArchived) {
      const newEdge = ConnectionHandler.createEdge(
        store,
        conn,
        task,
        'RelayTaskEdge'
      );
      newEdge.setValue(task.getValue('updatedAt'), 'cursor');
      insertEdgeAfter(conn, newEdge, 'updatedAt');
    }
  }
};

const UpdateTaskMutation = (environment, updatedTask, onCompleted, onError) => {
  const {viewerId} = environment;
  const [teamId] = updatedTask.id.split('::');
  // use this as a temporary fix until we get rid of cashay because otherwise relay will roll back the change
  // which means we'll have 2 items, then 1, then 2, then 1. i prefer 2, then 1.
  const optimisticUpdater = (store) => {
    const {id, content} = updatedTask;
    if (!content) return;
    // FIXME when we remove cashay, this should be a globalId
    const globalId = toGlobalId('Task', id);
    const task = store.get(globalId);
    if (!task) return;
    const tags = task.getValue('tags');
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
          task,
          'RelayTaskEdge'
        );
        newEdge.setValue(task.getValue('updatedAt'), 'cursor');
        insertEdgeAfter(conn, newEdge, 'updatedAt');
      } else if (wasArchived && !willArchive) {
        // delete
        ConnectionHandler.deleteNode(conn, globalId);
      }
    }
  };
  return commitMutation(environment, {
    mutation,
    variables: {updatedTask},
    updater: optimisticUpdater,
    optimisticUpdater,
    onCompleted,
    onError
  });
};

export default UpdateTaskMutation;

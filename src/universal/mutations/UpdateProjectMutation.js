import {commitMutation} from 'react-relay';
import {ConnectionHandler} from 'relay-runtime';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import getNodeById from 'universal/utils/relay/getNodeById';
import {insertEdgeAfter} from 'universal/utils/relay/insertEdge';
import safeRemoveNodeFromConn from 'universal/utils/relay/safeRemoveNodeFromConn';
import toGlobalId from 'universal/utils/relay/toGlobalId';

const mutation = graphql`
  mutation UpdateProjectMutation($updatedProject: ProjectInput!) {
    updateProject(updatedProject: $updatedProject) {
      project {
        id
        content
        createdAt
        createdBy
        integration {
          service
          nameWithOwner
          issueNumber
        }
        sortOrder
        status
        tags
        teamMemberId
        updatedAt
        userId
        team {
          id
          name
        }
        teamMember {
          id
          picture
          preferredName
        }
      }
    }
  }
`;

const getUserDashConnection = (viewer) => ConnectionHandler.getConnection(
  viewer,
  'UserColumnsContainer_projects'
);

const getTeamDashConnection = (viewer, teamId) => ConnectionHandler.getConnection(
  viewer,
  'TeamColumnsContainer_projects',
  {teamId}
);

const getArchiveConnection = (viewer, teamId) => ConnectionHandler.getConnection(
  viewer,
  'TeamArchive_archivedProjects',
  {teamId}
);

export const handleProjectConnections = (store, viewerId, project, teamId) => {
  // we currently have 3 connections, user, team, and team archive
  const viewer = store.get(viewerId);
  const projectId = project.getValue('id');
  const tags = project.getValue('tags');
  const isNowArchived = tags.includes('archived');
  const ownerUserId = project.getValue('userId');
  const ownerViewerId = toGlobalId('User', ownerUserId);
  const ownedByViewer = ownerViewerId === viewerId;
  const archiveConn = getArchiveConnection(viewer, teamId);
  const teamConn = getTeamDashConnection(viewer, teamId);
  const userConn = getUserDashConnection(viewer);
  const safePutNodeInConn = (conn) => {
    if (conn && !getNodeById(projectId, conn)) {
      const newEdge = ConnectionHandler.createEdge(
        store,
        conn,
        project,
        'RelayProjectEdge'
      );
      newEdge.setValue(project.getValue('updatedAt'), 'cursor');
      insertEdgeAfter(conn, newEdge, 'updatedAt');
    }
  };

  if (isNowArchived) {
    safeRemoveNodeFromConn(projectId, teamConn);
    safeRemoveNodeFromConn(projectId, userConn);
    safePutNodeInConn(archiveConn);
  } else {
    safeRemoveNodeFromConn(projectId, archiveConn);
    safePutNodeInConn(userConn);
    safePutNodeInConn(teamConn);
  }

  if (ownedByViewer) {
    safePutNodeInConn(userConn);
  } else {
    safeRemoveNodeFromConn(projectId, userConn);
  }
};

const UpdateProjectMutation = (environment, updatedProject, onCompleted, onError) => {
  const {viewerId} = environment;
  const [teamId] = updatedProject.id.split('::');
  // use this as a temporary fix until we get rid of cashay because otherwise relay will roll back the change
  // which means we'll have 2 items, then 1, then 2, then 1. i prefer 2, then 1.
  return commitMutation(environment, {
    mutation,
    variables: {updatedProject},
    updater: (store) => {
      const project = store.getRootField('updateProject').getLinkedRecord('project');
      handleProjectConnections(store, viewerId, project, teamId);
    },
    optimisticUpdater: (store) => {
      const {id, content, teamMemberId} = updatedProject;
      if (!content) return;
      const project = store.get(id);
      if (!project) return;
      const now = new Date();
      Object.keys(updatedProject).forEach((key) => {
        const val = updatedProject[key];
        project.setValue(val, key);
      });
      project.setValue(project.getValue('teamMemberId').split('::')[0], 'userId');
      if (teamMemberId) {
        const [newUserId] = teamMemberId.split('::');
        project.setValue(newUserId, 'userId');
      }
      project.setValue('updatedAt', now.toJSON());
      const {entityMap} = JSON.parse(content);
      const nextTags = getTagsFromEntityMap(entityMap);
      project.setValue(nextTags, 'tags');
      handleProjectConnections(store, viewerId, project, teamId);
    },
    onCompleted,
    onError
  });
};

export default UpdateProjectMutation;

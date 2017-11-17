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
        teamId
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

export const getUserDashConnection = (viewer) => ConnectionHandler.getConnection(
  viewer,
  'UserColumnsContainer_projects'
);

export const getTeamDashConnection = (viewer, teamId) => ConnectionHandler.getConnection(
  viewer,
  'TeamColumnsContainer_projects',
  {teamId}
);

export const getArchiveConnection = (viewer, teamId) => ConnectionHandler.getConnection(
  viewer,
  'TeamArchive_archivedProjects',
  {teamId}
);

// export const getMeetingUpdatesConnections = (store, teamId) => {
//  const team = store.get(teamId);
//  if (!team) return [];
//  const teamMembers = team.getLinkedRecords('teamMembers', {sortBy: 'checkInOrder'});
//  if (!teamMembers) return [];
//  return teamMembers.map((teamMember) => {
//    return ConnectionHandler.getConnection(
//      teamMember,
//      'MeetingUpdates_projects'
//    );
//  })
// };

export const handleProjectConnections = (store, viewerId, project) => {
  // we currently have 3 connections, user, team, and team archive
  const viewer = store.get(viewerId);
  const teamId = project.getValue('teamId');
  const projectId = project.getValue('id');
  const tags = project.getValue('tags');
  const isNowArchived = tags.includes('archived');
  const archiveConn = getArchiveConnection(viewer, teamId);
  const teamConn = getTeamDashConnection(viewer, teamId);
  const userConn = getUserDashConnection(viewer);
  const safePutNodeInConn = (conn) => {
    if (conn && !getNodeById(projectId, conn)) {
      const newEdge = ConnectionHandler.createEdge(
        store,
        conn,
        project,
        'ProjectEdge'
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

  if (userConn) {
    const ownerUserId = project.getValue('userId');
    const ownerViewerId = toGlobalId('User', ownerUserId);
    const ownedByViewer = ownerViewerId === viewerId;
    if (ownedByViewer) {
      safePutNodeInConn(userConn);
    } else {
      safeRemoveNodeFromConn(projectId, userConn);
    }
  }
};

const UpdateProjectMutation = (environment, updatedProject, area, onCompleted, onError) => {
  const {viewerId} = environment;
  // use this as a temporary fix until we get rid of cashay because otherwise relay will roll back the change
  // which means we'll have 2 items, then 1, then 2, then 1. i prefer 2, then 1.
  return commitMutation(environment, {
    mutation,
    variables: {area, updatedProject},
    updater: (store) => {
      const project = store.getRootField('updateProject').getLinkedRecord('project');
      handleProjectConnections(store, viewerId, project);
    },
    optimisticUpdater: (store) => {
      const {id, content, teamMemberId} = updatedProject;
      const project = store.get(id);
      if (!project) return;
      const now = new Date();
      Object.keys(updatedProject).forEach((key) => {
        const val = updatedProject[key];
        project.setValue(val, key);
      });
      if (teamMemberId) {
        const [newUserId] = teamMemberId.split('::');
        project.setValue(newUserId, 'userId');
      }
      project.setValue('updatedAt', now.toJSON());
      if (content) {
        const {entityMap} = JSON.parse(content);
        const nextTags = getTagsFromEntityMap(entityMap);
        project.setValue(nextTags, 'tags');
      }
      handleProjectConnections(store, viewerId, project);
    },
    onCompleted,
    onError
  });
};

export default UpdateProjectMutation;

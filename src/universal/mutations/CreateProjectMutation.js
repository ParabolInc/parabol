import {commitMutation} from 'react-relay';
import {handleProjectConnections} from 'universal/mutations/UpdateProjectMutation';
import makeEmptyStr from 'universal/utils/draftjs/makeEmptyStr';
import clientTempId from 'universal/utils/relay/clientTempId';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';
import getOptimisticProjectEditor from 'universal/utils/relay/getOptimisticProjectEditor';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

const mutation = graphql`
  mutation CreateProjectMutation($newProject: CreateProjectInput!, $area: AreaEnum) {
    createProject(newProject: $newProject, area: $area) {
      project {
        id
        agendaId
        content
        createdAt
        createdBy
        editors {
          preferredName
          userId
        }
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

const CreateProjectMutation = (environment, newProject, area, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {
      area,
      newProject
    },
    updater: (store) => {
      const projectEditor = getOptimisticProjectEditor(store, newProject.userId);
      const project = store.getRootField('createProject')
        .getLinkedRecord('project')
        .setLinkedRecords([projectEditor], 'editors');
      handleProjectConnections(store, viewerId, project);
    },
    optimisticUpdater: (store) => {
      const {teamId, userId} = newProject;
      const teamMemberId = toTeamMemberId(teamId, userId);
      const now = new Date().toJSON();
      const optimisticProject = {
        ...newProject,
        id: clientTempId(teamId),
        teamId,
        userId,
        createdAt: now,
        createdBy: userId,
        updatedAt: now,
        tags: [],
        teamMemberId,
        content: newProject.content || makeEmptyStr()
      };

      const editors = newProject.content ? [] : [getOptimisticProjectEditor(store, userId)];
      const project = createProxyRecord(store, 'Project', optimisticProject)
        .setLinkedRecord(store.get(teamMemberId), 'teamMember')
        .setLinkedRecord(store.get(teamId), 'team')
        .setLinkedRecords(editors, 'editors');

      handleProjectConnections(store, viewerId, project);
    },
    onError,
    onCompleted
  });
};

export default CreateProjectMutation;

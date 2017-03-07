import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import makeProjectsByStatus from 'universal/utils/makeProjectsByStatus';
import MeetingUpdates from 'universal/modules/meeting/components/MeetingUpdates/MeetingUpdates';
import LoadingView from 'universal/components/LoadingView/LoadingView';

const meetingUpdatesQuery = `
query {
  projects(teamMemberId: $teamMemberId) @live {
    content
    id
    status
    teamMemberId
    updatedAt
    sortOrder
  }
}
`;

const mutationHandlers = {
  updateProject(optimisticUpdates, queryResponse, currentResponse) {
    if (optimisticUpdates) {
      const {updatedProject} = optimisticUpdates;
      if (updatedProject && updatedProject.hasOwnProperty('sortOrder')) {
        const {id, sortOrder, status} = updatedProject;
        const {projects} = currentResponse;
        const fromProject = projects.find((project) => project.id === id);
        if (sortOrder !== undefined) {
          fromProject.sortOrder = sortOrder;
        }
        if (status) {
          fromProject.status = status;
        }
        // no need to sort since the resolveTeamProjects function will do that next
        return currentResponse;
      }
    }
    return undefined;
  }
};

const mapStateToProps = (state, props) => {
  const {members, localPhaseItem} = props;
  const currentTeamMember = members[localPhaseItem - 1];
  const teamMemberId = currentTeamMember && currentTeamMember.id;
  const memberProjects = cashay.query(meetingUpdatesQuery, {
    op: 'meetingUpdatesContainer',
    key: teamMemberId,
    mutationHandlers,
    variables: {teamMemberId},
  }).data.projects;
  const projects = makeProjectsByStatus(memberProjects);
  return {
    projects,
    queryKey: teamMemberId
  };
};

const MeetingUpdatesContainer = (props) => {
  if (!props.projects) {
    return <LoadingView />;
  }
  return <MeetingUpdates {...props}/>;
};

MeetingUpdatesContainer.propTypes = {
  gotoItem: PropTypes.func.isRequired,
  gotoNext: PropTypes.func.isRequired,
  localPhaseItem: PropTypes.number.isRequired,
  members: PropTypes.array.isRequired,
  projects: PropTypes.object.isRequired,
  queryKey: PropTypes.string,
  team: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(MeetingUpdatesContainer);

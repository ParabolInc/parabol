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
    userSort
    teamSort
  }
}
`;

const mapStateToProps = (state, props) => {
  const {members, localPhaseItem} = props;
  const currentTeamMember = members[localPhaseItem - 1];
  const teamMemberId = currentTeamMember && currentTeamMember.id;
  const memberProjects = cashay.query(meetingUpdatesQuery, {
    op: 'meetingUpdatesContainer',
    variables: {teamMemberId},
    key: teamMemberId,
  }).data.projects;
  const projects = makeProjectsByStatus(memberProjects, 'teamSort');
  return {
    projects
  };
};

const MeetingUpdatesContainer = (props) => {
  if (!props.projects) {
    return <LoadingView />;
  }
  return <MeetingUpdates {...props}/>;
};

MeetingUpdatesContainer.propTypes = {
  projects: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(MeetingUpdatesContainer);

import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import resolveProjectsByMember from 'universal/subscriptions/computed/resolveProjectsByMember';
import MeetingUpdates from 'universal/modules/meeting/components/MeetingUpdates/MeetingUpdates';
import LoadingView from 'universal/components/LoadingView/LoadingView';

const mapStateToProps = (state, props) => {
  const {members, localPhaseItem} = props;
  const currentTeamMember = members[localPhaseItem - 1];
  const teamMemberId = currentTeamMember && currentTeamMember.id;
  const projects = cashay.computed('currentMemberProjects', [teamMemberId], resolveProjectsByMember);
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

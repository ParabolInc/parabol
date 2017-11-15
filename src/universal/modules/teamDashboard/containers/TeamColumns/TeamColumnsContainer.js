import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {createFragmentContainer} from 'react-relay';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';
import {TEAM_DASH} from 'universal/utils/constants';

const mapStateToProps = (state, props) => {
  const {teamId} = props;
  const {teamMemberFilterId} = state.teamDashboard;
  const userId = state.auth.obj.sub;
  return {
    myTeamMemberId: `${userId}::${teamId}`,
    teamMemberFilterId
  };
};


const TeamColumnsContainer = (props) => {
  const {myTeamMemberId, teamMemberFilterId, viewer: {projects}} = props;
  return (
    <ProjectColumns
      myTeamMemberId={myTeamMemberId}
      projects={projects}
      teamMemberFilterId={teamMemberFilterId}
      area={TEAM_DASH}
    />
  );
};

TeamColumnsContainer.propTypes = {
  myTeamMemberId: PropTypes.string,
  teamId: PropTypes.string.isRequired,
  teamMemberFilterId: PropTypes.string,
  viewer: PropTypes.object.isRequired
};

export default createFragmentContainer(
  connect(mapStateToProps)(TeamColumnsContainer),
  graphql`
    fragment TeamColumnsContainer_viewer on User {
      projects(first: 1000, teamId: $teamId) @connection(key: "TeamColumnsContainer_projects") {
        edges {
          node {
            id
            status
            ...DraggableProject_project
          }
        }
      }
    }`
);

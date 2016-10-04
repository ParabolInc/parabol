import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import makeProjectsByStatus from 'universal/utils/makeProjectsByStatus';
import {TEAM_DASH} from 'universal/utils/constants';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';
import makeAllProjects from 'universal/utils/makeAllProjects';

const teamColumnsSubQuery = `
query {
  teamMembers (teamId: $teamId) @live {
    id
    picture
    preferredName,
    projects @live {
      content
      id
      status
      teamMemberId
      updatedAt
      userSort
      teamSort
    }
  }
}
`;

// memoized
const resolveTeamProjects = (teamMembers) => {
  if (teamMembers !== resolveTeamProjects.teamMembers) {
    resolveTeamProjects.teamMembers = teamMembers;
    const allProjects = makeAllProjects(teamMembers);
    resolveTeamProjects.cache = makeProjectsByStatus(allProjects, 'teamSort');
  }
  return resolveTeamProjects.cache;
};

const mapStateToProps = (state, props) => {
  const {teamId} = props;
  const teamColumnsSub = cashay.query(teamColumnsSubQuery, {
    op: 'teamColumnsContainer',
    key: teamId,
    variables: {teamId},
  });
  const {teamMembers} = teamColumnsSub.data;
  const projects = resolveTeamProjects(teamMembers);
  return {
    projects,
    teamMembers,
    myTeamMemberId: `${state.auth.obj.sub}::${teamId}`
  };
};

const TeamColumnsContainer = (props) => {
  const {myTeamMemberId, projects} = props;
  return (
    <ProjectColumns myTeamMemberId={myTeamMemberId} projects={projects} area={TEAM_DASH}/>
  );
};

TeamColumnsContainer.propTypes = {
  myTeamMemberId: PropTypes.string,
  projects: PropTypes.object
};

export default connect(mapStateToProps)(TeamColumnsContainer);

import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import NullCard from 'universal/components/NullCard/NullCard';
import TeamProjectCard from 'universal/modules/teamDashboard/components/TeamProjectCard/TeamProjectCard';

const projectCardSubQuery = `
query {
  project @cached(id: $projectId type: "Project") {
    content
    id
    status
    teamMemberId
    updatedAt
    teamMember @cached(type: "TeamMember") {
      id
      picture
      preferredName
    }
    team @cached(type: "Team") {
      name
    }
  }
}
`;

const mapStateToProps = (state, props) => {
  const userId = state.auth.obj.sub;
  const [teamId] = props.project.id.split('::');
  const projectId = props.project.id;
  const {project} = cashay.query(projectCardSubQuery, {
    op: 'projectCardContainer',
    key: projectId,
    variables: {projectId},
    // example of returning a string instead of a function so it runs in O(1)
    resolveCached: {
      team: (source) => (doc) => source.id.startsWith(doc.id),
      teamMember: (source) => source.teamMemberId
    },
  }).data;
  const {preferredName} = project.teamMember;
  const username = preferredName && preferredName.replace(/\s+/g, '');
  const myTeamMemberId = `${userId}::${teamId}`;
  return {
    preferredName,
    project,
    username,
    myTeamMemberId
  };
};

const ProjectCardContainer = (props) => {
  const {area, dispatch, myTeamMemberId, preferredName, project, username} = props;
  const {content, id, status, teamMemberId} = project;
  if (!content && myTeamMemberId !== teamMemberId) {
    return <NullCard username={username}/>;
  }
  // if (area === USER_DASH) {
  //   return (
  //     <UserProjectCardContainer
  //     />
  //   )
  // }
  // area === TEAM_DASH
  const form = `${status}::${id}`;
  return (
    <TeamProjectCard
      area={area}
      dispatch={dispatch}
      form={form}
      project={project}
      preferredName={preferredName}
    />
  );
};


ProjectCardContainer.propTypes = {
  area: PropTypes.string,
  dispatch: PropTypes.func,
  myTeamMemberId: PropTypes.string,
  preferredName: PropTypes.string,
  username: PropTypes.string,
  project: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    status: PropTypes.string,
    teamMemberId: PropTypes.string
  })
};

export default connect(mapStateToProps)(ProjectCardContainer);

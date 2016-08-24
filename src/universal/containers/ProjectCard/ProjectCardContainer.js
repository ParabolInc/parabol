import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
// import {TEAM_DASH, USER_DASH} from 'universal/utils/constants';
// import {getAuthQueryString, authedOptions} from 'universal/redux/getAuthedUser';
import TeamProjectCardContainer from
  'universal/modules/teamDashboard/containers/TeamProjectCard/TeamProjectCardContainer';
import NullCard from 'universal/components/NullCard/NullCard';
import subscriptions from 'universal/subscriptions/subscriptions';
import {TEAM_MEMBERS} from 'universal/utils/constants';
import subscriber from 'universal/subscriptions/subscriber';

const teamMembersSubQuery = subscriptions.find(sub => sub.channel === TEAM_MEMBERS).string;

const mapStateToProps = (state, props) => {
  const userId = state.auth.obj.sub;
  const [teamId] = props.project.id.split('::');
  const {project} = props;
  const {teamMembers} = cashay.subscribe(teamMembersSubQuery, subscriber, {
    key: teamId,
    op: TEAM_MEMBERS,
    variables: {teamId},
  }).data;
  const projectOwner = teamMembers.find(m => m.id === project.teamMemberId);
  const {preferredName} = projectOwner;
  const username = preferredName && preferredName.replace(/\s+/g, '');
  const myTeamMemberId = `${userId}::${teamId}`;
  return {
    preferredName,
    username,
    myTeamMemberId
  };
};

const ProjectCardContainer = (props) => {
  const {myTeamMemberId, preferredName, project, username} = props;
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
    <TeamProjectCardContainer
      form={form}
      project={project}
      preferredName={preferredName}
    />
  );
};


ProjectCardContainer.propTypes = {
  area: PropTypes.string,
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

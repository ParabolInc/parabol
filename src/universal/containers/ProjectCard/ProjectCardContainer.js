import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import {TEAM_DASH, USER_DASH} from 'universal/utils/constants';
import {getAuthQueryString, authedOptions} from 'universal/redux/getAuthedUser';
import TeamProjectCardContainer from
  'universal/modules/teamDashboard/containers/TeamProjectCard/TeamProjectCardContainer';
import NullCard from 'universal/components/NullCard/NullCard';

const mapStateToProps = (state, props) => {
  const {id, preferredName} = cashay.query(getAuthQueryString, authedOptions).data.user;
  const [teamId] = props.project.id.split('::');
  const username = preferredName.replace(/\s+/g, '');
  const myTeamMemberId = `${id}::${teamId}`;
  return {
    preferredName,
    username,
    myTeamMemberId
  };
};

const ProjectCardContainer = (props) => {
  const {area, myTeamMemberId, preferredName, project, username} = props;
  const {content, id, status, teamMemberId} = project;
  if (!content && myTeamMemberId !== teamMemberId) {
    return <NullCard username={username}/>
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
  )
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

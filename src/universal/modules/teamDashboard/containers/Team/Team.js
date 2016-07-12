import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import Team from 'universal/modules/teamDashboard/components/Team/Team';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {getAuthQueryString, authedOptions} from 'universal/redux/getAuthedUser';

const mapStateToProps = (state, props) => {
  const {params: {id: teamId}} = props;
  return {
    teamId,
    user: cashay.query(getAuthQueryString, authedOptions).data.user,
  };
};

const TeamContainer = (props) => {
  const {teamId, user, ...otherProps} = props;
  return <Team teamId={teamId} user={user} {...otherProps} />;
};

TeamContainer.propTypes = {
  teamId: PropTypes.string.isRequired,
  user: PropTypes.object
};

export default connect(mapStateToProps)(
  requireAuth(TeamContainer)
);

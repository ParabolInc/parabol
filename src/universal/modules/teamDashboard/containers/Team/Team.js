import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import Team from 'universal/modules/teamDashboard/components/Team/Team';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';

const getUserAndMemberships = `
query {
  user: getCurrentUser {
    id,
    email,
    id,
    isNew,
    picture,
    preferredName
    memberships {
      id,
      team {
       id,
       name
      },
      isLead,
      isActive,
      isFacilitator
    }
  }
}`;

const queryOpts = {
  component: 'TeamContainer',
  localOnly: true
};

const mapStateToProps = () => ({
  user: cashay.query(getUserAndMemberships, queryOpts).data.user
});

const TeamContainer = (props) => {
  const {params: {teamId}, user, ...otherProps} = props;
  return <Team teamId={teamId} user={user} {...otherProps} />;
};

TeamContainer.propTypes = {
  params: PropTypes.shape({
    teamId: PropTypes.string.isRequired
  }),
  user: PropTypes.shape({
    name: PropTypes.string,
    memberships: PropTypes.array,
    preferredName: PropTypes.string
  })
};

export default connect(mapStateToProps)(requireAuth(TeamContainer));

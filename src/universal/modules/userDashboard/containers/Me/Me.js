import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {DashLayout, DashSidebar} from 'universal/components/Dashboard';
import Outcomes from 'universal/modules/userDashboard/components/Outcomes/Outcomes';
import {getUserAndMemberships, queryOpts} from 'universal/modules/userDashboard/helpers/getUserAndMemberships';

const mapStateToProps = () => ({
  user: cashay.query(getUserAndMemberships, queryOpts).data.user
});

const MeContainer = (props) => {
  const {user} = props;
  return (
    <DashLayout title="My Dashboard">
      <DashSidebar activeArea="outcomes"/>
      <Outcomes preferredName={user.preferredName}/>
    </DashLayout>
  );
};

MeContainer.propTypes = {
  user: PropTypes.shape({
    memberships: PropTypes.array,
    preferredName: PropTypes.string
  })
};

export default connect(mapStateToProps)(requireAuth(MeContainer));

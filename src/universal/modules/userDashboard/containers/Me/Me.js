import React, {PropTypes} from 'react';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {DashLayout, DashSidebar} from 'universal/components/Dashboard';
import Outcomes from 'universal/modules/userDashboard/components/Outcomes/Outcomes';

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
    preferredName: PropTypes.string
  })
};

export default requireAuth(MeContainer);

import React, {PropTypes} from 'react';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {DashLayout, DashSidebar} from 'universal/components/Dashboard';
import Outcomes from 'universal/modules/userDashboard/components/Outcomes/Outcomes';

const MeContainer = (props) => {
  const {dispatch, user, ...otherProps} = props;
  return (
    <DashLayout title="My Dashboard" dispatch={dispatch}>
      <DashSidebar activeArea="outcomes" dispatch={dispatch} user={user} />
      <Outcomes user={user} {...otherProps} />
    </DashLayout>
  );
};

MeContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    preferredName: PropTypes.string
  })
};

export default requireAuth(MeContainer);

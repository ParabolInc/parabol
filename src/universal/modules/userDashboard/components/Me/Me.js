import React, {PropTypes} from 'react';

import DashLayout from 'universal/components/DashLayout/DashLayout';
import DashSidebar from 'universal/components/DashSidebar/DashSidebar';

import Outcomes from 'universal/modules/userDashboard/components/Outcomes/Outcomes';
import Settings from 'universal/modules/userDashboard/components/Preferences/Preferences';

const Me = (props) => {
  const {dispatch, location, user} = props;
  return (
    <DashLayout title="My Dashboard">
      <DashSidebar dispatch={dispatch} location={location} user={user} />
      {location === '/me' && <Outcomes {...props} />}
      {location === '/me/settings' && <Settings {...props} />}
    </DashLayout>
  );
};

Me.propTypes = {
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.string,
  user: PropTypes.shape({
    name: PropTypes.string,
    nickname: PropTypes.string,
    memberships: PropTypes.array
  })
};

export default Me;

import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {DashLayout, DashSidebar} from 'universal/components/Dashboard';
import Preferences from 'universal/modules/userDashboard/components/Settings/Settings';

const mapStateToProps = (state) => {
  return {
    activity: state.userDashboardSettings.activity,
    nextPage: state.userDashboardSettings.nextPage,
  };
};

const MeSettingsContainer = (props) => {
  const {dispatch, user, ...otherProps} = props;
  const activeMeetings = []; // TODO
  return (
    <DashLayout title="My Dashboard" activeMeetings={activeMeetings}>
      <DashSidebar activeArea="settings" dispatch={dispatch} user={user} />
      <Preferences user={user} {...otherProps} />
    </DashLayout>
  );
};

MeSettingsContainer.propTypes = {
  activity: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  nextPage: PropTypes.string,
  user: PropTypes.shape({
    name: PropTypes.string,
    preferredName: PropTypes.string
  })
};

export default connect(mapStateToProps)(
  requireAuth(MeSettingsContainer)
);

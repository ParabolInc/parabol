import React, {PropTypes} from 'react';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import reduxSocketOptions from 'universal/redux/reduxSocketOptions';
import {reduxSocket} from 'redux-socket-cluster';
import UserSettings from 'universal/modules/userDashboard/components/UserSettings/UserSettings';
import {connect} from 'react-redux';

const mapStateToProps = (state) => {
  return {
    activity: state.userDashboardSettings.activity,
    nextPage: state.userDashboardSettings.nextPage,
    userId: state.auth.obj.sub
  };
};

const UserSettingsContainer = (props) => {
  const {activity, dispatch, nextPage, user: {preferredName, id: userId}} = props;
  return (
    <UserSettings
      activity={activity}
      dispatch={dispatch}
      nextPage={nextPage}
      preferredName={preferredName}
      userId={userId}
    />
  );
};

UserSettingsContainer.propTypes = {
  activity: PropTypes.string,
  dispatch: PropTypes.func,
  nextPage: PropTypes.string,
  user: PropTypes.shape({
    email: PropTypes.string,
    id: PropTypes.string,
    picture: PropTypes.string,
    preferredName: PropTypes.string,
  }),
  userId: PropTypes.string
};

export default requireAuth(
  reduxSocket({}, reduxSocketOptions)(
    connect(mapStateToProps)(
      UserSettingsContainer
    )
  )
);

import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import {getAuthQueryString, authedOptions} from 'universal/redux/getAuthedUser';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {DashLayout, DashSidebar} from 'universal/components/Dashboard';
import Settings from 'universal/modules/userDashboard/components/Preferences/Preferences';


const mapStateToProps = (state) => {
  return {
    authToken: state.authToken,
    user: cashay.query(getAuthQueryString, authedOptions).data.user
  };
};

const MeSettingsContainer = (props) => {
  const {dispatch, user, ...otherProps} = props;
  return (
    <DashLayout title="My Dashboard">
      <DashSidebar activeArea="settings" dispatch={dispatch} user={user} />
      <Settings user={user} {...otherProps} />
    </DashLayout>
  );
};

MeSettingsContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    nickname: PropTypes.string,
    memberships: PropTypes.array
  })
};

export default connect(mapStateToProps)(
  requireAuth(MeSettingsContainer)
);

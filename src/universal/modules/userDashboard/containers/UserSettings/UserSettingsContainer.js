import React, {Component, PropTypes} from 'react';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import UserSettings from 'universal/modules/userDashboard/components/UserSettings/UserSettings';
import {connect} from 'react-redux';
import {showSuccess} from 'universal/modules/notifications/ducks/notifications';
import {
  ACTIVITY_WELCOME,
  clearActivity
} from 'universal/modules/userDashboard/ducks/settingsDuck';
import {reduxForm, initialize} from 'redux-form';
import {cashay} from 'cashay';
import {withRouter} from 'react-router';

const updateSuccess = {
  title: 'Settings saved!',
  message: 'We won\'t forget who you are.',
  level: 'success'
};

const mapStateToProps = (state) => {
  return {
    activity: state.userDashboardSettings.activity,
    nextPage: state.userDashboardSettings.nextPage,
    userId: state.auth.obj.sub
  };
};

@requireAuth
@connect(mapStateToProps)
@reduxForm({form: 'userSettings'})
@withRouter
export default class UserSettingsContainer extends Component {
  static propTypes = {
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

  componentWillMount() {
    this.initializeForm();
  }

  onSubmit = async(submissionData) => {
    const {activity, dispatch, nextPage, userId, router} = this.props;
    const {preferredName} = submissionData;
    const options = {
      variables: {
        updatedUser: {
          id: userId,
          preferredName
        }
      }
    };
    await cashay.mutate('updateUserProfile', options);
    dispatch(showSuccess(updateSuccess));
    if (activity === ACTIVITY_WELCOME) {
      dispatch(clearActivity());
    }
    if (nextPage) {
      router.push(nextPage);
    }
  };

  initializeForm() {
    const {dispatch, preferredName} = this.props;
    return dispatch(initialize('userSettings', {preferredName}));
  }

  render() {
    return (
      <UserSettings
        {...this.props}
        onSubmit={this.onSubmit}
      />
    );
  }
};

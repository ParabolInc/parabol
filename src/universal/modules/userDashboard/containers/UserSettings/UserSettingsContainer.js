import React, {Component, PropTypes} from 'react';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import UserSettings from 'universal/modules/userDashboard/components/UserSettings/UserSettings';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {getAuthQueryString, getAuthedOptions} from 'universal/redux/getAuthedUser';
import {showSuccess} from 'universal/modules/toast/ducks/toastDuck';
import {
  ACTIVITY_WELCOME,
  clearActivity
} from 'universal/modules/userDashboard/ducks/settingsDuck';
import {reduxForm, initialize} from 'redux-form';
import {cashay} from 'cashay';
import makeUpdatedUserSchema from 'universal/validation/makeUpdatedUserSchema';
import shouldValidate from 'universal/validation/shouldValidate';
import raven from 'raven-js';

const updateSuccess = {
  title: 'Settings saved!',
  message: 'We won\'t forget who you are.',
  level: 'success'
};

const mapStateToProps = (state) => {
  const userId = state.auth.obj.sub;
  const user = cashay.query(getAuthQueryString, getAuthedOptions(userId)).data.user;
  return {
    activity: state.userDashboardSettings.activity,
    nextPage: state.userDashboardSettings.nextPage,
    user,
    userId: state.auth.obj.sub
  };
};

const validate = (values) => {
  const schema = makeUpdatedUserSchema();
  return schema(values).errors;
};

// use requireAuth to get the user doc
@requireAuth
@reduxForm({form: 'userSettings', shouldValidate, validate})
@connect(mapStateToProps)
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
    router: PropTypes.object,
    untouch: PropTypes.func,
    userId: PropTypes.string
  };

  componentWillMount() {
    this.initializeForm();
  }

  onSubmit = (submissionData) => {
    const {user} = this.props;
    const {preferredName} = submissionData;
    if (preferredName !== user.preferredName) {
      this.updateProfile(preferredName)
      .then(this.onSubmitComplete())
      .catch((e) => raven.captureException(e));
    }

    return undefined; // no work to do
  };

  onSubmitComplete() {
    const {activity, dispatch, nextPage, untouch, router} = this.props;
    dispatch(showSuccess(updateSuccess));
    if (activity === ACTIVITY_WELCOME) {
      dispatch(clearActivity());
    }
    if (nextPage) {
      router.push(nextPage);
    }
    untouch('preferredName');
  }

  updateProfile(preferredName, pictureUrl) {
    const {userId} = this.props;
    const options = {
      variables: {
        updatedUser: {
          id: userId,
          preferredName,
          picture: pictureUrl
        }
      }
    };
    return cashay.mutate('updateUserProfile', options);
  }

  initializeForm() {
    const {dispatch, user: {preferredName}} = this.props;
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
}

import PropTypes from 'prop-types';
import raven from 'raven-js';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createFragmentContainer} from 'react-relay';
import {initialize, reduxForm} from 'redux-form';
import withReducer from 'universal/decorators/withReducer/withReducer';
import {showSuccess} from 'universal/modules/toast/ducks/toastDuck';
import UserSettings from 'universal/modules/userDashboard/components/UserSettings/UserSettings';
import userSettingsReducer, {ACTIVITY_WELCOME, clearActivity} from 'universal/modules/userDashboard/ducks/settingsDuck';
import UpdateUserProfileMutation from 'universal/mutations/UpdateUserProfileMutation';
import makeUpdatedUserSchema from 'universal/validation/makeUpdatedUserSchema';
import shouldValidate from 'universal/validation/shouldValidate';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

const updateSuccess = {
  title: 'Settings saved!',
  message: 'We won’t forget who you are.',
  level: 'success'
};

const mapStateToProps = (state) => {
  return {
    activity: state.userDashboardSettings.activity,
    nextPage: state.userDashboardSettings.nextPage
  };
};

const validate = (values) => {
  const schema = makeUpdatedUserSchema();
  return schema(values).errors;
};

class UserSettingsContainer extends Component {
  static propTypes = {
    activity: PropTypes.string,
    atmosphere: PropTypes.object.isRequired,
    dispatch: PropTypes.func,
    nextPage: PropTypes.string,
    history: PropTypes.object,
    untouch: PropTypes.func,
    viewer: PropTypes.object.isRequired
  };

  componentWillMount() {
    this.initializeForm();
  }

  onSubmit = async (submissionData) => {
    const {atmosphere, viewer} = this.props;
    const {preferredName} = submissionData;
    if (preferredName === viewer.preferredName) return undefined;
    return new Promise((resolve, reject) => {
      const onError = (err) => {
        raven.captureException(err);
        reject(err);
      };
      const onCompleted = () => {
        const {activity, dispatch, nextPage, untouch, history} = this.props;
        dispatch(showSuccess(updateSuccess));
        if (activity === ACTIVITY_WELCOME) {
          dispatch(clearActivity());
        }
        if (nextPage) {
          history.push(nextPage);
        }
        untouch('preferredName');
        resolve();
      };
      const updatedUser = {preferredName};
      UpdateUserProfileMutation(atmosphere, updatedUser, onError, onCompleted);
    });
  };

  initializeForm() {
    const {dispatch, viewer: {preferredName}} = this.props;
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

export default createFragmentContainer(
  withAtmosphere(
    withReducer({userDashboardSettings: userSettingsReducer})(
      reduxForm({form: 'userSettings', shouldValidate, validate})(
        connect(mapStateToProps)(
          UserSettingsContainer
        )
      )
    )
  ),
  graphql`
    fragment UserSettingsContainer_viewer on User {
      preferredName
      ...UserSettings_viewer
    }
  `
);


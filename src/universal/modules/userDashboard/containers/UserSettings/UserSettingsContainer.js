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
import makeStep1Schema from 'universal/validation/makeStep1Schema';

const updateSuccess = {
  title: 'Settings saved!',
  message: 'We won\'t forget who you are.',
  level: 'success'
};

const mapStateToProps = (state) => {
  return {
    activity: state.userDashboardSettings.activity,
    nextPage: state.userDashboardSettings.nextPage,
    userId: state.auth.obj.sub,
  };
};

const validate = (values) => {
  const schema = makeStep1Schema();
  return schema(values).errors;
};

@requireAuth
@connect(mapStateToProps)
@reduxForm({form: 'userSettings', validate})
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
    userId: PropTypes.string
  };

  componentWillMount() {
    this.initializeForm();
  }

  onSubmit = (submissionData) => {
    const {activity, dispatch, nextPage, untouch, user, userId, router} = this.props;
    const {preferredName} = submissionData;
    if (preferredName === user.preferredName) return;
    const options = {
      variables: {
        updatedUser: {
          id: userId,
          preferredName
        }
      }
    };
    cashay.mutate('updateUserProfile', options);
    dispatch(showSuccess(updateSuccess));
    if (activity === ACTIVITY_WELCOME) {
      dispatch(clearActivity());
    }
    if (nextPage) {
      router.push(nextPage);
    }
    untouch('preferredName');
  };

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

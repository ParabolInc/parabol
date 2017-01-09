import React, {Component, PropTypes} from 'react';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import UserSettings from 'universal/modules/userDashboard/components/UserSettings/UserSettings';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {getAuthQueryString, getAuthedOptions} from 'universal/redux/getAuthedUser';
import {showSuccess} from 'universal/modules/notifications/ducks/notifications';
import {
  ACTIVITY_WELCOME,
  clearActivity
} from 'universal/modules/userDashboard/ducks/settingsDuck';
import {reduxForm, initialize} from 'redux-form';
import {cashay} from 'cashay';
import makeUpdatedUserSchema from 'universal/validation/makeUpdatedUserSchema';
import shouldValidate from 'universal/validation/shouldValidate';
import fetch from 'universal/utils/fetch';

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
    untouch: PropTypes.func.isRequired,
    userId: PropTypes.string
  };

  componentWillMount() {
    this.initializeForm();
  }

  onSubmit = (submissionData) => {
    const {user} = this.props;
    const {preferredName, pictureFile} = submissionData;
    if (pictureFile && pictureFile.name) {
      // upload new picture to CDN, then update the user profile:
      this.uploadPicture(pictureFile)
      .then(pictureUrl => this.updateProfile(preferredName, pictureUrl))
      .then(this.onSubmitComplete())
      .catch((e) => Raven.captureException(e)); // eslint-disable-line no-undef
    } else if (preferredName !== user.preferredName) {
      this.updateProfile(preferredName)
      .then(this.onSubmitComplete())
      .catch((e) => Raven.captureException(e)); // eslint-disable-line no-undef
    }

    return; // no work to do
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

  uploadPicture(pictureFile) {
    return cashay.mutate('createUserPicturePutUrl', {
      variables: {
        contentType: pictureFile.type,
        contentLength: pictureFile.size,
      }
    })
    .then(({data, error}) => {
      if (error) {
        throw new Error(error._error); // eslint-disable-line no-underscore-dangle
      }
      return data.createUserPicturePutUrl;
    })
    .then(picturePutUrl => {
      return fetch(picturePutUrl, {
        method: 'PUT',
        body: pictureFile
      });
    })
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        return response.url;
      }
      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    })
    .then(putUrl => {
      // crafty way of parsing URL, see: https://gist.github.com/jlong/2428561
      const parser = document.createElement('a');
      parser.href = putUrl;
      const {protocol, host, pathname} = parser;
      return `${protocol}//${host}${pathname}`;
    });
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

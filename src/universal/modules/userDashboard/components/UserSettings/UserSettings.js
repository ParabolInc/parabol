import React, {Component, PropTypes} from 'react';
import {reduxForm, initialize} from 'redux-form';
import {withRouter} from 'react-router';
import {cashay} from 'cashay';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import {DashContent, DashHeader, DashHeaderInfo} from 'universal/components/Dashboard';
import Button from 'universal/components/Button/Button';
import Field from 'universal/components/Field/Field';
import {showSuccess} from 'universal/modules/notifications/ducks/notifications';

import {
  ACTIVITY_WELCOME,
  clearActivity
} from 'universal/modules/userDashboard/ducks/settingsDuck';

const updateSuccess = {
  title: 'Settings saved!',
  message: 'We won\'t forget who you are.',
  level: 'success'
};

let styles = {};

@look
@reduxForm({form: 'userSettings'})
@withRouter
export default class UserSettings extends Component {
  static propTypes = {
    activity: PropTypes.string,          // from settingsDuck
    dispatch: PropTypes.func,
    handleSubmit: PropTypes.func,
    nextPage: PropTypes.string,          // from settingsDuck
    router: PropTypes.object,
    userId: PropTypes.string,
    /* User for form defaults: */
    preferredName: PropTypes.string
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
  }

  initializeForm() {
    const {dispatch, preferredName} = this.props;
    return dispatch(initialize('userSettings', {preferredName}));
  }

  renderActivity(activity) {
    if (activity === ACTIVITY_WELCOME) {
      return (
        <div>
          Hey, welcome aboard! In order for your team to recognize who you
          are, do you mind telling us your name?
        </div>
      );
    }
    return null;
  }

  render() {
    const {activity, handleSubmit} = this.props;
    return (
      <form className={styles.root} onSubmit={handleSubmit(this.onSubmit)}>
        <DashHeader>
          <DashHeaderInfo title="My Settings"/>
        </DashHeader>
        <DashContent>
          <div className={styles.body}>
            <div className={styles.row}>
              {this.renderActivity(activity)}
            </div>
            <div className={styles.row}>
              <div className={styles.label}>
                Name
              </div>
              <Field
                autoFocus
                hasShortcutHint
                name="preferredName"
                placeholder="Albert Einstein"
                type="text"
              />
            </div>
            <Button
              isBlock
              label="Update"
              size="small"
              theme="cool"
              type="submit"
            />
          </div>
        </DashContent>
      </form>
    );
  }
}

styles = StyleSheet.create({
  root: {
    display: 'flex !important',
    flex: 1,
    flexDirection: 'column'
  },

  body: {
    maxWidth: '20rem'
  },

  row: {
    margin: '0 0 1.5rem'
  },

  label: {
    color: theme.palette.dark,
    fontSize: theme.typography.s2,
    fontWeight: 700,
    margin: '0 0 .5rem',
    padding: '0 0 0 .5rem',
    textTransform: 'uppercase'
  }
});

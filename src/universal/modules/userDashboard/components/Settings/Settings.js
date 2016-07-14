import React, {Component, PropTypes} from 'react';
import {reduxForm, initialize} from 'redux-form';
import {push} from 'react-router-redux';
import {cashay} from 'cashay';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import {DashContent, DashHeader} from 'universal/components/Dashboard';
import Button from 'universal/components/Button/Button';
import Field from 'universal/components/Field/Field';
import {show} from 'universal/modules/notifications/ducks/notifications';

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
export default class Settings extends Component {
  static propTypes = {
    activity: PropTypes.string,          // from settingsDuck
    dispatch: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func,
    nextPage: PropTypes.string,          // from settingsDuck
    /* User for form defaults: */
    user: PropTypes.shape({
      profile: PropTypes.shape({
        preferredName: PropTypes.string,
      })
    }),
    /* Data from form for mutation: */
    userSettings: PropTypes.shape({
      preferredName: PropTypes.string
    })
  };

  componentWillMount() {
    this.initializeForm();
  }

  onSubmit = async (submissionData) => {
    const {activity, dispatch, nextPage, user} = this.props;
    const {preferredName} = submissionData;
    const options = {
      variables: {
        updatedProfile: {
          id: user.id,
          preferredName
        }
      }
    };
    await cashay.mutate('updateUserProfile', options);
    dispatch(show(updateSuccess));
    if (activity === ACTIVITY_WELCOME) {
      dispatch(clearActivity());
    }
    if (nextPage) {
      dispatch(push(nextPage));
    }
  }

  initializeForm() {
    const {dispatch, user: { profile: {preferredName} } } = this.props;
    return dispatch(initialize('userSettings', { preferredName }));
  }

  renderActivity(activity) {
    return (
      <div>
      {
        activity === ACTIVITY_WELCOME && `
          Hey, welcome aboard! In order for your team to recognize who you
          are, do you mind telling us your name?
        `
      }
      </div>
    );
  }

  render() {
    const {activity, handleSubmit} = this.props;
    return (
      <form className={styles.root} onSubmit={handleSubmit(this.onSubmit)}>
        <DashHeader title="My Settings" />
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

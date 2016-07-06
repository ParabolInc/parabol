import React, {Component, PropTypes} from 'react';
import {reduxForm, initialize} from 'redux-form';
import {cashay} from 'cashay';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import {DashContent, DashHeader} from 'universal/components/Dashboard';
import Button from 'universal/components/Button/Button';
import Field from 'universal/components/Field/Field';
import getAuthedUser from 'universal/redux/getAuthedUser';

import {show} from 'universal/modules/notifications/ducks/notifications';

const updateSuccess = {
  title: 'Preferences saved!',
  message: 'We won\'t forget who you are.',
  level: 'success'
};

let styles = {};

@look
class Preferences extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func,
    /* User for form defaults: */
    user: PropTypes.shape({
      profile: PropTypes.shape({
        preferredName: PropTypes.string,
      })
    }),
    /* Data from form for mutation: */
    userPreferences: PropTypes.shape({
      preferredName: PropTypes.string
    })
  };

  componentWillMount() {
    this.initializeForm();
  }

  onSubmit = async (submissionData) => {
    const {dispatch} = this.props;
    const {preferredName} = submissionData;
    const user = getAuthedUser();
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
  }

  initializeForm() {
    const {dispatch, user: { profile: {preferredName} } } = this.props;
    return dispatch(initialize('userPreferences', { preferredName }));
  }

  render() {
    const {handleSubmit} = this.props;
    return (
      <form className={styles.root} onSubmit={handleSubmit(this.onSubmit)}>
        <DashHeader title="My Preferences" />
        <DashContent>
          <div className={styles.body}>
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

export default reduxForm({
  form: 'userPreferences',
  // TODO: add sync + mailgun async validations
})(Preferences);

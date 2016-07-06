import React, {Component, PropTypes} from 'react';
import {reduxForm, initialize} from 'redux-form';
import {cashay} from 'cashay';
import DashContent from 'universal/components/DashContent/DashContent';
import DashHeader from 'universal/components/DashHeader/DashHeader';
import Button from 'universal/components/Button/Button';
import Field from 'universal/components/Field/Field';
import getAuthedUser from 'universal/redux/getAuthedUser';

import {show} from 'universal/modules/notifications/ducks/notifications';

const updateSuccess = {
  title: 'Preferences saved!',
  message: 'We won\'t forget who you are.',
  level: 'success'
};
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
          <Field
            autoFocus
            hasShortcutHint
            name="preferredName"
            placeholder="Albert Einstein"
            type="text"
          />
          <Button
            label="Update"
            size="small"
            theme="cool"
            type="submit"
          />
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
}
});

export default reduxForm({
  form: 'userPreferences',
  // TODO: add sync + mailgun async validations
})(Preferences);

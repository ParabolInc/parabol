import React, {Component, PropTypes} from 'react';
import {reduxForm, initialize} from 'redux-form';
import DashContent from 'universal/components/DashContent/DashContent';
import DashHeader from 'universal/components/DashHeader/DashHeader';
import Button from 'universal/components/Button/Button';
import Field from 'universal/components/Field/Field';

class Preferences extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func,
    user: PropTypes.shape({
      name: PropTypes.string,
      nickname: PropTypes.string,
    })
  };

  componentWillMount() {
    const {dispatch, user: {name, nickname}} = this.props;
    dispatch(initialize('userPreferences', {
      preferredName: name,
      nickname
    }));
  }

  async onSubmit() {
    console.log('would submit');
  }

  render() {
    const {handleSubmit} = this.props;
    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        <DashHeader title="My Preferences" />
        <DashContent>
          <Field
            autoFocus
            hasShortcutHint
            name="preferredName"
            placeholder="Albert Einstein"
            type="text"
          />
          <Field
            autoFocus
            hasShortcutHint
            name="nickname"
            placeholder="Weird Al"
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

export default reduxForm({
  form: 'userPreferences',
  destroyOnUnmount: false
  // TODO: add sync + mailgun async validations
})(Preferences);

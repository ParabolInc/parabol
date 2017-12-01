// @flow
import type {FieldProps} from 'redux-form';

import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {reduxForm, Field} from 'redux-form';
import InputField from 'universal/components/InputField/InputField';

type Props = {
  handleFormBlur: () => any,
  handleFormSubmit: () => any,
  handleSubmit: (fn: () => any) => any,
  teamName: string
};

class ArchiveTeamForm extends Component<Props> {
  validate = (value) => (
    value !== this.props.teamName
      ? 'The team name entered was incorrect'
      : undefined
  );

  render() {
    const {handleFormSubmit, handleFormBlur, handleSubmit} = this.props;
    return (
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Field
          autoFocus
          onBlur={handleFormBlur}
          colorPalette="gray"
          component={InputField}
          name="archivedTeamName"
          placeholder='E.g. "My Team"'
          type="text"
          validate={this.validate}
        />
      </form>
    );
  }
}

export default reduxForm({form: 'archiveTeamConfirmation'})(ArchiveTeamForm)

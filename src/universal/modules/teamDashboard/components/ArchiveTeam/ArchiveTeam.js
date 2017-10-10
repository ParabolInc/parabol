import PropTypes from 'prop-types';
import React from 'react';
import {reduxForm, Field} from 'redux-form';
import InputField from 'universal/components/InputField/InputField';
import Button from 'universal/components/Button/Button';
import Type from 'universal/components/Type/Type';

const ArchiveTeam = (props) => {
  const {
    teamName,
    handleSubmit,
    handleClick,
    handleFormBlur,
    handleFormSubmit,
    showConfirmationField,
    submitting
  } = props;

  const archiveTeamClick = () => {
    if (!submitting) handleClick();
  };

  const validate = (value) => {
    return value !== teamName && 'The team name entered was incorrect';
  };

  return (
    <div>
      {!showConfirmationField ?
        <div>
          <Button
            buttonSize="small"
            colorPalette="warm"
            label="Delete Team"
            onClick={archiveTeamClick}
          />
          <Type width="auto" marginTop=".5rem" scale="s2">
            <b>Note</b>: {'Currently, this can’t be undone.'}
          </Type>
        </div> :
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Field
            autoFocus
            onBlur={handleFormBlur}
            colorPalette="gray"
            component={InputField}
            name="archivedTeamName"
            placeholder="Type the team name to confirm"
            type="text"
            validate={validate}
          />
        </form>
      }
    </div>
  );
};

ArchiveTeam.propTypes = {
  teamName: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleFormSubmit: PropTypes.func.isRequired,
  handleFormBlur: PropTypes.func.isRequired,
  handleClick: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  showConfirmationField: PropTypes.bool.isRequired
};

export default reduxForm({form: 'archiveTeamConfirmation'})(ArchiveTeam);

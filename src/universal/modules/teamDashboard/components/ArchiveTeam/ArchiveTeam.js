import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {reduxForm, Field} from 'redux-form';
import InputField from 'universal/components/InputField/InputField';
import Button from 'universal/components/Button/Button';
import Type from 'universal/components/Type/Type';

@reduxForm({form: 'archiveTeamConfirmation'})
class ArchiveTeam extends Component {
  static propTypes = {
    teamName: PropTypes.string.isRequired,
    handleFormBlur: PropTypes.func.isRequired,
    handleFormSubmit: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    handleClick: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    showConfirmationField: PropTypes.bool.isRequired
  };

  archiveTeamClick = () => {
    const {submitting, handleClick} = this.props;
    if (!submitting) handleClick();
  };

  validate = (value) => (
    value !== this.props.teamName
      ? 'The team name entered was incorrect'
      : undefined
  );

  render() {
    const {
      handleFormBlur,
      handleFormSubmit,
      handleSubmit,
      showConfirmationField
    } = this.props;

    return (
      <div>
        {!showConfirmationField ?
          <div>
            <Button
              buttonSize="small"
              colorPalette="warm"
              label="Delete Team"
              onClick={this.archiveTeamClick}
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
              validate={this.validate}
            />
          </form>
        }
      </div>
    );
  }
}

export default ArchiveTeam;

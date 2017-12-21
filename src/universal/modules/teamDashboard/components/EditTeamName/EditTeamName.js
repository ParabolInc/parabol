import PropTypes from 'prop-types';
import React from 'react';
import {Field, reduxForm} from 'redux-form';
import Editable from 'universal/components/Editable/Editable';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import UpdateTeamNameMutation from 'universal/mutations/UpdateTeamNameMutation';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import editTeamNameValidation from './editTeamNameValidation';

const fieldStyles = {
  ...ui.dashHeaderTitleStyles,
  placeholderColor: appTheme.palette.mid70l
};

const validate = (values) => {
  const schema = editTeamNameValidation();
  return schema(values).errors;
};

const EditTeamName = (props) => {
  const {atmosphere, teamName, teamId, handleSubmit} = props;
  const updateEditable = async (submissionData) => {
    const schema = editTeamNameValidation();
    const {data: {teamName: validTeamName}} = schema(submissionData);
    const updatedTeam = {
      id: teamId,
      name: validTeamName
    };
    UpdateTeamNameMutation(atmosphere, updatedTeam);
  };
  return (
    <Field
      component={Editable}
      initialValue={teamName}
      name="teamName"
      placeholder="Team Name"
      submitOnBlur
      typeStyles={fieldStyles}
      handleSubmit={handleSubmit(updateEditable)}
    />
  );
};

EditTeamName.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  teamName: PropTypes.string,
  teamId: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired
};

export default withAtmosphere(reduxForm({form: 'teamName', enableReinitialize: true, validate})(EditTeamName));

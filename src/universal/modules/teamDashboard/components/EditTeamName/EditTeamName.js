import React, {PropTypes} from 'react';
import Editable from 'universal/components/Editable/Editable.js';
import {cashay} from 'cashay';
import {reduxForm, Field} from 'redux-form';
import appTheme from 'universal/styles/theme/appTheme';
import makeStep2Schema from 'universal/validation/makeStep2Schema';

const fieldStyles = {
  color: appTheme.palette.dark10d,
  fontSize: appTheme.typography.s5,
  lineHeight: appTheme.typography.s6,
  placeholderColor: appTheme.palette.mid70l
};

const validate = (values) => {
  const schema = makeStep2Schema('teamName');
  console.log(schema(values).errors)
  return schema(values).errors;
};

const EditTeamName = (props) => {
  const {teamName, teamId, handleSubmit} = props;
  const updateEditable = (submissionData) => {
    const variables = {
      updatedTeam: {
        id: teamId,
        name: submissionData.teamName
      }
    };
    cashay.mutate('updateTeamName', {variables});
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
  teamName: PropTypes.string,
  teamId: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired
};

export default reduxForm({form: 'teamName', enableReinitialize: true, validate})(EditTeamName);

import React, {PropTypes} from 'react';
import Editable from 'universal/components/Editable/Editable.js'
import {cashay} from 'cashay';
import {reduxForm, Field} from 'redux-form';
import appTheme from 'universal/styles/theme/appTheme';

const fieldStyles = {
  color: appTheme.palette.dark10d,
  fontSize: appTheme.typography.s5,
  lineHeight: appTheme.typography.s6,
  placeholderColor: appTheme.palette.mid70l
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

export default reduxForm({form: 'teamName', enableReinitialize: true})(EditTeamName);

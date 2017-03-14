import React, {PropTypes} from 'react';
import Editable from 'universal/components/Editable/Editable';
import {cashay} from 'cashay';
import {reduxForm, Field} from 'redux-form';
import appTheme from 'universal/styles/theme/appTheme';
import editOrgNameValidation from './editOrgNameValidation';

const fieldStyles = {
  color: appTheme.palette.mid,
  fontSize: appTheme.typography.s7,
  lineHeight: appTheme.typography.s8,
  placeholderColor: appTheme.palette.mid70l
};

const validate = (values) => {
  const schema = editOrgNameValidation();
  return schema(values).errors;
};

const EditOrgName = (props) => {
  const {orgName, orgId, handleSubmit} = props;
  const updateEditable = async (submissionData) => {
    const schema = editOrgNameValidation();
    const {data: {orgName: validatedOrgName}} = schema(submissionData);
    if (validatedOrgName && validatedOrgName !== orgName) {
      const variables = {
        updatedOrg: {
          id: orgId,
          name: validatedOrgName
        }
      };
      cashay.mutate('updateOrg', {variables});
    }
  };
  return (
    <Field
      component={Editable}
      initialValue={orgName}
      name="orgName"
      placeholder="Organization Name"
      submitOnBlur
      typeStyles={fieldStyles}
      handleSubmit={handleSubmit(updateEditable)}
    />
  );
};

EditOrgName.propTypes = {
  orgName: PropTypes.string,
  orgId: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired
};

export default reduxForm({form: 'orgName', enableReinitialize: true, validate})(EditOrgName);

import PropTypes from 'prop-types';
import React from 'react';
import {Field, reduxForm} from 'redux-form';
import Editable from 'universal/components/Editable/Editable';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import UpdateOrgMutation from 'universal/mutations/UpdateOrgMutation';
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
  const {atmosphere, orgName, orgId, handleSubmit} = props;
  const updateEditable = async (submissionData) => {
    const schema = editOrgNameValidation();
    const {data: {orgName: validatedOrgName}} = schema(submissionData);
    if (validatedOrgName && validatedOrgName !== orgName) {
      const updatedOrg = {
        id: orgId,
        name: validatedOrgName
      };
      UpdateOrgMutation(atmosphere, updatedOrg);
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
  atmosphere: PropTypes.object.isRequired,
  orgName: PropTypes.string,
  orgId: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired
};

export default withAtmosphere(reduxForm({form: 'orgName', enableReinitialize: true, validate})(EditOrgName));

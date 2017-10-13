import {cashay} from 'cashay';
import PropTypes from 'prop-types';
import raven from 'raven-js';
import React from 'react';
import {Field, reduxForm} from 'redux-form';
import FileInput from 'universal/components/FileInput/FileInput';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import UpdateOrgMutation from 'universal/mutations/UpdateOrgMutation';
import sendAssetToS3 from 'universal/utils/sendAssetToS3';
import makeAvatarSchema from 'universal/validation/makeAvatarSchema';
import shouldValidate from 'universal/validation/shouldValidate';

const validate = (values) => {
  const schema = makeAvatarSchema();
  return schema(values).errors;
};

const uploadPicture = async (orgId, pictureFile) => {
  const {data, error} = await cashay.mutate('createOrgPicturePutUrl', {
    variables: {
      contentType: pictureFile.type,
      contentLength: pictureFile.size,
      orgId
    }
  });
  if (error) {
    throw new Error(error._error);
  }
  const {createOrgPicturePutUrl: putUrl} = data;
  return sendAssetToS3(pictureFile, putUrl);
};

const OrgAvatarInput = (props) => {
  const {atmosphere, handleSubmit, orgId} = props;

  const updateOrg = (pictureUrl) => {
    const updatedOrg = {
      id: orgId,
      picture: pictureUrl
    };
    UpdateOrgMutation(atmosphere, updatedOrg);
  };

  const onSubmit = async (submissionData) => {
    const {pictureFile} = submissionData;
    if (pictureFile && pictureFile.name) {
      // upload new picture to CDN, then update the user profile:
      const pictureUrl = await uploadPicture(orgId, pictureFile);
      try {
        await updateOrg(pictureUrl);
      } catch (e) {
        raven.captureException(e);
      }
    }
    // no work to do
    return undefined;
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Field
        accept="image/*"
        component={(cProps) => <FileInput buttonLabel="Choose File" {...cProps} />}
        doSubmit={handleSubmit(onSubmit)}
        name="pictureFile"
      />
    </form>
  );
};

OrgAvatarInput.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func,
  orgId: PropTypes.string
};

export default withAtmosphere(
  reduxForm({form: 'orgAvatar', shouldValidate, validate})(
    OrgAvatarInput
  )
);

import PropTypes from 'prop-types';
import raven from 'raven-js';
import React from 'react';
import {Field, reduxForm} from 'redux-form';
import FileInput from 'universal/components/FileInput/FileInput';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import CreateOrgPicturePutUrlMutation from 'universal/mutations/CreateOrgPicturePutUrlMutation';
import UpdateOrgMutation from 'universal/mutations/UpdateOrgMutation';
import sendAssetToS3 from 'universal/utils/sendAssetToS3';
import makeAvatarSchema from 'universal/validation/makeAvatarSchema';
import shouldValidate from 'universal/validation/shouldValidate';

const validate = (values) => {
  const schema = makeAvatarSchema();
  return schema(values).errors;
};

const uploadPicture = async (atmosphere, orgId, pictureFile) => {
  return new Promise((resolve, reject) => {
    const variables = {
      contentType: pictureFile.type,
      contentLength: pictureFile.size,
      orgId
    };
    const onError = (err) => {
      reject(err);
    };
    const onCompleted = (res) => {
      const {createOrgPicturePutUrl: {url}} = res;
      const pathname = sendAssetToS3(pictureFile, url);
      resolve(pathname);
    };
    CreateOrgPicturePutUrlMutation(atmosphere, variables, onError, onCompleted);
  });
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
      const pictureUrl = await uploadPicture(atmosphere, orgId, pictureFile);
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

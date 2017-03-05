import React, {PropTypes} from 'react';
import {reduxForm, Field} from 'redux-form';
import {cashay} from 'cashay';
import makeAvatarSchema from 'universal/validation/makeAvatarSchema';
import shouldValidate from 'universal/validation/shouldValidate';
import sendAssetToS3 from 'universal/utils/sendAssetToS3';
import FileInput from 'universal/components/FileInput/FileInput';
import raven from 'raven-js';

const validate = (values) => {
  const schema = makeAvatarSchema();
  return schema(values).errors;
};

const uploadPicture = async (orgId, pictureFile) => {
  const {data, error} = await cashay.mutate('createOrgPicturePutUrl', {
    variables: {
      contentType: pictureFile.type,
      contentLength: pictureFile.size,
      orgId,
    }
  });
  if (error) {
    throw new Error(error._error);
  }
  const {createOrgPicturePutUrl: putUrl} = data;
  return sendAssetToS3(pictureFile, putUrl);
};

const OrgAvatarInput = (props) => {
  const {handleSubmit, orgId} = props;

  const updateOrg = (pictureUrl) => {
    const options = {
      variables: {
        updatedOrg: {
          id: orgId,
          picture: pictureUrl
        }
      }
    };
    return cashay.mutate('updateOrg', options);
  };

  const onSubmit = async(submissionData) => {
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
  handleSubmit: PropTypes.func,
  orgId: PropTypes.string
};

export default reduxForm({form: 'orgAvatar', shouldValidate, validate})(
  OrgAvatarInput
);

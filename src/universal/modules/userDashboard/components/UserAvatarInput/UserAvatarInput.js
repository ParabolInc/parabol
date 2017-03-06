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

const uploadPicture = async (pictureFile) => {
  const {data, error} = await cashay.mutate('createUserPicturePutUrl', {
    variables: {
      contentType: pictureFile.type,
      contentLength: pictureFile.size
    }
  });
  if (error) {
    throw new Error(error._error);
  }
  const {createUserPicturePutUrl: putUrl} = data;
  return sendAssetToS3(pictureFile, putUrl);
};

const UserAvatarInput = (props) => {
  const {handleSubmit, userId} = props;

  const updateUser = (id, pictureUrl) => {
    const options = {
      variables: {
        updatedUser: {
          id: userId,
          picture: pictureUrl
        }
      }
    };
    return cashay.mutate('updateUserProfile', options);
  };

  const onSubmit = async(submissionData) => {
    const {pictureFile} = submissionData;
    if (pictureFile && pictureFile.name) {
      // upload new picture to CDN, then update the user profile:
      const pictureUrl = await uploadPicture(pictureFile);
      try {
        await updateUser(userId, pictureUrl);
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

UserAvatarInput.propTypes = {
  handleSubmit: PropTypes.func,
  userId: PropTypes.string
};

export default reduxForm({form: 'userAvatar', shouldValidate, validate})(
  UserAvatarInput
);

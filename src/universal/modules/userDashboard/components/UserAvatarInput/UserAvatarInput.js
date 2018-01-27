import PropTypes from 'prop-types';
import raven from 'raven-js';
import React from 'react';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import FileInput from 'universal/components/FileInput/FileInput';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import CreateUserPicturePutUrlMutation from 'universal/mutations/CreateUserPicturePutUrlMutation';
import UpdateUserProfileMutation from 'universal/mutations/UpdateUserProfileMutation';
import sendAssetToS3 from 'universal/utils/sendAssetToS3';
import makeAvatarSchema from 'universal/validation/makeAvatarSchema';
import shouldValidate from 'universal/validation/shouldValidate';

const validate = (values) => {
  const schema = makeAvatarSchema();
  return schema(values).errors;
};

const uploadPicture = async (atmosphere, pictureFile) => {
  const variables = {
    contentType: pictureFile.type,
    contentLength: pictureFile.size
  };

  return new Promise((resolve, reject) => {
    const onError = (err) => {
      reject(JSON.stringify(err));
    };
    const onCompleted = async (res) => {
      const {createUserPicturePutUrl: {url}} = res;
      const pathname = await sendAssetToS3(pictureFile, url);
      resolve(pathname);
    };
    CreateUserPicturePutUrlMutation(atmosphere, variables, onError, onCompleted);
  });
};

const UserAvatarInput = (props) => {
  const {atmosphere, handleSubmit} = props;
  const onSubmit = async (submissionData) => {
    const {pictureFile} = submissionData;
    if (pictureFile && pictureFile.name) {
      // upload new picture to CDN, then update the user profile:
      const pictureUrl = await uploadPicture(atmosphere, pictureFile);
      const updatedUser = {picture: pictureUrl};
      const onError = (err) => {
        raven.captureException(err);
        throw new SubmissionError(err);
      };
      return new Promise((resolve) => {
        const onCompleted = () => {
          resolve();
        };
        UpdateUserProfileMutation(atmosphere, updatedUser, onError, onCompleted);
      });
    }
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
  atmosphere: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func,
  userId: PropTypes.string
};

export default reduxForm({form: 'userAvatar', shouldValidate, validate})(
  withAtmosphere(UserAvatarInput)
);

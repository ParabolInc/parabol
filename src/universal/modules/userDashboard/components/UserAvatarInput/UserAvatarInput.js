import React from 'react';
import {reduxForm, Field} from 'redux-form';
import {cashay} from 'cashay';
import makeAvatarSchema from 'universal/validation/makeAvatarSchema';
import shouldValidate from 'universal/validation/shouldValidate';
import sendAssetToS3 from 'universal/utils/sendAssetToS3';
import FileInput from 'universal/components/FileInput/FileInput';
import PropTypes from 'prop-types';
import raven from 'raven-js';
import CreateUserPicturePutUrlMutation from 'universal/mutations/CreateUserPicturePutUrlMutation';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

const validate = (values) => {
  const schema = makeAvatarSchema();
  return schema(values).errors;
};

const uploadPicture = async (atmosphere, pictureFile) => {
  const variables = {
    contentType: pictureFile.type,
    contentLength: pictureFile.size
  };

  const onError = (err) => {
    throw new Error(err);
  };

  return new Promise((resolve) => {
    const onCompleted = async (res) => {
      const {createOrgPicturePutUrl: {url}} = res;
      const pathname = await sendAssetToS3(pictureFile, url);
      resolve(pathname);
    };
    CreateUserPicturePutUrlMutation(atmosphere, variables, onError, onCompleted);
  });
};

const UserAvatarInput = (props) => {
  const {atmosphere, handleSubmit, userId} = props;
  const updateUser = (id, pictureUrl) => {
    const options = {
      variables: {
        updatedUser: {
          picture: pictureUrl
        }
      }
    };
    return cashay.mutate('updateUserProfile', options);
  };

  const onSubmit = async (submissionData) => {
    const {pictureFile} = submissionData;
    if (pictureFile && pictureFile.name) {
      // upload new picture to CDN, then update the user profile:
      const pictureUrl = await uploadPicture(atmosphere, pictureFile);
      try {
        await updateUser(userId, pictureUrl);
      } catch (e) {
        raven.captureException(e);
      }
    }
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

import React, {Component, PropTypes} from 'react';
import {reduxForm, Field} from 'redux-form';
import {cashay} from 'cashay';
import makeAvatarSchema from 'universal/validation/makeAvatarSchema';
import shouldValidate from 'universal/validation/shouldValidate';
import sendAssetToS3 from 'universal/utils/sendAssetToS3';
import FileInput from 'universal/components/FileInput/FileInput';

const validate = (values) => {
  console.log('validating')
  const schema = makeAvatarSchema();
  const errors = schema(values).errors;
  console.log('validate errors', errors);
  return errors;
};

const uploadPicture = async(pictureFile) => {
  const {data, error} = cashay.mutate('createUserPicturePutUrl', {
    variables: {
      contentType: pictureFile.type,
      contentLength: pictureFile.size,
    }
  });
  if (error) {
    throw new Error(error._error); // eslint-disable-line no-underscore-dangle
  }
  const {createUserPicturePutUrl: putUrl} = data;
  return sendAssetToS3(pictureFile, putUrl)
};

class OrgAvatar extends Component {
  render() {
    const {handleSubmit, picture, touch} = this.props;
    const updateProfile = (pictureUrl) => {
      const {userId} = this.props;
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
          await updateProfile(pictureUrl);
        } catch (e) {
          // eslint-disable-line no-undef
          Raven.captureException(e)
        }
      }
      // no work to do
      return undefined;
    };
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Field
          accept="image/*"
          component={FileInput}
          doSubmit={handleSubmit(onSubmit)}
          name="pictureFile"
          touch={touch}
          previousValue={picture}
          forceUpdate={() => this.forceUpdate()}
        />
      </form>
    );
  }
}

export default reduxForm({form: 'orgAvatar', shouldValidate, validate})(
  OrgAvatar
)

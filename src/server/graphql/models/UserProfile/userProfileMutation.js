import r from '../../../database/rethinkDriver';
import {
  GraphQLNonNull
} from 'graphql';
import {requireSUOrSelf} from '../authorization';
import {UserProfile, UpdateProfileInput} from './userProfileSchema';

export default {
  updateUserProfile: {
    type: UserProfile,
    args: {
      updatedProfile: {
        type: new GraphQLNonNull(UpdateProfileInput),
        description: 'The input object containing the user profile fields that can be changed'
      }
    },
    async resolve(source, {updatedProfile}, {authToken}) {
      const {id, ...updatedObj} = updatedProfile;
      requireSUOrSelf(authToken, id);
      const dbProfile = await r.table('UserProfile').get(id).update(updatedObj, {returnChanges: true});
      return dbProfile.changes[0].new_val;
    }
  }
};

import r from '../../../database/rethinkDriver';
import {
  GraphQLNonNull
} from 'graphql';
import {requireSUOrSelf} from '../authorization';
import {UserProfile, UpdateProfileInput} from './userProfileSchema';
import {updatedOrOriginal} from '../utils';

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
      /*
       * If we really want to be jocky, we can optmize this into a single
       * ReQL query at the expense of readability:
       */
      const hasTeam = await r.table('TeamMember')
        .getAll(id, {index: 'cachedUserId'})
        .isEmpty()
        .not();
      const dbProfile = await r.table('UserProfile').get(id)
        .update({
          ...updatedObj,
          isNew: !hasTeam,
        }, {returnChanges: true});
      return updatedOrOriginal(dbProfile, updatedProfile);
    }
  }
};

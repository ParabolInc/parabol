import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import UpdateUserProfileInput from 'server/graphql/types/UpdateUserProfileInput';
import User from 'server/graphql/types/User';
import {getUserId, requireAuth} from 'server/utils/authorization';
import segmentIo from 'server/utils/segmentIo';
import {handleSchemaErrors, updatedOrOriginal} from 'server/utils/utils';
import makeUserServerSchema from 'universal/validation/makeUserServerSchema';

const updateUserProfile = {
  type: User,
  args: {
    updatedUser: {
      type: new GraphQLNonNull(UpdateUserProfileInput),
      description: 'The input object containing the user profile fields that can be changed'
    }
  },
  async resolve(source, {updatedUser}, {authToken}) {
    const r = getRethink();

    // AUTH
    requireAuth(authToken);
    const userId = getUserId(authToken);

    // VALIDATION
    const schema = makeUserServerSchema();
    const {data: validUpdatedUser, errors} = schema(updatedUser);
    handleSchemaErrors(errors);

    // RESOLUTION
    // propagate denormalized changes to TeamMember
    const dbProfileChanges = await r.table('TeamMember')
      .getAll(userId, {index: 'userId'})
      .update(validUpdatedUser)
      .do(() => {
        return r.table('User')
          .get(userId)
          .update(validUpdatedUser, {returnChanges: 'always'});
      });
    //
    // If we ever want to delete the previous profile images:
    //
    // const previousProfile = previousValue(dbProfileChanges);
    // if (previousProfile && urlIsPossiblyOnS3(previousProfile.picture)) {
    // // possible remove prior profile image from CDN asynchronously
    //   s3DeleteObject(previousProfile.picture)
    //   .catch(console.warn.bind(console));
    // }
    //
    const dbProfile = updatedOrOriginal(dbProfileChanges);
    segmentIo.identify({
      userId: dbProfile.id,
      traits: {
        avatar: dbProfile.picture,
        createdAt: dbProfile.createdAt,
        email: dbProfile.email,
        name: dbProfile.preferredName
      }
    });
    return dbProfile;
  }
};

export default updateUserProfile;

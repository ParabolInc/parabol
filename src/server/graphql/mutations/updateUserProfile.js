import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import UpdateUserProfileInput from 'server/graphql/types/UpdateUserProfileInput';
import UpdateUserProfilePayload from 'server/graphql/types/UpdateUserProfilePayload';
import {getUserId, requireAuth} from 'server/utils/authorization';
import segmentIo from 'server/utils/segmentIo';
import {handleSchemaErrors} from 'server/utils/utils';
import makeUserServerSchema from 'universal/validation/makeUserServerSchema';
import publish from 'server/utils/publish';
import {NOTIFICATION, TEAM_MEMBER} from 'universal/utils/constants';

const updateUserProfile = {
  type: UpdateUserProfilePayload,
  args: {
    updatedUser: {
      type: new GraphQLNonNull(UpdateUserProfileInput),
      description: 'The input object containing the user profile fields that can be changed'
    }
  },
  async resolve(source, {updatedUser}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();
    const subOptions = {operationId, mutatorId};

    // AUTH
    requireAuth(authToken);
    const userId = getUserId(authToken);

    // VALIDATION
    const schema = makeUserServerSchema();
    const {data: validUpdatedUser, errors} = schema(updatedUser);
    handleSchemaErrors(errors);

    // RESOLUTION
    const updates = {
      ...validUpdatedUser,
      updatedAt: now
    };
    // propagate denormalized changes to TeamMember
    const {user, teamMembers} = await r({
      teamMembers: r.table('TeamMember')
        .getAll(userId, {index: 'userId'})
        .update(updates, {returnChanges: true})('changes')('new_val'),
      user: r.table('User')
        .get(userId)
        .update(updates, {returnChanges: true})('changes')(0)('new_val')
        .default(null)
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
    segmentIo.identify({
      userId: user.id,
      traits: {
        avatar: user.picture,
        createdAt: user.createdAt,
        email: user.email,
        name: user.preferredName
      }
    });
    const teamMemberIds = teamMembers.map(({id}) => id);
    const teamIds = teamMembers.map(({teamId}) => teamId);
    const data = {userId, teamMemberIds};
    teamIds.forEach((teamId) => {
      publish(TEAM_MEMBER, teamId, UpdateUserProfilePayload, data, subOptions);
    });
    publish(NOTIFICATION, userId, UpdateUserProfilePayload, data, subOptions);
    return data;
  }
};

export default updateUserProfile;

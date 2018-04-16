import getRethink from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLString} from 'graphql';
import {requireSU} from 'server/utils/authorization';
import UserFlagEnum from 'server/graphql/types/UserFlagEnum';
import {NOTIFICATION} from 'universal/utils/constants';
import publish from 'server/utils/publish';
import AddFeatureFlagPayload from 'server/graphql/types/AddFeatureFlagPayload';
import {sendTeamMemberNotFoundError} from 'server/utils/docNotFoundErrors';

export default {
  type: AddFeatureFlagPayload,
  description: 'Give someone advanced features in a flag',
  args: {
    email: {
      type: new GraphQLNonNull(GraphQLString),
      description: `the complete or partial email of the person to whom you are giving advanced features. 
      Matches via a regex to support entire domains`
    },
    flag: {
      type: new GraphQLNonNull(UserFlagEnum),
      description: 'the flag that you want to give to the user'
    }
  },
  async resolve(source, {email, flag}, {authToken, dataLoader}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {operationId};
    // AUTH
    requireSU(authToken);

    // RESOLUTION
    const userIds = await r.table('User')
      .filter((doc) => doc('email').match(email))('id')
      .default([]);
    if (userIds.length === 0) {
      return sendTeamMemberNotFoundError(authToken);
    }

    await r.table('User')
      .getAll(userIds, {index: 'id'})
      .update((userRow) => ({
        featureFlags: userRow('featureFlags')
          .default([])
          .append(flag)
          .distinct()
      }));
    const result = `${email} has been given access to the ${flag} feature. If the app is open, it should magically appear.`;
    userIds.forEach((userId) => {
      const data = {result, userId};
      publish(NOTIFICATION, userId, AddFeatureFlagPayload, data, subOptions);
    });
    return {result, userIds};
  }
};

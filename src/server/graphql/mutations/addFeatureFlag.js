import getRethink from 'server/database/rethinkDriver';
import {GraphQLNonNull} from 'graphql';
import {requireSU} from 'server/utils/authorization';
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType';
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
      type: new GraphQLNonNull(GraphQLEmailType),
      description: 'the email of the person to whom you are giving advanced features'
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
    const user = await r.table('User')
      .filter((doc) => doc('email').downcase().eq(email))
      .nth(0)
      .default(null);
    if (!user) {
      return sendTeamMemberNotFoundError(authToken);
    }

    const {id: userId} = user;
    console.log('flag', flag);
    await r.table('User').get(userId)
      .update({
        [flag]: true
      });
    const result = `${email} has been given access to the ${flag} feature. If the app is open, it should magically appear.`;
    const data = {result, userId};
    publish(NOTIFICATION, userId, AddFeatureFlagPayload, data, subOptions);
    return data;
  }
};

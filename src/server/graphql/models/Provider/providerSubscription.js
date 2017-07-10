import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql';
import {requireSUOrSelf, requireSUOrTeamMember} from 'server/utils/authorization';
import queryIntegrator from 'server/utils/queryIntegrator';
import {errorObj} from 'server/utils/utils';
import {handleRethinkAdd} from '../../../utils/makeChangefeedHandler';
import {Provider} from './providerSchema';

export default {
  providers: {
    type: new GraphQLList(Provider),
    args: {
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique teamMember ID'
      }
    },
    async resolve(source, {teamMemberId}, {authToken, socket}) {
      // AUTH
      const [userId, teamId] = teamMemberId.split('::');
      requireSUOrSelf(authToken, userId);
      requireSUOrTeamMember(authToken, teamId);

      // RESOLUTION
      const {data, errors} = await queryIntegrator({
        action: 'getProviders',
        payload: {
          teamMemberId
        }
      });
      if (errors) {
        throw errorObj({_error: errors[0]});
      }

      const channel = `providers/${teamMemberId}`;
      data.getIntegrations.forEach((doc) => {
        const feedDoc = handleRethinkAdd(doc);
        socket.emit(channel, feedDoc);
      });
    }
  }
};

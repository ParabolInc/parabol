import {GraphQLNonNull, GraphQLID, GraphQLList} from 'graphql';
import {requireSUOrSelf, requireSUOrTeamMember} from 'server/utils/authorization';
import {Integration} from './integrationSchema';
import queryIntegrator from 'server/utils/queryIntegrator';
import {errorObj} from 'server/utils/utils';
import {handleRethinkAdd} from '../../../utils/makeChangefeedHandler';

export default {
  integrations: {
    type: new GraphQLList(Integration),
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
        action: 'getIntegrations',
        payload: {
          teamMemberId
        }
      });
      if (errors) {
        throw errorObj({_error: errors[0]});
      }

      const channel = `integrations/${teamMemberId}`;
      data.getIntegrations.forEach((doc) => {
        const feedDoc = handleRethinkAdd(doc);
        socket.emit(channel, feedDoc);
      });
    }
  }
};

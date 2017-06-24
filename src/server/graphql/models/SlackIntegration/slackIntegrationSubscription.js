import {GraphQLNonNull, GraphQLID, GraphQLList} from 'graphql';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import SlackIntegration from './slackIntegrationSchema';
import queryIntegrator from 'server/utils/queryIntegrator';
import {errorObj} from 'server/utils/utils';
import {handleRethinkAdd} from '../../../utils/makeChangefeedHandler';

export default {
  slackIntegrations: {
    type: new GraphQLList(SlackIntegration),
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique team ID'
      }
    },
    async resolve(source, {teamId}, {authToken, socket}) {
      // AUTH
      requireSUOrTeamMember(authToken, teamId);

      // RESOLUTION
      const {data, errors} = await queryIntegrator({
        action: 'slackIntegrations',
        payload: {
          teamId
        }
      });
      if (errors) {
        throw errorObj({_error: errors[0]});
      }

      const channel = `slackIntegrations/${teamId}`;
      data.slackIntegrations.forEach((doc) => {
        const feedDoc = handleRethinkAdd(doc);
        socket.emit(channel, feedDoc);
      });
    }
  }
};

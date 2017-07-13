import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import {verify} from 'jsonwebtoken';
import fetch from 'node-fetch';
import {stringify} from 'querystring';
import getRethink from 'server/database/rethinkDriver';
import {clientSecret as auth0ClientSecret} from 'server/utils/auth0Helpers';
import postOptions from 'server/utils/fetchOptions';
import getPubSub from 'server/utils/getPubSub';
import makeAppLink from 'server/utils/makeAppLink';
import {errorObj} from 'server/utils/utils';
import shortid from 'shortid';
import {SLACK} from 'universal/utils/constants';


export default {
  name: 'AddProvider',
  // currently, don't return anything since this is called by the server
  type: GraphQLBoolean,
  args: {
    code: {
      type: new GraphQLNonNull(GraphQLID)
    },
    state: {
      type: new GraphQLNonNull(GraphQLID)
    },
    service: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  resolve: async (source, {code, state, service}, {serverSecret}) => {
    const r = getRethink();
    const now = new Date();

    // AUTH
    if (serverSecret !== process.env.AUTH0_CLIENT_SECRET) {
      throw errorObj({_error: 'Don\'t be rude.'});
    }

    console.log('adding provider')
    // RESOLUTION
    const [teamId, jwt] = state.split('::');
    if (!teamId || !jwt) {
      throw errorObj({_error: 'Bad state'});
    }
    const authToken = verify(jwt, Buffer.from(auth0ClientSecret, 'base64'));
    if (!authToken || !Array.isArray(authToken.tms) || !authToken.tms.includes(teamId)) {
      throw errorObj({_error: 'Bad auth token'});
    }

    if (service === SLACK) {
      const queryParams = {
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: makeAppLink('auth/slack')
      };
      const uri = `https://slack.com/api/oauth.access?${stringify(queryParams)}`;
      const slackRes = await fetch(uri, postOptions);
      const json = await slackRes.json();
      const {ok, error, access_token: accessToken, scope, team_id: providerUserId, team_name: providerUserName} = json;
      if (!ok) {
        throw errorObj({_error: error});
      }
      if (scope !== 'identify,incoming-webhook,channels:read,chat:write:bot') {
        throw errorObj({_error: `bad scope: ${scope}`})
      }
      console.log('json', json)
      const provider = await r.table('Provider')
        .getAll(teamId, {index: 'teamIds'})
        .filter({service: SLACK})
        .nth(0)('id')
        .default(null)
        .do((providerId) => {
          return r.branch(
            providerId.eq(null),
            r.table('Provider')
              .insert({
                id: shortid.generate(),
                accessToken,
                createdAt: now,
                providerUserId,
                providerUserName,
                service: SLACK,
                teamIds: [teamId],
                updatedAt: now
              }, {returnChanges: true})('changes')(0)('new_val'),
            r.table('Provider')
              .get(providerId)
              .update({
                accessToken,
                updatedAt: now
              }, {returnChanges: true})('changes')(0)('new_val')
          );
        });

      const providerAdded = {
        provider,
        providerRow: {
          accessToken,
          service: SLACK,
          teamId
        }
      };
      getPubSub().publish(`providerAdded.${teamId}`, {providerAdded});
    }
  }
};

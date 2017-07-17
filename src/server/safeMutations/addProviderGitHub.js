import fetch from 'node-fetch';
import {stringify} from 'querystring';
import getRethink from 'server/database/rethinkDriver';
import postOptions from 'server/utils/fetchOptions';
import getPubSub from 'server/utils/getPubSub';
import makeAppLink from 'server/utils/makeAppLink';
import shortid from 'shortid';
import {GITHUB, GITHUB_ENDPOINT, GITHUB_SCOPE} from 'universal/utils/constants';
import getProviderRowData from 'server/safeQueries/getProviderRowData';

const profileQuery = `
query { 
  viewer { 
    login
    id
  }
}`;

const addProviderGitHub = async (code, teamId, userId) => {
  const r = getRethink();
  const now = new Date();
  const queryParams = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
    redirect_uri: makeAppLink('auth/github')
  };
  const uri = `https://github.com/login/oauth/access_token?${stringify(queryParams)}`;
  const ghRes = await fetch(uri, postOptions);
  const json = await ghRes.json();
  const {access_token: accessToken, scope} = json;
  if (scope !== GITHUB_SCOPE) {
    throw new Error(`bad scope: ${scope}`);
  }
  const authedPostOptions = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      query: profileQuery
    })
  };
  const ghProfile = await fetch(GITHUB_ENDPOINT, authedPostOptions);
  const gqlRes = await ghProfile.json();
  if (!gqlRes.data) {
    console.error('GitHub error: ', gqlRes)
  }
  const {data: {viewer: {login: providerUserName, id: providerUserId}}} = gqlRes;
  const provider = await r.table('Provider')
    .getAll(teamId, {index: 'teamIds'})
    .filter({service: GITHUB, userId})
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
            service: GITHUB,
            teamIds: [teamId],
            updatedAt: now,
            userId
          }, {returnChanges: true})('changes')(0)('new_val'),
        r.table('Provider')
          .get(providerId)
          .update({
            accessToken,
            updatedAt: now,
            providerUserId,
            providerUserName
          }, {returnChanges: true})('changes')(0)('new_val')
      );
    });

  const rowDetails = await getProviderRowData(GITHUB, teamId);

  const providerAdded = {
    provider,
    providerRow: {
      ...rowDetails,
      accessToken,
      service: GITHUB,
      teamId
    },
  };
  getPubSub().publish(`providerAdded.${teamId}`, {providerAdded});
};

export default addProviderGitHub;

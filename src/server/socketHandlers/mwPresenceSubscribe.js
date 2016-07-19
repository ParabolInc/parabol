import parseChannel from './parseChannel';
import {getTeamMember} from 'server/graphql/models/authorization';
import {PRESENCE} from 'universal/subscriptions/constants';

// const mockGetTeamMember = () => new Promise(resolve => {
//   setTimeout(() => {
//     resolve('hi');
//   }, 2000);
// });

export default async function mwPresenceSubscribe(req, next) {
  if (req.authTokenExpiredError) {
    next(req.authTokenExpiredError);
    return;
  }
  const {channel, variableString: teamId} = parseChannel(req.channel);
  if (channel !== PRESENCE) {
    // all auth is taken care of inside GraphQL
    next();
    return;
  }
  const authToken = req.socket.getAuthToken();
  // TODO cache all memberships on the socket?
  const teamMember = await getTeamMember(authToken, teamId);
  if (teamMember) {
    next();
  } else {
    next({name: 'Unauthorized subscription', message: `You are not a part of team ${teamId}`});
  }
}

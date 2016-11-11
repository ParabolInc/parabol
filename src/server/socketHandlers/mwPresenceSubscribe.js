import parseChannel from 'universal/utils/parseChannel';
import {PRESENCE} from 'universal/subscriptions/constants';

export default function mwPresenceSubscribe(req, next) {
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
  const tms = authToken.tms || [];
  if (tms.includes(teamId)) {
    next();
  } else {
    next({name: 'Unauthorized subscription', message: `You are not a part of team ${teamId}`});
  }
}

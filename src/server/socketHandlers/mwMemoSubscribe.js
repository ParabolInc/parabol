import parseChannel from 'universal/utils/parseChannel';
import {USER_MEMO} from 'universal/subscriptions/constants';

export default function mwMemoSubscribe(req, next) {
  if (req.authTokenExpiredError) {
    next(req.authTokenExpiredError);
    return;
  }
  const {channel, variableString: userId} = parseChannel(req.channel);
  if (channel === USER_MEMO) {
    const authToken = req.socket.getAuthToken();
    if (authToken.sub !== userId) {
      next({name: 'Unauthorized subscription', message: `You are not ${userId}`});
      return;
    }
  }
  // all auth is taken care of inside GraphQL
  next();
}

import parseChannel from 'universal/utils/parseChannel';
import {USER_MEMO, ADD_TO_TEAM, KICK_OUT} from 'universal/subscriptions/constants';

export default function mwMemoPublishOut(req, next) {
  const {channel} = parseChannel(req.channel);
  if (channel === USER_MEMO) {
    const {type} = req.data;
    if (type === ADD_TO_TEAM) {
      const authToken = req.socket.getAuthToken();
      const {teamId} = req.data;
      const newAuthToken = {
        ...authToken,
        tms: authToken.tms.concat(teamId),
        exp: undefined
      };
      req.socket.setAuthToken(newAuthToken);
      next();
      return;
    }
    if (type === KICK_OUT) {
      const authToken = req.socket.getAuthToken();
      const {teamId} = req.data;
      // send the message before sending the kickouts so the client can navigate away from components that will request stale things
      next();
      const subs = req.socket.subscriptions();
      subs.forEach((sub) => {
        if (sub.indexOf(teamId) !== -1) {
          // remove from client cache
          req.socket.emit(sub, {
            type: 'remove',
            fields: {
              id: teamId
            }
          });
          // stop listening
          req.socket.kickOut(sub, 'Removed from team');
        }
      });
      const idxToRemove = authToken.tms.indexOf(teamId);
      const safeIdx = idxToRemove === -1 ? Infinity : idxToRemove;
      const newAuthToken = {
        ...authToken,
        tms: [...authToken.tms.slice(0, safeIdx), ...authToken.tms.slice(safeIdx + 1)],
        exp: undefined
      };
      // replace token with one that doesn't include the teamId in tms
      req.socket.setAuthToken(newAuthToken);
      return;
    }
  }
  next();
}

 import parseChannel from 'universal/utils/parseChannel';
import {USER_MEMO, ADD_TO_TEAM} from 'universal/subscriptions/constants';

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
  }
  next();
}

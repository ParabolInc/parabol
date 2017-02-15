 import parseChannel from 'universal/utils/parseChannel';
import {EDIT, PRESENT, SOUNDOFF, PRESENCE, KICK_OUT, REJOIN_TEAM} from 'universal/subscriptions/constants';

export default function mwPresencePublishOut(req, next) {
  const {channel, variableString: channelKey} = parseChannel(req.channel);
  if (channel === PRESENCE) {
    const {type, targetId, userId} = req.data;
    if (type === SOUNDOFF) {
      // don't ping yourself
      if (targetId === req.socket.id) {
        // silently fail
        next(true);
        return;
      }
    } else if (type === PRESENT) {
      // if we supply a target, only tell the target that I'm here
      if (targetId && targetId !== req.socket.id) {
        next(true);
        return;
      }
    } else if (type === EDIT) {
      const {socketId: senderSocketId} = req.data;
      // do not send back to self
      if (senderSocketId && senderSocketId === req.socket.id) {
        next(true);
        return;
      }
    } else if (type === KICK_OUT) {
      const authToken = req.socket.getAuthToken();
      if (authToken.sub === userId) {
        const subs = req.socket.subscriptions();
        subs.forEach((sub) => {
          if (sub.indexOf(channelKey) !== -1) {
            // remove from client cache
            req.socket.emit(sub, {
              type: 'remove',
              fields: {
                id: channelKey
              }
            });
            // stop listening
            req.socket.kickOut(sub, 'Removed from team');
          }
        });
        const idxToRemove = authToken.tms.indexOf(channelKey);
        const safeIdx = idxToRemove === -1 ? Infinity : idxToRemove;
        const newAuthToken = {
          ...authToken,
          tms: [...authToken.tms.slice(0, safeIdx), ...authToken.tms.slice(safeIdx +1)],
          exp: undefined
        };
        // replace token with one that doesn't include the teamId in tms
        req.socket.setAuthToken(newAuthToken);
        next(true);
        return;
      }
      // reinvited to the team
    } else if (type === REJOIN_TEAM) {
      const authToken = req.socket.getAuthToken();
      console.log('REJOIN', authToken.sub, userId, channel, channelKey)
      if (authToken.sub === userId) {
        const newAuthToken = {
          ...authToken,
          tms: authToken.tms.concat(channelKey),
          exp: undefined
        };
        // replace token with one that doesn't include the teamId in tms
        console.log('new TMS', newAuthToken.tms);
        req.socket.setAuthToken(newAuthToken);
        next(true);
        return;
      } else if (authToken.sub === req.data.sender) {
        next(true);
        return;
      }
    }
  }
  next();
}

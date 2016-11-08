import parseChannel from './parseChannel';
import {EDIT, PRESENT, SOUNDOFF, PRESENCE, TEAM, KICK_OUT} from 'universal/subscriptions/constants';

export default function mwPresencePublishOut(req, next) {
  const {channel, variableString: channelKey} = parseChannel(req.channel);
  if (channel === PRESENCE) {
    const {type, targetId} = req.data;
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
    }
  } else if (channel === TEAM) {
    const {type, userId} = req.data;
    if (type === KICK_OUT) {
      const authToken = req.socket.getAuthToken();
      if (authToken.sub === userId) {
        const subs = req.socket.subscriptions();
        subs.forEach((sub) => {
          if (sub.indexOf(channelKey) !== -1) {
            req.socket.kickOut(sub, 'Removed from team');
          }
        });
        req.data = {
          type: 'remove',
          fields: {
            id: channelKey
          }
        };
        authToken.tms.splice(authToken.tms.indexOf(channelKey),1);
        req.socket.setAuthToken(authToken);
      }
    }
  }
  next();
}

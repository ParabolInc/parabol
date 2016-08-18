import parseChannel from './parseChannel';
import {EDIT, PRESENT, SOUNDOFF, PRESENCE} from 'universal/subscriptions/constants';

export default function mwPresencePublishOut(req, next) {
  const {channel} = parseChannel(req.channel);
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
  }
  next();
}

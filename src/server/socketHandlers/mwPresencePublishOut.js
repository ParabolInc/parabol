import parseChannel from './parseChannel';
import {PRESENT, SOUNDOFF, PRESENCE} from 'universal/subscriptions/constants';

export default function mwPresencePublishOut(req, next) {
  const {channel} = parseChannel(req.channel);
  if (channel === PRESENCE) {
    const {type, targetId} = req.data;
    if (type === SOUNDOFF) {
      // don't ping yourself
      if (targetId === req.socket.id) {
        next(true);
        return;
      }
    } else if (type === PRESENT) {
      // if we supply a target, only tell the target that I'm here
      if (targetId && targetId !== req.socket.id) {
        next(true);
        return;
      }
    }
  }
  next();
}

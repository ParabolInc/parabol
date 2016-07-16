import parseChannel from './parseChannel';

const PRESENT = 'PRESENT';
const SOUNDOFF = 'SOUNDOFF';

export default function mwPresencePublishOut(req, next) {
  const {channel} = parseChannel(req.channel);
  if (channel === 'presence') {
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
  console.log('PUBLISH OUT EMIT:', req.socket.id, req.data)
  next();
}

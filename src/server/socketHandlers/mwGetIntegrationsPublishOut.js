import parseChannel from 'universal/utils/parseChannel';
import {INTEGRATIONS} from 'universal/subscriptions/constants';
import {handleRethinkAdd} from 'server/utils/makeChangefeedHandler';

export default function mwGetIntegrationsPublishOut(req, next) {
  const {channel} = parseChannel(req.channel);
  if (channel === INTEGRATIONS) {
    const {socketId, payload} = req.data;
    if (socketId) {
      if (socketId === req.socket.id) {
        payload.forEach((doc) => {
          const feedDoc = handleRethinkAdd(doc);
          req.socket.emit(req.channel, feedDoc);
        });
      }
      // silently fail (don't send an initial payload to someone who already has it)
      next(true);
      return;
    }
  }
  next();
}

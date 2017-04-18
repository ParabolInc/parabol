export default function mwGetIntegrationsPublishOut(req, next) {
  if (req.data.excludeSocket) {
    const {excludeSocket, ...payload} = req.data;
    if (excludeSocket === req.socket.id) {
      // don't send it to that guy.
      next(true);
      return;
    }
    req.data = payload;
  }
  next();
}

import getRethink from 'server/database/rethinkDriver';
import {getUserId} from 'server/utils/authorization';
import Raven from 'raven';

const sendSegmentEvent = async (event, authToken, breadcrumb) => {
  const r = getRethink();
  let user;
  if (authToken) {
    const userId = getUserId(authToken);
    user = await r.table('User')
      .get(userId)
      .pluck('id', 'email', 'preferredName', 'picture');
  }
  Raven.context(() => {
    if (user) {
      Raven.setContext({user});
    }
    if (breadcrumb) {
      Raven.captureBreadcrumb(breadcrumb);
    }
    Raven.captureException(event);
  });
};

export default sendSegmentEvent;

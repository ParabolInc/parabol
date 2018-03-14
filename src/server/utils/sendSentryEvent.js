// @flow
import getRethink from 'server/database/rethinkDriver';
import {getUserId} from 'server/utils/authorization';
import Raven from 'raven';

type DataloaderData = {
  key: string,
  keys: Array<string>,
  indexedResults: Map<string, any>
}

type GraphQLData = {
  query: string,
  variables?: { [name: string]: any },
  firstError?: any
};

type MembershipData = {
  teamId: string
}

type Data =
  | DataloaderData
  | GraphQLData
  | MembershipData

type Breadcrumb = {
  message: string,
  category: string,
  data: Data
};

type AuthToken = {
  sub: string
}

const sendSentryEvent = async (authToken?: AuthToken, breadcrumb?: Breadcrumb) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(breadcrumb);
    return;
  }
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
    const event = breadcrumb && breadcrumb.message || new Error('Unknown Error');
    Raven.captureException(event);
  });
};

export default sendSentryEvent;

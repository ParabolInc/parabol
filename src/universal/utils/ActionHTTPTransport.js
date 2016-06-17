import {HTTPTransport} from 'cashay';
import {getGraphQLUri} from './graphQLConfig';

export default class ActionHTTPTransport extends HTTPTransport {
  constructor(authToken) {
    super();
    this.uri = getGraphQLUri();
    if (authToken) {
      this.init = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        }
      };
    }
  }
}

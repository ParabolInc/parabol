import {Auth0ClientOptions} from './auth0Schema';
import {auth0} from 'universal/utils/clientOptions';

export default {
  auth0GetClientOptions: {
    type: Auth0ClientOptions,
    description: 'The auth0 configuration parameters needed to authenticate a client',
    async resolve() {
      return {
        clientId: auth0.clientId,
        domain: auth0.domain
      };
    }
  }
};

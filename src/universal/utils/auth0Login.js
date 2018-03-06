/**
 * Sends an authentication request to auth0 for the client app.
 *
 * When the request is successful a redirect occurs.
 * When it fails, the promise rejects.
 *
 * @flow
 */
import WebAuth from 'auth0-js';
import promisify from 'es6-promisify';

import type {Credentials} from 'universal/types/auth';
import {AUTH0_DB_CONNECTION} from 'universal/utils/constants';

export default async function auth0Login(webAuth: WebAuth, credentials: Credentials): Promise<void> {
  const login = promisify(webAuth.login, webAuth);
  return login({
    ...credentials,
    realm: AUTH0_DB_CONNECTION,
    responseType: 'token'
  });
}

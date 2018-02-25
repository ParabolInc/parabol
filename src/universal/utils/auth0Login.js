/**
 * Sends an authentication request to auth0 for the client app.
 *
 * When the request is successful a redirect occurs.
 * When it fails, the promise rejects.
 *
 * @flow
 */

import type {Credentials} from 'universal/types/auth';
import WebAuth from 'auth0-js';

export default function auth0Login(webAuth: WebAuth, credentials: Credentials): Promise<void> {
  return new Promise((resolve, reject) => {
    webAuth.login({
      ...credentials,
      realm: 'Username-Password-Authentication',
      responseType: 'token'
    }, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

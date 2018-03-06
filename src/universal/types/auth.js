/**
 * Types related to authentication.
 *
 * @flow
 */

/**
 * An auth0 authentication response containing the id token and identity object.
 */
export type AuthResponse = {
  idToken: string,
  idTokenPayload: Object
};

/**
 * Email/password credentials.
 */
export type Credentials = {
  email: string,
  password: string
};

/**
 * An OIDC auth provider we use by way of auth0.
 */
export type ThirdPartyAuthProvider = {
  // The font awesome icon name for this auth provider, if any
  iconName?: string,
  // The human-facing display name of the auth provider
  displayName: string,
  // auth0's canonical connection name for this auth provider
  auth0Connection: string
};

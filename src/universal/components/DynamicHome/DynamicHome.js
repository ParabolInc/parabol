/**
 * Detects the user to their appropriate "home", depending on whether
 * they're authenticated or not.
 *
 * @flow
 */

import loginWithToken from 'universal/decorators/loginWithToken/loginWithToken';

export default loginWithToken(
  () => null
);

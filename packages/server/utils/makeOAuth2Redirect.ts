import makeAppURL from '../../client/utils/makeAppURL'
import appOrigin from '../appOrigin'
export const makeOAuth2Redirect = () => {
  // we do this as a convenience for PPMI setup.
  // If they don't include the env variable, we use the app instead
  return process.env.OAUTH2_REDIRECT || makeAppURL(appOrigin, 'auth/service')
}

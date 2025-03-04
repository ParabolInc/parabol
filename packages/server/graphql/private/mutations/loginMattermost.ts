import crypto from 'crypto'
import {createVerifier, httpbis} from 'http-message-signatures'
import AuthToken from '../../../database/types/AuthToken'
import getKysely from '../../../postgres/getKysely'
import encodeAuthToken from '../../../utils/encodeAuthToken'
import {MutationResolvers} from '../resolverTypes'

const checkDigestError = (body: string, digest: string) => {
  const [_, algorithm, receivedDigest] = digest.match(/(.*)=:(.*):/) ?? []
  if (algorithm?.toLowerCase() !== 'sha-256') {
    return 'Unsupported digest algorithm'
  }

  const hash = crypto.createHash('sha256')
  hash.update(body)
  const calculatedDigest = hash.digest('base64')

  if (receivedDigest !== calculatedDigest) {
    return 'Invalid digest'
  }
  return null
}

const loginMattermost: MutationResolvers['loginMattermost'] = async (
  _source,
  {request: rawRequest, body},
  {dataLoader}
) => {
  const [mattermostProvider] = await dataLoader
    .get('sharedIntegrationProviders')
    .load({service: 'mattermost', orgIds: [], teamIds: []})
  if (
    !mattermostProvider ||
    mattermostProvider.authStrategy !== 'sharedSecret' ||
    !mattermostProvider.sharedSecret
  ) {
    return {error: {message: 'Mattermost integration not found'}}
  }
  const {sharedSecret} = mattermostProvider

  const request = JSON.parse(rawRequest)
  const verified = await httpbis.verifyMessage(
    {
      async keyLookup(_: any) {
        // TODO When we support multiple Parabol - Mattermost connections, we should look up the key from IntegrationProvider
        // const keyId = params.keyid;
        return {
          id: '',
          algs: ['hmac-sha256'],
          verify: createVerifier(sharedSecret, 'hmac-sha256')
        }
      }
    },
    request
  )
  if (!verified) {
    return {error: {message: 'Invalid signature'}}
  }

  const digest = request['headers']?.['content-digest']
  if (!digest) {
    return {error: {message: 'Missing content-digest'}}
  }

  const digestError = checkDigestError(body, digest)
  if (digestError) {
    return {error: {message: digestError}}
  }

  const parsedBody = JSON.parse(body)
  const {email} = parsedBody
  if (!email) {
    return {error: {message: 'Missing email'}}
  }

  const pg = getKysely()
  const user = await pg.selectFrom('User').selectAll().where('email', '=', email).executeTakeFirst()
  if (!user) {
    return {error: {message: 'Unknown user'}}
  }
  const {id: userId, tms} = user
  const authToken = new AuthToken({sub: userId, tms})

  return {
    userId,
    authToken: encodeAuthToken(authToken),
    isNewUser: false
  }
}

export default loginMattermost

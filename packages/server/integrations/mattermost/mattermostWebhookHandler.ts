import crypto from 'crypto'
import {createVerifier, httpbis} from 'http-message-signatures'
import appOrigin from '../../appOrigin'
import AuthToken from '../../database/types/AuthToken'
import {getNewDataLoader} from '../../dataloader/getNewDataLoader'
import uWSAsyncHandler from '../../graphql/uWSAsyncHandler'
import parseBody from '../../parseBody'
import getKysely from '../../postgres/getKysely'
import encodeAuthToken from '../../utils/encodeAuthToken'

const checkDigestError = (body: string, digest?: string | null) => {
  if (!digest) {
    return 'Missing content-digest'
  }
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

/**
 * The client logs in with just their email address.
 * To ensure the request comes from a trusted Mattermost instance, we need to check that
 * - the content digest is correct
 * - the request is signed with the shared secret associated with the Mattermost integration
 * - we know the email
 */
const mattermostWebhookHandler = uWSAsyncHandler(async (res, req) => {
  const headers = {
    'content-type': req.getHeader('content-type'),
    'content-digest': req.getHeader('content-digest'),
    'content-length': req.getHeader('content-length'),
    signature: req.getHeader('signature'),
    'signature-input': req.getHeader('signature-input')
  }

  const request = {
    method: req.getMethod(),
    url: appOrigin + req.getUrl(),
    headers
  }

  const body = await parseBody<string>({
    res,
    parser: (buffer) => buffer.toString()
  })

  if (!body) {
    res.writeStatus('400').end('Bad Request')
    return
  }

  const digestError = checkDigestError(body, headers['content-digest'])
  if (digestError) {
    res.writeStatus('400').end(digestError)
    return
  }

  const dataLoader = getNewDataLoader()
  try {
    const [mattermostProvider] = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'mattermost', orgIds: [], teamIds: []})
    if (
      !mattermostProvider ||
      mattermostProvider.authStrategy !== 'sharedSecret' ||
      !mattermostProvider.sharedSecret
    ) {
      res.writeStatus('401').end('Mattermost integration not found')
      return
    }
    const {sharedSecret} = mattermostProvider

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
      res.writeStatus('401').end('Invalid signature')
      return
    }

    const parsedBody = JSON.parse(body)
    const {email} = parsedBody
    if (!email) {
      res.writeStatus('400').end('Missing email')
      return
    }

    const pg = getKysely()
    const user = await pg
      .selectFrom('User')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst()
    if (!user) {
      res.writeStatus('401').end('Unknown user')
      return
    }
    const {id: userId, tms} = user
    const authToken = encodeAuthToken(new AuthToken({sub: userId, tms}))
    res
      .writeStatus('200')
      .writeHeader('Content-Type', 'application/json')
      .end(JSON.stringify({authToken}))
  } finally {
    dataLoader.dispose()
  }
})

export default mattermostWebhookHandler

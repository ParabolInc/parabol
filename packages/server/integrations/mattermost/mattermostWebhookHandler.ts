import {createVerifier, httpbis} from 'http-message-signatures'
import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import appOrigin from '../../appOrigin'
import uWSAsyncHandler from '../../graphql/uWSAsyncHandler'
import parseBody from '../../parseBody'
import publishWebhookGQL from '../../utils/publishWebhookGQL'
import ConnectionContext from '../../socketHelpers/ConnectionContext'
import uwsGetIP from '../../utils/uwsGetIP'
import checkBlacklistJWT from '../../utils/checkBlacklistJWT'
import activeClients from '../../activeClients'
import handleConnect from '../../socketHandlers/handleConnect'
import getVerifiedAuthToken from '../../utils/getVerifiedAuthToken'
import encodeAuthToken from '../../utils/encodeAuthToken'
import {MMSocket} from '../../socketHelpers/transports/MMSocket'

const MATTERMOST_SECRET = process.env.MATTERMOST_SECRET


const login = async (email: string) => {
  const query = `
    mutation LoginMattermost($email: String!) {
      loginMattermost(email: $email) {
        error {
          message
        }
        authToken
      }
    }
  `

  const loginResult = await publishWebhookGQL<any>(query, {email})
  const {authToken} = loginResult?.data?.loginMattermost ?? {}
  return authToken as string
}

const mattermostWebhookHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  if (!MATTERMOST_SECRET) {
    res.writeStatus('404').end()
    return
  }

  const ip = uwsGetIP(res, req)
  const connectionId = req.getHeader('x-correlation-id')

  const headers = {
    'content-type': req.getHeader('content-type'),
    'content-digest': req.getHeader('content-digest'),
    'content-length': req.getHeader('content-length'),
    signature: req.getHeader('signature'),
    'signature-input': req.getHeader('signature-input')
  }

  const verified = await httpbis.verifyMessage(
    {
      async keyLookup(_: any) {
        // TODO When we support multiple Parabol - Mattermost connections, we should look up the key from IntegrationProvider
        // const keyId = params.keyid;
        return {
          id: '',
          algs: ['hmac-sha256'],
          verify: createVerifier(MATTERMOST_SECRET, 'hmac-sha256')
        }
      }
    },
    {
      method: req.getMethod(),
      url: appOrigin + req.getUrl(),
      headers
    }
  )
  if (!verified) {
    res.writeStatus('401').end()
    return
  }

  const body = await parseBody<{email: string}>({
    res
  })

  const {email} = body ?? {}
  if (!email) {
    res.writeStatus('401').end()
    return
  }

  const authToken = getVerifiedAuthToken(await login(email))

  const connectionContext = new ConnectionContext(new MMSocket(connectionId), authToken, ip)
  // TODO: Find a nicer solution to this. This is the easiest to multiplex the webhook in the MM-Plugin.
  // If we don't use the client provided connectionId, the plugin would need to keep state to correlate userIDs with connectionIds.
  // This might be superseeded once we establish the Parabol userId <-> Mattermost userId mapping on Parabol side.
  connectionContext.id = connectionId
  const {sub: userId, iat} = authToken
  const isBlacklistedJWT = await checkBlacklistJWT(userId, iat)
  if (isBlacklistedJWT) {
    return
  }

  activeClients.set(connectionContext)
  const nextAuthToken = await handleConnect(connectionContext)
 
  res
    .writeStatus('200')
    .writeHeader('Content-Type', 'application/json')
    .end(JSON.stringify({authToken: nextAuthToken ?? encodeAuthToken(authToken)}))
})

export default mattermostWebhookHandler

import {createVerifier, httpbis} from 'http-message-signatures'
import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import appOrigin from '../../appOrigin'
import AuthToken from '../../database/types/AuthToken'
import uWSAsyncHandler from '../../graphql/uWSAsyncHandler'
import parseBody from '../../parseBody'
import publishWebhookGQL from '../../utils/publishWebhookGQL'

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
  const {error, authToken} = loginResult?.data?.loginMattermost ?? {}
  return authToken
}

const mattermostWebhookHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  if (!MATTERMOST_SECRET) {
    res.writeStatus('404').end()
    return
  }
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

  const authToken = await login(email)
  res
    .writeStatus('200')
    .writeHeader('Content-Type', 'application/json')
    .end(JSON.stringify({authToken}))
})

export default mattermostWebhookHandler

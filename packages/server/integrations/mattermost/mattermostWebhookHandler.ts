import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import appOrigin from '../../appOrigin'
import uWSAsyncHandler from '../../graphql/uWSAsyncHandler'
import parseBody from '../../parseBody'
import {callGQL} from '../../utils/callGQL'
import sendToSentry from '../../utils/sendToSentry'

const login = async (variables: {request: string; body: string}) => {
  const query = `
    mutation LoginMattermost($request: String!, $body: String!) {
      loginMattermost(request: $request, body: $body) {
        error {
          message
        }
        authToken
      }
    }
  `

  const loginResult = await callGQL<{
    loginMattermost: {
      error: {message: string} | null
      authToken: string | null
    }
  }>(query, variables)
  return loginResult?.data?.loginMattermost ?? {authToken: null, error: {message: 'Unknown error'}}
}

const mattermostWebhookHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const headers = {
    'content-type': req.getHeader('content-type'),
    'content-digest': req.getHeader('content-digest'),
    'content-length': req.getHeader('content-length'),
    signature: req.getHeader('signature'),
    'signature-input': req.getHeader('signature-input')
  }

  const request = JSON.stringify({
    method: req.getMethod(),
    url: appOrigin + req.getUrl(),
    headers
  })

  const body = await parseBody<string>({
    res,
    parser: (buffer) => buffer.toString()
  })

  if (!body) {
    res.writeStatus('400').end('Bad Request')
    return
  }

  const {authToken, error} = await login({
    request,
    body
  })

  if (error) {
    sendToSentry(new Error(error.message))
    res.writeStatus('500').end(error.message)
    return
  }

  res
    .writeStatus('200')
    .writeHeader('Content-Type', 'application/json')
    .end(JSON.stringify({authToken}))
})

export default mattermostWebhookHandler

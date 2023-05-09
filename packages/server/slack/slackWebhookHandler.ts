import {createHmac} from 'crypto'
import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import parseBody from '../parseBody'
import publishWebhookGQL from '../utils/publishWebhookGQL'
import tsscmp from 'tsscmp'


const SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET!
const REQUEST_TIMESTAMP_MAX_DELTA_MIN = 5

const slackWebhookHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const requestTimestampSec = Number.parseInt(req.getHeader('x-slack-request-timestamp'))
  const signature = req.getHeader('x-slack-signature')
  if (Number.isNaN(requestTimestampSec)) {
    res.writeStatus('401').end()
    return
  }

  const parser = (buffer: Buffer) => buffer.toString()
  const body = (await parseBody({res, parser})) as string | null

  if (!body) {
    res.writeStatus('401').end()
    return
  }
  console.log('req', req, body)

  // Calculate time-dependent values
  const nowMs = Date.now()
  const fiveMinutesAgoSec = Math.floor(nowMs / 1000) - 60 * REQUEST_TIMESTAMP_MAX_DELTA_MIN

  // Rule 1: Check staleness
  if (requestTimestampSec < fiveMinutesAgoSec) {
    console.log(`Slack x-slack-request-timestamp must differ from system time by no more than ${REQUEST_TIMESTAMP_MAX_DELTA_MIN} minutes or request is stale`)
    res.writeStatus('401').end()
    return
  }

  // Rule 2: Check signature
  const [signatureVersion, signatureHash] = signature.split('=')
  if (signatureVersion !== 'v0') {
    console.log('Bad Slack signature version', signatureVersion)
    res.writeStatus('401').end()
    return
  }
  const hmac = createHmac('sha256', SIGNING_SECRET);
  hmac.update(`${signatureVersion}:${requestTimestampSec}:${body}`);
  const ourSignatureHash = hmac.digest('hex');
  if (!signatureHash || !tsscmp(signatureHash, ourSignatureHash)) {
    console.log('Slack signature mismatch')
    res.writeStatus('401').end()
    return
  }
 
  const message = JSON.parse(body)
  const {type} = message

  switch (type) {
    case 'url_verification':
      const {challenge} = message
      res.write(JSON.stringify({challenge}))
      res.writeStatus('200').end()
      return
    case 'event_callback':
      const {text} = message
      console.log('GEORG event', JSON.stringify(message, undefined, 2))
      res.writeStatus('501').end()
      return
  }
  console.log('GEORG type unknown', type)
  res.writeStatus('404').end()
})

export default slackWebhookHandler

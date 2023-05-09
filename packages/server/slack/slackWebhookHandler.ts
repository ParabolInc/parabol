import {createHmac} from 'crypto'
import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import parseBody from '../parseBody'
import publishWebhookGQL from '../utils/publishWebhookGQL'
import tsscmp from 'tsscmp'

const SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET!
const REQUEST_TIMESTAMP_MAX_DELTA_MIN = 5

type SlackEvent = {
  token: string
  team_id: string
  api_app_id: string
  event: {
    client_msg_id: string
    type: string
    text: string
    user: string
    ts: string
    blocks: any[]
    team: string
    channel: string
    event_ts: string
  }
  type: string
  event_id: string
  event_time: number
  authorizations: any[]
  is_ext_shared_channel: boolean
  event_context: string
}

const walkElements = <T>(elements: any[], callback: (element: any) => T): T[] => {
  return elements.flatMap((element) => {
    if (element.elements) {
      return walkElements(element.elements, callback)
    } else {
      return callback(element)
    }
  })
}

const getMentions = (blocks: {elements: any[]}[]) => {
  return walkElements(blocks, (element) => {
    return element.type === 'user' ? element.user_id : null
  }).filter((mention) => mention !== null)
}

const eventCallbackLookup = {
  // we could also listen for all messages, but let's not do this now
  // message: {
  app_mention: {
    getVars: ({event: {text, user, channel, blocks}}: SlackEvent) => {
      const mentions = getMentions(blocks)
      return {text, username: user, channel, mentions}
    },
    query: `
      mutation SlackMessage($text: String!, $username: String!, $channel: String!, $mentions: [String!]) {
        slackMessage(text: $text, username: $username, channel: $channel, mentions: $mentions)
      }
    `
  }
}

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
    console.log(
      `Slack x-slack-request-timestamp must differ from system time by no more than ${REQUEST_TIMESTAMP_MAX_DELTA_MIN} minutes or request is stale`
    )
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
  const hmac = createHmac('sha256', SIGNING_SECRET)
  hmac.update(`${signatureVersion}:${requestTimestampSec}:${body}`)
  const ourSignatureHash = hmac.digest('hex')
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
      const event = message as SlackEvent
      const actionHandler =
        eventCallbackLookup[event.event.type as keyof typeof eventCallbackLookup]
      if (actionHandler) {
        const {getVars, query} = actionHandler
        const variables = getVars(event)
        const result = await publishWebhookGQL(query, variables)
        if (result?.data) {
          res.writeStatus('200').end()
        } else {
          res.writeStatus('500').end()
        }
      } else {
        console.log('Slack unknown event_callback', JSON.stringify(message, undefined, 2))
        res.writeStatus('501').end()
      }
      return
  }
  console.log('Slack type unknown', type)
  res.writeStatus('404').end()
})

export default slackWebhookHandler

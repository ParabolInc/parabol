import {HttpResponse, HttpRequest} from 'uWebSockets.js'
import parseBody from '../parseBody'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'

import {WebClient} from '@slack/web-api'
import {createEventAdapter} from '@slack/events-api'

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET
const slackBotToken = process.env.SLACK_BOT_TOKEN

const slackEvents = createEventAdapter(slackSigningSecret!)
const webClient = new WebClient(slackBotToken)

slackEvents.on('app_mention', async (event) => {
  const {text, user, channel} = event

  const regex = /<@(\w+)\|?\w*> (\w+)/
  const match = text.match(regex)

  if (match) {
    const recipient = match[1]
    const emojiCode = match[2]

    // update the DB

    // Send a confirmation message to the channel
    await webClient.chat.postMessage({
      channel: channel,
      text: `Hey <@${user}>, I've added a *${emojiCode}* for <@${recipient}>!`
    })
  } else {
    // Send an error message if the command format is incorrect
    await webClient.chat.postMessage({
      channel: channel,
      text: `Hey <@${user}>, I couldn't understand your command. Please use the following format: "@emojibot @recipient emoji_code"`
    })
  }
})

export const slackBotWebhookHandler = uWSAsyncHandler(
  async (res: HttpResponse, req: HttpRequest) => {
    try {
      const parser = (buffer: Buffer) => buffer.toString()
      const bodyStr = (await parseBody({res, parser})) as string | null
      const body = JSON.parse(bodyStr!)

      const signature = req.getHeader('x-slack-signature') as string
      const timestamp = req.getHeader('x-slack-request-timestamp') as string

      // TODO: verify signature and handle the webhook event

      res.cork(() => {
        res.status(200).json({status: 'success'})
      })
    } catch (error: any) {
      res.cork(() => {
        res.status(500).json({status: 'failure', error: error.message})
      })
    }
  }
)

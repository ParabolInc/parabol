import fetch from 'node-fetch'
import {stringify} from 'querystring'
import SlackManager from '../../client/utils/SlackManager'
import makeAppLink from './makeAppLink'

interface IncomingWebhook {
  url: string
  channel: string
  channel_id: string
  configuration_url: string
}

interface OAuth2Response {
  ok: boolean
  access_token: string
  error?: any
  scope: string
  team_id: string
  team_name: string
  user_id: string
  incoming_webhook: IncomingWebhook
  bot: {
    bot_user_id: string
    bot_access_token: string
  }
}

class SlackServerManager extends SlackManager {
  static async init(code: string) {
    return SlackServerManager.fetchToken(code)
  }

  static async fetchToken(code: string) {
    const queryParams = {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code,
      redirect_uri: makeAppLink('auth/slack')
    }

    const uri = `https://slack.com/api/oauth.access?${stringify(queryParams)}`

    const tokenRes = await fetch(uri, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    const tokenJson = (await tokenRes.json()) as OAuth2Response
    const {error} = tokenJson

    if (error) {
      throw new Error(`Slack: ${error}`)
    }
    return new SlackServerManager(tokenJson.bot.bot_access_token, tokenJson) as Required<
      SlackServerManager
    >
  }

  constructor(botAccessToken, public response?: OAuth2Response) {
    super(botAccessToken, {fetch})
  }
}

export default SlackServerManager

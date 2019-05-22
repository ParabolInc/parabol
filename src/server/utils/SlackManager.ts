import fetch from 'node-fetch'
import {stringify} from 'querystring'
import {SLACK_SCOPE} from 'universal/utils/constants'
import SlackClientManager from 'universal/utils/SlackClientManager'
import makeAppLink from 'server/utils/makeAppLink'

interface IncomingWebhook {
  url: string
  channel: string
  configuration_url: string
}

interface OAuth2Response {
  access_token: string
  error: any
  scope: string
  team_id: string
  team_name: string
  incoming_webhook: IncomingWebhook
  bot?: {
    bot_user_id: string
    bot_access_token: string
  }
}

interface Options {
  teamId?: string
  webhook?: IncomingWebhook
}

class SlackManager extends SlackClientManager {
  static async init (code: string) {
    return SlackManager.fetchToken(code)
  }

  static async fetchToken (code: string) {
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
    const {access_token: accessToken, error, scope, team_id, incoming_webhook} = tokenJson

    if (error) {
      throw new Error(`Slack: ${error}`)
    }
    const providedScope = scope.split(',')
    const matchingScope =
      new Set([...SLACK_SCOPE.split(','), ...providedScope]).size === providedScope.length
    if (!matchingScope) {
      throw new Error(`Slack Bad scope: ${scope}`)
    }
    return new SlackManager(accessToken, {teamId: team_id, webhook: incoming_webhook})
  }

  teamId?: string
  webhook?: IncomingWebhook

  constructor (accessToken: string, {teamId, webhook}: Options = {}) {
    super(accessToken, {fetch})
    this.teamId = teamId
    this.webhook = webhook
  }
}

export default SlackManager

import OAuth from 'oauth-1.0a'
import crypto from 'crypto'
import appOrigin from '../../appOrigin'

export default class JiraServerOAuth1Manager {
  serverBaseUrl: string
  oauth: OAuth

  constructor(serverBaseUrl: string, consumerKey: string, consumerSecret: string) {
    this.serverBaseUrl = serverBaseUrl
    this.oauth = new OAuth({
      consumer: {
        key: consumerKey,
        secret: consumerSecret
      },
      signature_method: 'RSA-SHA1',
      // bind consumerSecret instead of using key parameter because it gets URL formatted which breaks the private key
      hash_function: (baseString) =>
        crypto.createSign('RSA-SHA1').update(baseString).sign(consumerSecret).toString('base64')
    })
  }

  async requestToken(): Promise<Error | string> {
    const requestTokenUrl = `${this.serverBaseUrl}/plugins/servlet/oauth/request-token`
    const callbackUrl = `${appOrigin}/auth/jiraServer`

    const request = {
      url: requestTokenUrl,
      method: 'POST'
    }
    const auth: any = {
      oauth_consumer_key: this.oauth.consumer.key,
      oauth_nonce: this.oauth.getNonce(),
      oauth_signature_method: 'RSA-SHA1',
      oauth_timestamp: this.oauth.getTimeStamp(),
      oauth_version: this.oauth.version,
      oauth_callback: callbackUrl
    }
    auth.oauth_signature = this.oauth.getSignature(request, undefined, auth)

    const response = await fetch(request.url, {
      method: request.method,
      headers: {
        ...this.oauth.toHeader(auth)
      }
    })
    if (response.status !== 200) {
      return new Error(`Requesting OAuth1 request token failed with status ${response.status}`)
    }

    const body = await response.text()
    const data = new URLSearchParams(body)

    const oauthCallbackConfirmed = data.get('oauth_callback_confirmed')
    const oauthToken = data.get('oauth_token')
    if (oauthCallbackConfirmed !== 'true' || !oauthToken) {
      return new Error(`Returned OAuth1 request token content is invalid`)
    }

    const accessTokenUrl = `${this.serverBaseUrl}/plugins/servlet/oauth/authorize?oauth_token=${oauthToken}`

    return accessTokenUrl
  }
}

import crypto from 'crypto'
import OAuth from 'oauth-1.0a'
import appOrigin from '../../appOrigin'

export interface OAuth1Auth {
  accessToken: string
  accessTokenSecret: string
}
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
    const requestTokenUrl = new URL('/plugins/servlet/oauth/request-token', this.serverBaseUrl)
    const callbackUrl = new URL('/auth/jiraServer', appOrigin)

    const request = {
      url: requestTokenUrl.toString(),
      method: 'POST'
    }
    const auth: any = {
      oauth_consumer_key: this.oauth.consumer.key,
      oauth_nonce: this.oauth.getNonce(),
      oauth_signature_method: 'RSA-SHA1',
      oauth_timestamp: this.oauth.getTimeStamp(),
      oauth_version: this.oauth.version,
      oauth_callback: callbackUrl.toString()
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

  async accessToken(temporaryToken: string, oauthVerifier: string): Promise<Error | OAuth1Auth> {
    const accessTokenUrl = new URL('/plugins/servlet/oauth/access-token', this.serverBaseUrl)

    const request = {
      url: accessTokenUrl.toString(),
      method: 'POST'
    }
    const auth: any = {
      oauth_consumer_key: this.oauth.consumer.key,
      oauth_nonce: this.oauth.getNonce(),
      oauth_signature_method: 'RSA-SHA1',
      oauth_timestamp: this.oauth.getTimeStamp(),
      oauth_version: this.oauth.version,
      oauth_token: temporaryToken,
      oauth_verifier: oauthVerifier
    }
    auth.oauth_signature = this.oauth.getSignature(request, undefined, auth)

    const response = await fetch(request.url, {
      method: request.method,
      headers: {
        ...this.oauth.toHeader(auth)
      }
    })
    if (response.status !== 200) {
      return new Error(`Requesting OAuth1 access token failed with status ${response.status}`)
    }

    const body = await response.text()
    const data = new URLSearchParams(body)

    const accessToken = data.get('oauth_token')
    const accessTokenSecret = data.get('oauth_token_secret')

    if (!accessToken || !accessTokenSecret) {
      return new Error('OAuth1 access token was missing in the reply')
    }

    return {
      accessToken,
      accessTokenSecret
    }
  }
}

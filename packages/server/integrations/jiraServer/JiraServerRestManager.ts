import OAuth from 'oauth-1.0a'
import crypto from 'crypto'

export default class JiraServerOAuth1Manager {
  serverBaseUrl: string
  oauth: OAuth
  token: OAuth.Token

  constructor(
    serverBaseUrl: string,
    consumerKey: string,
    consumerSecret: string,
    oauthToken: string,
    oauthTokenSecret: string
  ) {
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
    this.token = {
      key: oauthToken,
      secret: oauthTokenSecret
    }
  }

  async request(method: string, path: string) {
    const url = new URL(path, this.serverBaseUrl)
    const request = {
      url: url.toString(),
      method
    }
    const auth = this.oauth.authorize(request, this.token)
    const response = await fetch(request.url, {
      method: request.method,
      headers: {
        ...this.oauth.toHeader(auth)
      }
    })
    return response
  }

  async getProjects() {
    return this.request('GET', '/rest/api/latest/project')
  }
}

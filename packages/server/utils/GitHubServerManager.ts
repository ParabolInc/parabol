import fetch from 'node-fetch'
import GitHubManager from 'parabol-client/utils/GitHubManager'
import {stringify} from 'querystring'

interface OAuth2Response {
  access_token: string
  error: any
  scope: string
}

class GitHubServerManager extends GitHubManager {
  static async init(code: string) {
    return GitHubServerManager.fetchToken(code)
  }

  static async fetchToken(code: string) {
    const queryParams = {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }

    const uri = `https://github.com/login/oauth/access_token?${stringify(queryParams)}`

    const tokenRes = await fetch(uri, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    const tokenJson = (await tokenRes.json()) as OAuth2Response
    const {access_token: accessToken, error, scope} = tokenJson
    if (error) {
      throw new Error(`GitHub: ${error}`)
    }
    const providedScope = scope.split(',')
    const matchingScope =
      new Set([...GitHubServerManager.SCOPE.split(','), ...providedScope]).size ===
      providedScope.length
    if (!matchingScope) {
      throw new Error(`GitHub Bad scope: ${scope}`)
    }
    return new GitHubServerManager(accessToken)
  }

  constructor(accessToken: string) {
    super(accessToken, {fetch})
  }
}

export default GitHubServerManager

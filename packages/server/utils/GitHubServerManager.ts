import fetch from 'node-fetch'
import GitHubManager from 'parabol-client/utils/GitHubManager'
import {stringify} from 'querystring'
import {getRepositories} from './githubQueries/getRepositories'
import {GetRepositoriesQuery} from '../../client/types/typed-document-nodes'

interface OAuth2Response {
  access_token: string
  error: any
  scope: string
}

type JSONResponse<T> = {
  data?: T
  errors?: Error[]
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
  fetch = fetch
  constructor(accessToken: string) {
    super(accessToken)
  }
  async getRepositories(): Promise<JSONResponse<GetRepositoriesQuery>> {
    const body = JSON.stringify({query: getRepositories, variables: {}})
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: this.headers,
      body
    })
    return await res.json()
  }
}

export default GitHubServerManager

import fetch from 'node-fetch'
import {stringify} from 'querystring'
import {Providers} from '../../client/types/constEnums'
import {FirstParam} from '../../client/types/generics'
import {getSdk, Sdk} from '../types/githubTypes'
interface OAuth2Response {
  access_token: string
  error: any
  scope: string
}

interface GQLGitHubError {
  message: string
  path: [string]
  extensions: {
    [key: string]: any
  }
  locations: [
    {
      line: number
      column: number
    }
  ]
}

interface GQLGitHubSuccess<TData> {
  data: TData
}

interface GQLGitHubFailure<TData> {
  data: TData | null
  errors: GQLGitHubError[]
}

// export type GQLResponse<TData> =

const MAX_REQUEST_TIME = 5000

export const gql = (str: ReadonlyArray<string>) => str[0]

// response if the credential is invalid https://docs.github.com/en/developers/apps/authenticating-with-github-apps#authenticating-as-a-github-app
interface GitHubCredentialError {
  message: string
  documentation_url: string
}
type GitHubResponse<TData> =
  | GQLGitHubSuccess<TData>
  | GQLGitHubFailure<TData>
  | GitHubCredentialError

type Operations = {
  [Op in keyof Sdk]: undefined extends FirstParam<Sdk[Op]>
  ? (variables?: FirstParam<Sdk[Op]>) => ReturnType<Sdk[Op]> | Error
  : (variables: FirstParam<Sdk[Op]>) => ReturnType<Sdk[Op]> | Error
}

// Fix for TS2420 when what you really want to do is write GitHubServerManager implements Operations
// https://dev.to/raspberrytyler/using-a-typescript-interface-to-define-model-properties-in-objection-js-1231
interface GitHubServerManager extends Operations { }

class GitHubServerManager implements Operations {
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
    return {manager: new GitHubServerManager(accessToken), scope}
  }
  static SCOPE = Providers.GITHUB_SCOPE
  accessToken: string
  protected headers = {
    Authorization: '',
    Accept: 'application/json' as const,
    'Content-Type': 'application/json' as const
  }
  protected readonly fetchWithTimeout = async (url: string, options: RequestInit) => {
    const controller = new AbortController()
    const {signal} = controller
    const timeout = setTimeout(() => {
      controller.abort()
    }, MAX_REQUEST_TIME)
    try {
      const res = await this.fetch(url, {...options, signal})
      clearTimeout(timeout)
      return res
    } catch (e) {
      clearTimeout(timeout)
      return new Error('GitHub is down')
    }
  }

  protected request = async <T>(query: T, variables?: Record<string, any>) => {
    const res = await this.fetchWithTimeout('https://api.github.com/graphql', {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({query, variables})
    })
    if (res instanceof Error) {
      return res
    }
    const json = (await res.json()) as GitHubResponse<T>
    if ('message' in json) {
      return new Error(json.message)
    }
    if (!('errors' in json)) return json.data
    return new Error(json.errors[0].message)
  }
  fetch = fetch as any
  sdk = getSdk(this as any, (action) => action(this.headers))
  constructor(accessToken: string) {
    this.accessToken = accessToken
    this.headers.Authorization = `Bearer ${accessToken}`
    Object.keys(this.sdk).forEach((key) => {
      this[key] = (...args: any[]) => this.sdk[key](...args)
    })
  }
}

export default GitHubServerManager

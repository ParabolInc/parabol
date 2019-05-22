import {DocumentNode} from 'graphql-typed'
import {IGraphQLResponseError} from 'universal/types/graphql'
import getProfile from './githubQueries/getProfile.graphql'

interface SlackClientManagerOptions {
  fetch?: Window['fetch']
}

export interface GQLResponse<TData> {
  data?: TData
  errors?: Array<IGraphQLResponseError>
}

export interface SlackCredentialError {
  message: string
  documentation_url: string
}

type SlackResponse<TData> = GQLResponse<TData> | SlackCredentialError

type DocResponse<T> = T extends DocumentNode<infer R> ? R : never
type DocVariables<T> = T extends DocumentNode<any, infer V> ? V : never

class SlackClientManager {
  accessToken: string
  fetch: typeof fetch
  // the any is for node until we can use tsc in nodeland
  cache: {[key: string]: {result: any; expiration: number | any}} = {}
  timeout = 5000
  headers: any
  constructor (accessToken: string, options: SlackClientManagerOptions = {}) {
    this.accessToken = accessToken
    this.fetch = options.fetch || window.fetch
    this.headers = {
      'Content-Type': 'application/json',
      // an Authorization requires a preflight request, ie reqs are slow
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json' as 'application/json'
    }
  }

  private async post<T> (body: string): Promise<SlackResponse<T>> {
    const res = await this.fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: this.headers,
      body
    })
    return res.json()
  }

  private async query<T> (
    query: T,
    variables?: DocVariables<T>
  ): Promise<SlackResponse<DocResponse<T>>> {
    // const query = _query as unknown as string
    const body = JSON.stringify({query, variables})
    const record = this.cache[body]
    if (!record) {
      const result = await this.post(body)
      this.cache[body] = {
        result,
        expiration: setTimeout(() => {
          delete this.cache[body]
        }, this.timeout)
      }
    } else {
      clearTimeout(record.expiration)
      record.expiration = setTimeout(() => {
        delete this.cache[body]
      }, this.timeout)
    }
    return this.cache[body].result
  }

  private async mutate<T> (
    query: T,
    variables?: DocVariables<T>
  ): Promise<SlackResponse<DocResponse<T>>> {
    const body = JSON.stringify({query, variables})
    return this.post(body)
  }

  async getProfile () {
    return this.query(getProfile)
  }
}

export default SlackClientManager

import {DocumentNode} from 'graphql-typed'
import {ICreateIssueInput} from 'universal/types/githubGraphql'
import {IGraphQLResponseError} from 'universal/types/graphql'
import createIssue from './githubQueries/createIssue.graphql.d'
import getRepoInfo from './githubQueries/getRepoInfo.graphql.d'
import getProfile from './githubQueries/getProfile.graphql.d'
import getRepos from './githubQueries/getRepos.graphql.d'
import Atmosphere from 'universal/Atmosphere'
import {MenuMutationProps} from 'universal/hooks/useMutationProps'
import getOAuthPopupFeatures from 'universal/utils/getOAuthPopupFeatures'
import AddGitHubAuthMutation from 'universal/mutations/AddGitHubAuthMutation'

interface GitHubClientManagerOptions {
  fetch?: Window['fetch']
}

export interface GQLResponse<TData> {
  data?: TData
  errors?: Array<IGraphQLResponseError>
}

export interface GitHubCredentialError {
  message: string
  documentation_url: string
}

type GitHubResponse<TData> = GQLResponse<TData> | GitHubCredentialError

type DocResponse<T> = T extends DocumentNode<infer R> ? R : never
type DocVariables<T> = T extends DocumentNode<any, infer V> ? V : never

class GitHubClientManager {
  static SCOPE = 'admin:org_hook,read:org,repo,user:email,write:repo_hook'
  static openOAuth (atmosphere: Atmosphere, teamId: string, mutationProps: MenuMutationProps) {
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const providerState = Math.random()
      .toString(36)
      .substring(5)
    const uri = `https://github.com/login/oauth/authorize?client_id=${
      window.__ACTION__.github
    }&scope=${GitHubClientManager.SCOPE}&state=${providerState}`

    const popup = window.open(
      uri,
      'OAuth',
      getOAuthPopupFeatures({width: 500, height: 750, top: 56})
    )
    const handler = (event) => {
      if (typeof event.data !== 'object' || event.origin !== window.location.origin || submitting) {
        return
      }
      const {code, state} = event.data
      if (state !== providerState || typeof code !== 'string') return
      submitMutation()
      AddGitHubAuthMutation(atmosphere, {code, teamId}, {onError, onCompleted})
      popup && popup.close()
      window.removeEventListener('message', handler)
    }
    window.addEventListener('message', handler)
  }

  accessToken: string
  fetch: typeof fetch
  // the any is for node until we can use tsc in nodeland
  cache: {[key: string]: {result: any; expiration: number | any}} = {}
  timeout = 5000
  headers: any
  constructor (accessToken: string, options: GitHubClientManagerOptions = {}) {
    this.accessToken = accessToken
    this.fetch = options.fetch || window.fetch
    this.headers = {
      'Content-Type': 'application/json',
      // an Authorization requires a preflight request, ie reqs are slow
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json' as 'application/json'
    }
  }

  private async post<T> (body: string): Promise<GitHubResponse<T>> {
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
  ): Promise<GitHubResponse<DocResponse<T>>> {
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
  ): Promise<GitHubResponse<DocResponse<T>>> {
    const body = JSON.stringify({query, variables})
    return this.post(body)
  }

  async getRepos () {
    return this.query(getRepos)
  }

  async getRepoInfo (nameWithOwner: string, assigneeLogin: string) {
    const [repoOwner, repoName] = nameWithOwner.split('/')
    return this.query(getRepoInfo, {repoName, repoOwner, assigneeLogin})
  }

  async getProfile () {
    return this.query(getProfile)
  }

  async createIssue (createIssueInput: ICreateIssueInput) {
    return this.mutate(createIssue, {input: createIssueInput})
  }
}

export default GitHubClientManager

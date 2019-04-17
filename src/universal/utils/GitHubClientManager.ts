interface GitHubClientManagerOptions {
  fetch?: Window['fetch']
}

const getReposQuery = `
query getRepos {
  viewer {
    organizations(first: 100) {
      nodes {
        repositories(first: 100, isLocked: false, orderBy: {field: UPDATED_AT, direction: DESC}) {
          ...repoFrag
        }
      }
    }
    repositories(first: 100, isLocked: false, orderBy: {field: UPDATED_AT, direction: DESC}) {
      ...repoFrag
    }
  }
}

fragment repoFrag on RepositoryConnection {
  nodes {
    nameWithOwner
    updatedAt
    viewerCanAdminister
  }
}
`

class GitHubClientManager {
  accessToken: string
  private readonly query: (query: string) => any
  // private readonly mutation: (query: string, payload: object) => any

  // the any is for node until we can use tsc in nodeland
  cache: {[key: string]: {result: any; expiration: number | any}} = {}
  timeout = 5000

  constructor (accessToken: string, options: GitHubClientManagerOptions = {}) {
    this.accessToken = accessToken
    const fetch = options.fetch || window.fetch
    const headers = {
      'Content-Type': 'application/json',
      // an Authorization requires a preflight request, ie reqs are slow
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json' as 'application/json'
    }

    this.query = async (query) => {
      const record = this.cache[query]
      if (!record) {
        const res = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers,
          body: JSON.stringify({query})
        })
        const result = await res.json()
        this.cache[query] = {
          result,
          expiration: setTimeout(() => {
            delete this.cache[query]
          }, this.timeout)
        }
      } else {
        clearTimeout(record.expiration)
        record.expiration = setTimeout(() => {
          delete this.cache[query]
        }, this.timeout)
      }
      return this.cache[query].result
    }
  }

  async getRepos () {
    return this.query(getReposQuery)
  }
}

export default GitHubClientManager

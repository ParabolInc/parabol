import {GitHubExecutionResult} from './getRequestDataLoader'

const transformGitHubResponse = (response: GitHubExecutionResult, prefix: string) => {
  const prefixGitHub = (name: string) => `${prefix}${name}`
  const transformObject = (parent: Record<string, any>) => {
    Object.keys(parent).forEach((key) => {
      const val = parent[key]
      if (key === '__typename') {
        parent[key] = prefixGitHub(val as string)
      } else if (Array.isArray(val)) {
        val.forEach((child) => {
          transformObject(child)
        })
      } else if (typeof val === 'object' && val !== null) {
        transformObject(val)
      }
    })
  }
  transformObject(response)
}

export default transformGitHubResponse

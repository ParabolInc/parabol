import fetch from 'node-fetch'
import GitHubClientManager from 'universal/utils/GitHubClientManager'

class GitHubManager extends GitHubClientManager {
  constructor (accessToken: string) {
    super(accessToken, {fetch})
  }
}

export default GitHubManager

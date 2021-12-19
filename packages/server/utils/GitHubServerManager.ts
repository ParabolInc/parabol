import {authorizeOAuth2} from '../integrations/helpers/authorizeOAuth2'

class GitHubServerManager {
  static async init(code: string) {
    const queryParams = {
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      code
    }

    const authUrl = `https://github.com/login/oauth/access_token`
    return authorizeOAuth2({authUrl, queryParams})
  }
}

export default GitHubServerManager

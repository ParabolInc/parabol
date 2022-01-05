import {authorizeOAuth2} from '../integrations/helpers/authorizeOAuth2'

class GitHubServerManager {
  static async init(code: string) {
    const searchParams = {
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      code
    }

    const authUrl = `https://github.com/login/oauth/access_token`
    return authorizeOAuth2<{accessToken: string; refreshToken: string; scopes: string}>({
      authUrl,
      searchParams
    })
  }
}

export default GitHubServerManager

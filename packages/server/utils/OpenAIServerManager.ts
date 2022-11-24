import fetch from 'node-fetch'
import {Configuration, OpenAIApi} from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_API_KEY
})
const openai = new OpenAIApi(configuration)

class OpenAIServerManager {
  fetch = fetch as any
  static async init(code: string) {
    return OpenAIServerManager.fetchToken()
  }

  // static async refresh(refreshToken: string) {
  //   return OpenAIServerManager.fetchToken({
  //     grant_type: 'refresh_token',
  //     refresh_token: refreshToken
  //   })
  // }

  private static async fetchToken() {
    // partialQueryParams: OAuth2AuthorizationParams | OAuth2RefreshAuthorizationParams
    // const body = {
    //   ...partialQueryParams,
    //   client_id: process.env.ATLASSIAN_CLIENT_ID!,
    //   client_secret: process.env.ATLASSIAN_CLIENT_SECRET!
    // }

    // const authUrl = `https://auth.atlassian.com/oauth/token`
    // return authorizeOAuth2({authUrl, body})

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    })
    return new OpenAIApi(configuration)
  }

  async getSummary(text: string) {
    const response = await openai.createCompletion({
      model: 'text-davinci-002',
      prompt: text,
      temperature: 0.7,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    })
    console.log('🚀 ~ response -->', response.data.choices)

    return response.data.choices[0].text
  }

  // constructor(accessToken: string) {
  //   super(accessToken)
  // }

  constructor() {}
}

export default OpenAIServerManager

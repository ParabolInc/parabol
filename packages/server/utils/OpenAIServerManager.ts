import {Configuration, OpenAIApi} from 'openai'
import sendToSentry from './sendToSentry'

class OpenAIServerManager {
  private openAIApi: OpenAIApi | null

  constructor() {
    if (!process.env.OPEN_AI_API_KEY) {
      this.openAIApi = null
      return
    }
    const configuration = new Configuration({
      apiKey: process.env.OPEN_AI_API_KEY,
      organization: process.env.OPEN_AI_ORG_ID
    })
    this.openAIApi = new OpenAIApi(configuration)
  }

  async getSummary(text: string | string[]) {
    if (!this.openAIApi) return null

    try {
      const response = await this.openAIApi.createCompletion({
        model: 'text-davinci-003',
        prompt: `Below is a comma separated list of text. Summarise the text for a second-grade student in one or two sentences.

        Text: """
        ${text}
        """`,
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
      return (response.data.choices[0]?.text as string) ?? null
    } catch (e) {
      const error = e instanceof Error ? e : new Error('OpenAI failed to getSummary')
      sendToSentry(error)
      return null
    }
  }
}

export default OpenAIServerManager

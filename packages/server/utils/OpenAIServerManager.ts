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

  async getSummary(text: string | string[], summaryLocation?: 'discussion thread') {
    if (!this.openAIApi) return null
    try {
      const location = summaryLocation ?? 'retro meeting'
      const prompt = `Below is a comma-separated list of text from a ${location}.
      Summarize the text for a second-grade student in one or two sentences.
      If you can't provide a summary, simply say the word "No".

      Text: """
      ${text}
      """`
      const response = await this.openAIApi.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
      const answer = (response.data.choices[0]?.message?.content?.trim() as string) ?? null
      return /^No\.*$/i.test(answer) ? null : answer
    } catch (e) {
      const error = e instanceof Error ? e : new Error('OpenAI failed to getSummary')
      sendToSentry(error)
      return null
    }
  }
}

export default OpenAIServerManager

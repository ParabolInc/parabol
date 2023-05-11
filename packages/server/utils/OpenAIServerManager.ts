import {Configuration, OpenAIApi} from 'openai'
import sendToSentry from './sendToSentry'
import {ModifyType} from '../graphql/public/resolverTypes'

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
      const response = await this.openAIApi.createCompletion({
        model: 'text-davinci-003',
        prompt: `Below is a comma-separated list of text from a ${location}. Summarize the text for a second-grade student in one or two sentences.

        Text: """
        ${text}
        """`,
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
      return (response.data.choices[0]?.text?.trim() as string) ?? null
    } catch (e) {
      const error = e instanceof Error ? e : new Error('OpenAI failed to getSummary')
      sendToSentry(error)
      return null
    }
  }

  async modifyCheckInQuestion(question: string, modifyType: ModifyType) {
    if (!this.openAIApi) return null

    const prompt: Record<ModifyType, string> = {
      CORPORATE: `Below is a ice breaker question from a team retrospective meeting. Modify the check-in question to use more corporate language. Respond with just a plain content of modified question.

      Ice breaker question: """
      ${question}
      """`,
      CRAZY: `Below is a ice breaker question from a team retrospective meeting. Modify the check-in question to be more absurd, abstract, thought provoking and engaging. Respond with just a plain content of modified question.

      Ice breaker question: """
      ${question}
      """`,
      FUNNY: `Below is a ice breaker question from a team retrospective meeting. Modify the check-in question to be more funny and engaging. Respond with just a plain content of modified question.

      Ice breaker question: """
      ${question}
      """`,
      SERIOUS: `Below is a ice breaker question from a team retrospective meeting. Modify the check-in question to be more serious. Respond with just a content of modified question.

      Ice breaker question: """
      ${question}
      """`
    }

    try {
      const response = await this.openAIApi.createCompletion({
        model: 'text-davinci-003',
        prompt: prompt[modifyType],
        temperature: 0.8,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
      return (response.data.choices[0]?.text?.trim() as string).replaceAll(`"`, '') ?? null
    } catch (e) {
      const error = e instanceof Error ? e : new Error('OpenAI failed to modifyCheckInQuestion')
      sendToSentry(error)
      return null
    }
  }
}

export default OpenAIServerManager

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
      const response = await this.openAIApi.createCompletion({
        model: 'text-davinci-003',
        prompt: `Below is a comma-separated list of text from a ${location}. Summarize the text for a second-grade student in one or two sentences.

        Text: """
        ${text}
        """`,
        temperature: 0.7,
        max_tokens: 80,
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

  // async groupReflections(reflections: {id: string; content: string}[]) {
  async groupReflections(text: string[]) {
    if (!this.openAIApi) return null
    try {
      const response = await this.openAIApi.createChatCompletion(
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: `You are given a list of reflections from a meeting, separated by commas. Your task is to group these reflections into similar topics and return an array of JavaScript objects, where each object represents a topic and contains an array of reflections that belong to that topic.
              Don't change the input text at all, even if it's spelt incorrectly.

      Example Input:
      ['The retreat went well', 'The project might not be ready in time', 'The deadline is really tight', 'I liked that the length of the retreat', 'I enjoyed the hotel', 'Feeling overworked']

      Example Output:
      [
        {
          "The Retreat": [
            "The retreat went well",
            "I liked that the length of the retreat",
            "I enjoyed the hotel"
          ]
        },
        {
          "Deadlines": [
            "Feeling overworked",
            "The project might not be ready in time",
            "The deadline is really tight"
          ]
        }
      ]

      In the output, "The Retreat" and "Deadlines" are example topic names that you can create to group the reflections.

      Here is the list of reflections: """
      ${text}
      """
      `
            }
          ],
          temperature: 0.7,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        },
        {
          timeout: 60000
        }
      )
      const answer = (response.data.choices[0]?.message?.content?.trim() as string) ?? null
      const nullableAnswer = /^No\.*$/i.test(answer) ? null : answer
      if (!nullableAnswer) return null
      return nullableAnswer
    } catch (e) {
      const error = e instanceof Error ? e : new Error('OpenAI failed to getSummary')
      sendToSentry(error)
      return null
    }
  }
}

export default OpenAIServerManager

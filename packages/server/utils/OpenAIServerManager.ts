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

  async generateThemes(reflectionsText: string[]) {
    if (!this.openAIApi) return null
    const suggestedThemeCountMin = Math.floor(reflectionsText.length / 5)
    const suggestedThemeCountMax = Math.floor(reflectionsText.length / 4)
    const prompt = `Create a short list of common themes given the following reflections: ${reflectionsText.join(
      ', '
    )}. Each theme should be no longer than a few words. There should be roughly ${suggestedThemeCountMin} or ${suggestedThemeCountMax} themes. Return the themes as a comma-separated list.`

    try {
      const response = await this.openAIApi.createChatCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
      const themes = (response.data.choices[0]?.message?.content?.trim() as string) ?? null
      return themes.split(', ')
    } catch (e) {
      const error = e instanceof Error ? e : new Error('OpenAI failed to generate themes')
      console.error(error.message)
      sendToSentry(error)
      return null
    }
  }

  async groupReflections(reflectionsText: string[], themes: string[]) {
    if (!this.openAIApi) return null

    const getThemeForReflection = async (
      reflection: string,
      retry = false
    ): Promise<string | null> => {
      const prompt = `Given the themes ${themes.join(
        ', '
      )}, and the following reflection: "${reflection}", classify the reflection into the theme it fits in best. The reflection can only be added to one theme. Do not edit the reflection text. Your output should just be the theme name, and must be one of the themes I've provided.`

      const response = await this.openAIApi!.createChatCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })

      const theme = (response.data.choices[0]?.message?.content?.trim() as string) ?? null
      if (!theme || !themes.includes(theme)) {
        if (!retry) {
          return getThemeForReflection(reflection, true)
        } else {
          sendToSentry(
            new Error(
              `Couldn't find a suitable theme for reflection: "${reflection}" from the following themes: ${themes.join(
                ', '
              )}`
            )
          )
          return null
        }
      }
      return theme
    }

    const promises = reflectionsText.map((reflection) => getThemeForReflection(reflection))
    const themesByReflections = await Promise.all(promises)

    const groupedReflections = themes.reduce<{[key: string]: string[]}>((acc, theme) => {
      acc[theme] = []
      return acc
    }, {})

    themesByReflections.forEach((theme, index) => {
      const reflection = reflectionsText[index]
      if (theme && reflection) {
        groupedReflections[theme]?.push(reflection)
      }
    })

    return groupedReflections
  }
}

export default OpenAIServerManager

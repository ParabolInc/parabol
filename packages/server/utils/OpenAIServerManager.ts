import {Configuration, OpenAIApi} from 'openai'
import sendToSentry from './sendToSentry'
import {isValidJSON} from './isValidJSON'
import {estimateTokens} from './estimateTokens'
import {AVG_CHARS_PER_TOKEN, MAX_GPT_3_5_TOKENS} from '../../client/utils/constants'
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
    console.log('🚀 ~ suggestedThemeCount:', suggestedThemeCountMin, suggestedThemeCountMax)
    const prompt = `Create a short list of common themes given the following reflections: ${reflectionsText.join(
      ', '
    )}. Each theme should be no longer than a few words. There should be roughly ${suggestedThemeCountMin} or ${suggestedThemeCountMax} themes. Return the themes as a comma-separated list.`

    try {
      const response = await this.openAIApi.createChatCompletion(
        {
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
        },
        {
          timeout: 60000
        }
      )
      const themes = (response.data.choices[0]?.message?.content?.trim() as string) ?? null
      return themes.split(', ') // we expect the model to return themes as comma-separated values
    } catch (e) {
      const error = e instanceof Error ? e : new Error('OpenAI failed to generate themes')
      console.error(error.message)
      sendToSentry(error)
      return null
    }
  }

  // setting the minimal max_tokens limit increases the speed of the request and reduces the tokens used
  estimateOutputTokens(reflectionsText: string[]) {
    const avgGroupNameLength = 10 // assume an average group name length of 10 tokens
    const totalLengthInTokens = reflectionsText.reduce(
      (total, reflectionText) => total + Math.ceil(reflectionText.length / AVG_CHARS_PER_TOKEN),
      0
    )
    const avgReflectionsPerGroup = 3 // assume each group will have around 3 reflections
    const numGroups = Math.ceil(reflectionsText.length / avgReflectionsPerGroup)

    const outputTokens = Math.round(numGroups * avgGroupNameLength + totalLengthInTokens)

    return Math.min(16384, outputTokens)
    // return Math.min(MAX_GPT_3_5_TOKENS, outputTokens)
  }

  async groupReflections(reflectionsText: string[], themes: string[]) {
    if (!this.openAIApi) return null

    // Initialize an empty object to hold the groups
    const groupedReflections = themes.reduce((acc, theme) => {
      acc[theme] = []
      return acc
    }, {})

    for (const reflection of reflectionsText) {
      // Generate prompt for each reflection
      const prompt = `Given the themes ${themes.join(
        ', '
      )}, and the following reflection: "${reflection}", classify the reflection into the theme it fits in best. The reflection can only be added to one theme. Do not edit the reflection text. Your output should just be the theme name, and must be one of the themes I've provided.`

      try {
        const response = await this.openAIApi.createChatCompletion(
          {
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
          },
          {
            timeout: 60000
          }
        )

        const theme = (response.data.choices[0]?.message?.content?.trim() as string) ?? null
        console.log('🚀 ~ theme:', {theme, reflection})

        if (!theme) {
          console.log(`Couldn't find a suitable theme for reflection: "${reflection}"`)
        } else if (!groupedReflections.hasOwnProperty(theme)) {
          console.log(`AI returned an unknown theme: "${theme}" for reflection: "${reflection}"`)
        } else {
          // Add the reflection to the corresponding theme in groupedReflections
          groupedReflections[theme].push(reflection)
        }
      } catch (e) {
        const error = e instanceof Error ? e : new Error('OpenAI failed to group reflections')
        console.error(error.message)
        sendToSentry(error)
        continue // Continue to the next reflection even if this one fails
      }
    }

    return groupedReflections
  }

  //   async groupReflections(reflectionsText: string[], themes: string[]) {
  //     if (!this.openAIApi) return null

  //     // const prompt = `Given the themes ${themes.join(
  //     console.log('🚀 ~ reflectionsText:', reflectionsText)
  //     //   ', '
  //     // )} and the following reflections: ${reflectionsText.join(
  //     //   ', '
  //     // )}. Classify each reflection into the theme it fits in best. A reflection can only be added to one theme. Do not add a reflection to multiple themes. Please return the output in the following format: theme_name: ["reflection1", "reflection2", ...]. Do not edit the reflection text.`

  //     const prompt = `Given the themes ${themes.join(
  //       ', '
  //     )} and the following reflections: ${reflectionsText.join(
  //       ', '
  //     )}. Classify each reflection into the theme it fits in best. Make sure that all reflections are added to one theme. Do not add a reflection to multiple themes.
  // Please return the output in valid JSON format, with each theme as a key and the corresponding reflections in an array as the value. Do not edit the reflection text.`

  //     const max_tokens = this.estimateOutputTokens(reflectionsText)
  //     console.log('🚀 ~ max_tokens:', max_tokens)

  //     try {
  //       const response = await this.openAIApi.createChatCompletion(
  //         {
  //           model: 'gpt-3.5-turbo-16k',
  //           messages: [
  //             {
  //               role: 'user',
  //               content: prompt
  //             }
  //           ],
  //           max_tokens: 5000,
  //           temperature: 0.7,
  //           top_p: 1,
  //           frequency_penalty: 0,
  //           presence_penalty: 0
  //         },
  //         {
  //           timeout: 60000
  //         }
  //       )
  //       const answer = (response.data.choices[0]?.message?.content?.trim() as string) ?? null
  //       console.log('🚀 ~ answer:', answer)

  //       if (!isValidJSON(answer)) {
  //         sendToSentry(new Error(`Invalid JSON when creating AI groups. Answer: ${answer}`))
  //         return null
  //       }

  //       // const parsedOutput = JSON.parse(answer)

  //       if (typeof answer === 'string') {
  //         // Only parse if the answer is a string
  //         console.log('is a string')
  //         if (!isValidJSON(answer)) {
  //           sendToSentry(new Error(`Invalid JSON when creating AI groups. Answer: ${answer}`))
  //           return null
  //         }

  //         const parsedOutput = JSON.parse(answer)
  //         // ...
  //         return parsedOutput
  //       } else if (typeof answer === 'object') {
  //         console.log('is an object')
  //         // If the answer is already an object, no need to parse
  //         return answer
  //       }

  //       // if (!Array.isArray(parsedOutput)) {
  //       //   sendToSentry(new Error(`Parsed output when creating AI groups is not an array: ${answer}`))
  //       //   return null
  //       // }
  //       // const invalidGroup = parsedOutput.some(
  //       //   (group) =>
  //       //     typeof group !== 'object' ||
  //       //     group === null ||
  //       //     Array.isArray(group) ||
  //       //     Object.keys(group).length !== 1
  //       // )
  //       // if (invalidGroup) {
  //       //   sendToSentry(new Error(`AI group is in an invalid format: ${answer}`))
  //       //   return null
  //       // }

  //       // return parsedOutput
  //     } catch (e) {
  //       const error = e instanceof Error ? e : new Error('OpenAI failed to group reflections')
  //       console.error(error.message)
  //       sendToSentry(error)
  //       return null
  //     }
  //   }

  async groupReflectionsOld(reflectionsText: string[]) {
    if (!this.openAIApi) return null
    const prompt = `You are given a list of reflections from a meeting, separated by commas. Your task is to group these reflections into topics and return an array of JavaScript objects. Each object represents a topic and contains an array of reflections that belong to that topic. Don't change the input text at all, even if it's spelt incorrectly or has special characters. Groups should have at least 2 reflections.

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
    Do not give me code to run. Give me the output as valid JSON in the format above.

    Here is the list of reflections: """
    ${reflectionsText}
    """
    `

    const buffer = 1.2 // add a 20% buffer to be on the safe side
    const estimatedInputTokens = estimateTokens(prompt) * buffer
    const estimatedOutputTokens = this.estimateOutputTokens(reflectionsText) * buffer

    const max_tokens = Math.round(
      Math.min(MAX_GPT_3_5_TOKENS, estimatedInputTokens + estimatedOutputTokens)
    )
    try {
      const response = await this.openAIApi.createChatCompletion(
        {
          // model: 'gpt-3.5-turbo',
          // model: 'gpt-3.5-turbo-16k',
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          top_p: 1,
          max_tokens,
          frequency_penalty: 0,
          presence_penalty: 0
        },
        {
          timeout: 60000
        }
      )
      const answer = (response.data.choices[0]?.message?.content?.trim() as string) ?? null
      console.log('🚀 ~ answer:', answer)
      if (!isValidJSON(answer)) {
        sendToSentry(new Error(`Invalid JSON when creating AI groups. Answer: ${answer}`))
        return null
      }
      const parsedOutput = JSON.parse(answer)
      if (!Array.isArray(parsedOutput)) {
        sendToSentry(new Error(`Parsed output when creating AI groups is not an array: ${answer}`))
        return null
      }
      const invalidGroup = parsedOutput.some(
        (group) =>
          typeof group !== 'object' ||
          group === null ||
          Array.isArray(group) ||
          Object.keys(group).length !== 1
      )
      if (invalidGroup) {
        sendToSentry(new Error(`AI group is in an invalid format: ${answer}`))
        return null
      }
      return answer
    } catch (e) {
      const error = e instanceof Error ? e : new Error('OpenAI failed to getSummary')
      console.error(error.message)
      sendToSentry(error)
      return null
    }
  }
}

export default OpenAIServerManager

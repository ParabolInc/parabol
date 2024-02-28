import OpenAI from 'openai'
import JSON5 from 'json5'
import sendToSentry from './sendToSentry'
import Reflection from '../database/types/Reflection'
import {ModifyType} from '../graphql/public/resolverTypes'
import {Logger} from './Logger'

type Prompt = {
  question: string
  description: string
}

type Template = {
  templateId: string
  templateName: string
  prompts: Prompt[]
}

type AITemplateSuggestion = {
  templateId: string
  explanation: string
}

class OpenAIServerManager {
  private openAIApi
  constructor() {
    if (!process.env.OPEN_AI_API_KEY) {
      this.openAIApi = null
      return
    }
    this.openAIApi = new OpenAI({
      apiKey: process.env.OPEN_AI_API_KEY,
      organization: process.env.OPEN_AI_ORG_ID
    })
  }

  async getStandupSummary(plaintextResponses: string[], meetingPrompt: string) {
    if (!this.openAIApi) return null
    // :TODO: (jmtaber129): Include info about who made each response in the prompt, so that the LLM
    // can include that in the response, e.g. "James is working on AI Summaries" vs. "Someone is
    // working on AI Summaries".
    const prompt = `Below is a list of responses submitted by team members to the question "${meetingPrompt}". If there are multiple responses, the responses are delimited by the string "NEW_RESPONSE". Identify up to 5 themes found within the responses. For each theme, provide a 2 to 3 sentence summary. In the summaries, only include information specified in the responses. When referring to people in the output, do not assume their gender and default to using the pronouns "they" and "them".

    Desired format:
    - <theme title>: <theme summary>
    - <theme title>: <theme summary>
    - <theme title>: <theme summary>

    Responses: """
    ${plaintextResponses.join('\nNEW_RESPONSE\n')}
    """`
    try {
      const response = await this.openAIApi.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
      return (response.choices[0]?.message?.content?.trim() as string) ?? null
    } catch (e) {
      const error = e instanceof Error ? e : new Error('OpenAI failed to getSummary')
      sendToSentry(error)
      return null
    }
  }

  async getSummary(text: string | string[], summaryLocation?: 'discussion thread') {
    if (!this.openAIApi) return null
    const textStr = Array.isArray(text) ? text.join('\n') : text
    const location = summaryLocation ?? 'retro meeting'
    const prompt = `Below is a newline delimited text from a ${location}.
    Summarize the text for the meeting facilitator in one or two sentences.
    When referring to people in the summary, do not assume their gender and default to using the pronouns "they" and "them".
    Aim for brevity and clarity. If your summary exceeds 50 characters, iterate until it fits while retaining the essence. Your final response should only include the shortened summary.

    Text: """
    ${textStr}
    """`
    try {
      const response = await this.openAIApi.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 80,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
      return (response.choices[0]?.message?.content?.trim() as string) ?? null
    } catch (e) {
      const error = e instanceof Error ? e : new Error('OpenAI failed to getSummary')
      sendToSentry(error)
      return null
    }
  }

  async getDiscussionPromptQuestion(topic: string, reflections: Reflection[]) {
    if (!this.openAIApi) return null
    const prompt = `As the meeting facilitator, your task is to steer the discussion in a productive direction. I will provide you with a topic and comments made by the participants around that topic. Your job is to generate a thought-provoking question based on these inputs. Here's how to do it step by step:

    Step 1: Categorize the discussion into one of the following four groups:

    Group 1: Requirement/Seeking help/Requesting permission
    Example Question: "What specific assistance do you need to move forward?"

    Group 2: Retrospection/Post-mortem/Looking back/Incident analysis/Root cause analysis
    Example Question: "What were the underlying factors contributing to the situation?"

    Group 3: Improvement/Measurement/Experiment
    Example Question: "What factors are you aiming to optimize or minimize?"

    Group 4: New plan/New feature/New launch/Exploring new approaches
    Example Question: "How can we expedite the learning process or streamline our approach?"

    Step 2: Once you have categorized the topic, formulate a question that aligns with the example question provided for that group. If the topic does not belong to any of the groups, come up with a good question yourself for a productive discussion.

    Step 3: Finally, provide me with the question you have formulated without disclosing any information about the group it belongs to. When referring to people in the summary, do not assume their gender and default to using the pronouns "they" and "them".

    Topic: ${topic}
    Comments:
    ${reflections
      .map(({plaintextContent}) => plaintextContent.trim().replace(/\n/g, '\t'))
      .join('\n')}`
    try {
      const response = await this.openAIApi.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 80
      })
      const question =
        (response.choices[0]?.message?.content?.trim() as string).replace(
          /^[Qq]uestion:*\s*/gi,
          ''
        ) ?? null
      return question ? question.replace(/['"]+/g, '') : null
    } catch (e) {
      const error =
        e instanceof Error
          ? e
          : new Error(`OpenAI failed to generate a question for the topic ${topic}`)
      sendToSentry(error)
      return null
    }
  }

  async generateThemes(reflectionsText: string[]) {
    if (!this.openAIApi) return null
    const suggestedThemeCountMin = Math.floor(reflectionsText.length / 5)
    const suggestedThemeCountMax = Math.floor(reflectionsText.length / 3)
    // Specify the approximate number of themes as it will often create too many themes otherwise
    const prompt = `Create a short list of common themes given the following reflections: ${reflectionsText.join(
      ', '
    )}. Each theme should be no longer than a few words. There should be roughly ${suggestedThemeCountMin} to ${suggestedThemeCountMax} themes. Return the themes as a comma-separated list.`

    try {
      const response = await this.openAIApi.chat.completions.create({
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
      const themes = (response.choices[0]?.message?.content?.trim() as string) ?? null
      return themes.split(', ')
    } catch (e) {
      const error = e instanceof Error ? e : new Error('OpenAI failed to generate themes')
      Logger.error(error.message)
      sendToSentry(error)
      return null
    }
  }

  async getTemplateSuggestion(templates: Template[], userPrompt: string) {
    if (!this.openAIApi) return null
    const promptText = `Based on the user's input "${userPrompt}", identify the most suitable meeting template from the list below and provide a JSON response in the format: { templateId: "the chosen template ID", explanation: "reason for choosing this template" }. The explanation should be concise. Available templates are: ${templates
      .map(
        (template) =>
          `ID: ${template.templateId}, Name: ${template.templateName}, Prompts: ${template.prompts
            .map((prompt) => `${prompt.question} - ${prompt.description}`)
            .join('; ')}`
      )
      .join('. ')}.`

    try {
      const response = await this.openAIApi.chat.completions.create({
        model: 'gpt-3.5-turbo-0125',
        messages: [
          {
            role: 'user',
            content: promptText
          }
        ],
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })

      const templateResponse = (response.choices[0]?.message?.content?.trim() as string) ?? null
      const parsedResponse = JSON5.parse(templateResponse)
      return parsedResponse as AITemplateSuggestion
    } catch (e) {
      const error =
        e instanceof Error ? e : new Error('OpenAI failed to generate the suggested template')
      Logger.error(error.message)
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

      const response = await this.openAIApi!.chat.completions.create({
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

      const theme = (response.choices[0]?.message?.content?.trim() as string) ?? null
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

    try {
      const themesByReflections = await Promise.all(
        reflectionsText.map((reflection) => getThemeForReflection(reflection))
      )

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
    } catch (error) {
      const e = error instanceof Error ? error : new Error('OpenAI failed to group reflections')
      sendToSentry(e)
      return null
    }
  }

  async modifyCheckInQuestion(question: string, modifyType: ModifyType) {
    if (!this.openAIApi) return null

    const maxQuestionLength = 160
    const prompt: Record<ModifyType, string> = {
      EXCITING: `Transform the following team retrospective ice breaker question into something imaginative and unexpected, using simple and clear language suitable for an international audience. Keep it engaging and thrilling, while ensuring it's easy to understand. Ensure the modified question does not exceed ${maxQuestionLength} characters.
      Original question: "${question}"`,

      FUNNY: `Rewrite the following team retrospective ice breaker question to add humor, using straightforward and easy-to-understand language. Aim for a light-hearted, amusing twist that is accessible to an international audience. Ensure the modified question does not exceed ${maxQuestionLength} characters.
      Original question: "${question}"`,

      SERIOUS: `Modify the following team retrospective ice breaker question to make it more thought-provoking, using clear and simple language. Make it profound to stimulate insightful discussions, while ensuring it remains comprehensible to a diverse international audience. Ensure the modified question does not exceed ${maxQuestionLength} characters.
      Original question: "${question}"`
    }

    try {
      const response = await this.openAIApi.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt[modifyType]
          }
        ],
        temperature: 0.8,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })

      return (response.choices[0]?.message?.content?.trim() as string).replaceAll(`"`, '') ?? null
    } catch (e) {
      const error = e instanceof Error ? e : new Error('OpenAI failed to modifyCheckInQuestion')
      sendToSentry(error)
      return null
    }
  }
}

export default OpenAIServerManager

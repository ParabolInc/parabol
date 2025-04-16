import OpenAI from 'openai'
import {ModifyType} from '../graphql/public/resolverTypes'
import {RetroReflection} from '../postgres/types'
import {Logger} from './Logger'
import sendToSentry from './sendToSentry'

type InsightResponse = {
  wins: string[]
  challenges: string[]
}

class OpenAIServerManager {
  openAIApi
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

  async getStandupSummary(
    responses: Array<{content: string; user: string}>,
    meetingPrompt: string
  ) {
    if (!this.openAIApi) return null

    const prompt = `Below is a list of responses submitted by team members to the question "${meetingPrompt}". Each response includes the team member's name. Identify up to 3 key themes found within the responses. For each theme, provide a single concise sentence that includes who is working on what. Use "they/them" pronouns when referring to people.

    Desired format:
    - <theme>: <brief summary including names>
    - <theme>: <brief summary including names>
    - <theme>: <brief summary including names>

    Responses: """
    ${responses.map(({content, user}) => `${user}: ${content}`).join('\nNEW_RESPONSE\n')}
    """`

    try {
      const response = await this.openAIApi.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
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

  async getDiscussionPromptQuestion(topic: string, reflections: RetroReflection[]) {
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
        model: 'gpt-4o-mini',
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
        model: 'gpt-4o',
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
        model: 'gpt-4o',
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

  async generateInsight(
    yamlData: string,
    useSummaries: boolean,
    userPrompt?: string | null
  ): Promise<InsightResponse | null> {
    if (!this.openAIApi) return null
    const meetingURL = `https://${process.env.HOST}/meet/[meetingId]`
    const promptForMeetingData = `
You are a Team Lead and want to use your meeting data to help write a report on your team's performance. You care about team productivity, morale, roadblocks, relationships, and progress against goals. Below is a list of retrospective meeting summaries (in YAML format) from the past several months.

**Task:**
Analyze the provided meeting data and identify patterns in teamwork and collaboration. Focus on "wins" and "challenges" that appear in two or more different meetings, prioritizing trends that appear in the highest number of meetings. Reference those meetings by hyperlink. Prioritize trends that have received the most combined votes, if that information is available.

**Output Format:**
Return the analysis as a JSON object with this structure:
{
  "wins": ["bullet point 1", "bullet point 2", "bullet point 3"],
  "challenges": ["bullet point 1", "bullet point 2", "bullet point 3"]
}

**Instructions:**
1. **Wins (3 bullet points)**:
   - Highlight positive trends or patterns observed across multiple meetings.
   - Include at least one direct quote from one meeting, attributing it to its author.
   - Link to the referenced meeting(s) using the format:
     [<meeting title>](${meetingURL})
   - Mention each author at most once across the entire output.
   - Keep the tone kind, straightforward, and professional. Avoid jargon.

2. **Challenges (3 bullet points)**:
   - Highlight trends or patterns that indicate areas for improvement.
   - Include at least one direct quote from one meeting, attributing it to its author.
   - Suggest a concrete action or next step to improve the situation.
   - Link to the referenced meeting(s) using the format:
     [<meeting title>](${meetingURL})
   - Mention each author at most once across the entire output.
   - Keep the tone kind, straightforward, and professional. Avoid jargon.

3. **References to Meetings**:
   - Each bullet point in both "wins" and "challenges" should reference at least one meeting.
   - Ensure that each cited trend is supported by data from at least two different meetings.

4. **Key Focus Areas**:
   Consider the following when choosing trends:
   - What is the team's core work? Are desired outcomes clear, and how are they measured?
   - Who utilizes the team's work, and what do they need?
   - Does the team collaborate effectively with related teams?
   - How does the team prioritize its work?
   - What factors speed up or slow down progress?
   - What habits, rules, or rituals help or hinder performance?

5. **Translation**:
   - If the source language of the meetings tends not to be English, identify the language and translate your output to this language

6. **Final Answer**:
   - Return only the JSON object.
   - No extraneous text, explanations, or commentary outside the JSON object.`

    const promptForSummaries = `
    You work at a start-up and you need to discover behavioral trends for a given team.
    Below is a list of meeting summaries in YAML format from meetings over recent months.
    You should describe the situation in two sections with exactly 3 bullet points each.
    The first section should describe the team's positive behavior in bullet points.
    The second section should pick out one or two examples of the team's negative behavior.
    Cite direct quotes from the meeting, attributing them to the person who wrote it, if they're included in the summary.
    Include discussion links included in the summaries. They must be in the markdown format of [link](${meetingURL}/discuss/[discussionId]).
    Try to spot trends. If a topic comes up in several summaries, prioritize it.
    The most important topics are usually at the beginning of each summary, so prioritize them.
    Don't repeat the same points in both the wins and challenges.
    Return the output as a JSON object with the following structure:
    {
      "wins": ["bullet point 1", "bullet point 2", "bullet point 3"],
      "challenges": ["bullet point 1", "bullet point 2"]
    }
    Your tone should be kind and straight forward. Use plain English. No yapping.
    `

    const defaultPrompt = useSummaries ? promptForSummaries : promptForMeetingData
    const prompt = userPrompt ? userPrompt : defaultPrompt

    try {
      const response = await this.openAIApi.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\n${yamlData}`
          }
        ],
        response_format: {
          type: 'json_object'
        },
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })

      const completionContent = response.choices[0]?.message.content as string

      let data: InsightResponse
      try {
        data = JSON.parse(completionContent)
      } catch (e) {
        const error = e instanceof Error ? e : new Error('Error parsing JSON in generateInsight')
        sendToSentry(error)
        return null
      }

      return data
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Error in generateInsight')
      sendToSentry(error)
      return null
    }
  }

  async generateSummary(yamlData: string, userPrompt?: string | null): Promise<string | null> {
    if (!this.openAIApi) return null
    const meetingURL = `https://${process.env.HOST}/meet`
    const defaultPrompt = `
    You need to summarize the content of a meeting. Your summary must be one paragraph with no more than a two or three sentences.
    Below is a list of reflection topics and comments in YAML format from the meeting.
    Include quotes from the meeting, and mention the author.
    Link directly to the discussion in the markdown format of [link](${meetingURL}/[meetingId]/discuss/[discussionId]).
    Don't mention the name of the meeting.
    Prioritise the topics that got the most votes.
    Be sure that each author is only mentioned once.
    Your output must be a string.
    The most important topics are the ones that got the most votes.
    Start the summary with the most important topic.
    You do not need to mention everything. Just mention the most important points, and ensure the summary is concise.
    Your tone should be kind. Write in plain English. No jargon.
    Do not add quote marks around the whole summary.
    `
    const prompt = userPrompt ? userPrompt : defaultPrompt

    try {
      const response = await this.openAIApi.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\n${yamlData}`
          }
        ],

        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })

      const content = response.choices[0]?.message.content as string
      return content
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Error in generateInsight')
      sendToSentry(error)
      return null
    }
  }

  async generateGroupTitle(reflections: {plaintextContent: string}[]) {
    if (!this.openAIApi) return null
    const prompt = `Generate a short (2-4 words) theme or title that captures the essence of these related retrospective comments. The title should be clear and actionable.

${reflections.map((r) => r.plaintextContent).join('\n')}

Important: Respond with ONLY the title itself. Do not include any prefixes like "Title:" or any quote marks. Do not provide any additional explanation.`

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
        max_tokens: 20,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
      const title =
        (response.choices[0]?.message?.content?.trim() as string)
          ?.replace(/^[Tt]itle:*\s*/gi, '') // Remove "Title:" prefix
          ?.replaceAll(/['"]/g, '') ?? null

      return title
    } catch (e) {
      const error = e instanceof Error ? e : new Error('OpenAI failed to generate group title')
      sendToSentry(error)
      return null
    }
  }
}

export default OpenAIServerManager

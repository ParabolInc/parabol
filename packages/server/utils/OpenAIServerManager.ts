import OpenAI from 'openai'
import type {ModifyType} from '../graphql/public/resolverTypes'
import type {RetroReflection} from '../postgres/types'
import {AI_MODEL} from './aiModel'
import groupReflections from './groupReflections/groupReflectionsStructured'
import type {GroupReflectionsInput, GroupReflectionsOptions} from './groupReflections/types'
import logError from './logError'

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

  groupReflectionsStructured(input: GroupReflectionsInput, options: GroupReflectionsOptions = {}) {
    if (!this.openAIApi) return null
    return groupReflections(
      {
        label: 'openai',
        client: this.openAIApi,
        model: AI_MODEL,
        // Hidden reasoning dominated grouping latency, and holding the effort down is only safe
        // because repairGroups patches a forgotten card instead of discarding the whole batch
        params: {reasoning_effort: 'low'}
      },
      input,
      options
    )
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
        model: AI_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        reasoning_effort: 'low',
        max_completion_tokens: 4000
      })
      return (response.choices[0]?.message?.content?.trim() as string) ?? null
    } catch (e) {
      const error = e instanceof Error ? e : new Error('OpenAI failed to getSummary')
      logError(error)
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
        model: AI_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        reasoning_effort: 'low',
        max_completion_tokens: 2000
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
      logError(error)
      return null
    }
  }

  async getPokerEstimate(
    issues: {title: string; description: string; issueKey: string; storyPoints: string}[],
    dimensionName: string,
    possibleLabels: string[]
  ): Promise<string | null> {
    if (!this.openAIApi) return null
    if (issues.length === 0) return null
    const [target, ...references] = issues
    if (!target) return null
    if (references.length === 0) return null
    const allowedValues = possibleLabels.join(', ')
    const referenceBlock = references
      .map(
        ({issueKey, title, storyPoints, description}) =>
          `- Key: ${issueKey}. Title: ${title}. Points: (${storyPoints}). Description: ${description}`
      )
      .join('\n')
    const prompt = `You are an agile estimation assistant helping a team play planning poker. Estimate the "${dimensionName}" for the issue below.

You MUST choose exactly one value from these allowed values: ${allowedValues}.

Issue to estimate:
Key: ${target.issueKey}. Title: ${target.title}. Description: ${target.description}

Recent issues from the same project that already have an estimate, for reference:
${referenceBlock}

Compare the scope and complexity of the issue to estimate against the reference issues, then give your estimate.

Respond in GitHub-flavored markdown. The first line MUST be exactly "**Estimate: <value>**" where <value> is the chosen allowed value. After a blank line, justify the estimate in 2-3 sentences. When you cite a reference issue, refer to it by its bare issue key only (e.g. ${references[0]?.issueKey ?? 'PROJ-123'}) — do not include its title or a link.`
    try {
      const response = await this.openAIApi.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        reasoning_effort: 'low'
      })
      const estimate = response.choices[0]?.message?.content?.trim()
      return estimate || null
    } catch (e) {
      const error =
        e instanceof Error
          ? e
          : new Error(`OpenAI failed to generate a poker estimate for ${issues[0]?.issueKey}`)
      logError(error)
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
        model: AI_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt[modifyType]
          }
        ],
        reasoning_effort: 'low',
        max_completion_tokens: 2000
      })

      return (response.choices[0]?.message?.content?.trim() as string).replaceAll(`"`, '') ?? null
    } catch (e) {
      const error = e instanceof Error ? e : new Error('OpenAI failed to modifyCheckInQuestion')
      logError(error)
      return null
    }
  }

  async generateInspirationItems(
    workItemsText: string,
    meetingPrompt: string,
    userName: string,
    pastResponses: string[],
    userPrompt?: string | null
  ): Promise<{items: {title: string | null; content: string}[]; tokenCost: number} | null> {
    if (!this.openAIApi) return null
    if (!workItemsText.trim()) return null

    const styleGuide =
      pastResponses.length > 0
        ? `\n\nHere are ${userName}'s most recent answers to past standup questions. Mimic their style: match the tone, length, level of detail, formatting, and how casual or formal they are. Do NOT reuse their content — only their voice.\n\n${pastResponses
            .map((response, i) => `<example_${i + 1}>\n${response}\n</example_${i + 1}>`)
            .join('\n\n')}`
        : ''

    const defaultPrompt = `You are helping ${userName} quickly draft their answer to a standup question, grounded in their recent work. You are writing AS ${userName}, in their voice.

The standup question is: "${meetingPrompt}"

Below is a list of ${userName}'s recent work items (issues, pull requests, and their discussion threads). Based ONLY on this work, draft a short, first-person answer to the standup question that summarizes ALL of the work items together — not just one of them.

Rules:
- Be terse and information-dense. Every sentence must convey a specific piece of work. Get straight to the point.
- Do NOT add a filler intro (e.g. "Today, I'm working on a few tasks") or a filler outro (e.g. "No major blockers at the moment, just juggling these tasks"). Start with the actual work and end when the work is covered.
- Do NOT include a blocker sentence unless there is a concrete, specific blocker evident in the work items. Never add a generic "no blockers" statement.
- Write in the first person ("I", "my"), as if ${userName} wrote it themselves. NEVER refer to ${userName} in the third person (do not write "${userName} did X"); since you are ${userName}, write "I did X".
- Synthesize across EVERY work item listed below into a single cohesive answer. Do NOT focus on just one item and ignore the rest; cover the full set of work, grouping related items together where it reads naturally.
- Each work item lists a Status. Match your verb tense to it: use the past tense for completed work (status "complete", e.g. a merged PR or closed issue) and the present/continuous tense for ongoing work (status "in progress", e.g. an open issue or open PR).
- Be specific: reference the actual work. Keep each point to the essential detail — no padding, no restating the obvious.
- If the work items are empty or irrelevant to the question, return an empty items array.
- Produce exactly ONE item, and that one item MUST summarize all of the meaingful work items above. ${styleGuide}

Return JSON of the form: { "items": [{ "title": "<short heading, or null>", "content": "<the drafted answer>" }] }`

    const instructions = userPrompt
      ? `${userPrompt}

You are writing AS ${userName}, in the first person ("I", "my"). Never refer to ${userName} in the third person. Each work item lists a Status: use the past tense for completed work and the present/continuous tense for ongoing work. Produce exactly ONE item that synthesizes ALL of the meaingful work items below into a single cohesive answer — do not focus on just one item and ignore the rest.${styleGuide}

Return JSON of the form: { "items": [{ "title": "<short heading, or null>", "content": "<text>" }] }`
      : defaultPrompt

    try {
      const response = await this.openAIApi.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'user',
            content: `${instructions}\n\nRecent work items:\n${workItemsText}`
          }
        ],
        response_format: {type: 'json_object'},
        reasoning_effort: 'low'
      })

      const content = response.choices[0]?.message?.content
      if (!content) return null

      let parsed: {items?: {title?: string | null; content?: string}[]}
      try {
        parsed = JSON.parse(content)
      } catch {
        logError(new Error('Failed to parse generateInspirationItems JSON response'))
        return null
      }

      const items = (parsed.items ?? [])
        .filter((item) => !!item?.content?.trim())
        .map((item) => ({title: item.title?.trim() || null, content: item.content!.trim()}))

      return {items, tokenCost: response.usage?.total_tokens ?? 10_000}
    } catch (e) {
      const error = e instanceof Error ? e : new Error('OpenAI failed to generateInspirationItems')
      logError(error)
      return null
    }
  }

  async generateRetroInspirationItems(
    workItemsText: string,
    prompts: {question: string; description: string}[],
    userName: string,
    userPrompt?: string | null
  ): Promise<{
    items: {title: string | null; content: string; promptIndex: number}[]
    tokenCost: number
  } | null> {
    if (!this.openAIApi) return null
    if (!workItemsText.trim()) return null
    if (prompts.length === 0) return null

    // The reflect prompts are the retro's columns. The model drafts reflections and assigns each
    // to the single best-fitting column by index.
    const categoryList = prompts
      .map(
        (prompt, i) =>
          `${i}: "${prompt.question}"${prompt.description ? ` — ${prompt.description}` : ''}`
      )
      .join('\n')

    const defaultPrompt = `You are helping ${userName} prepare for a team retrospective, grounded in their recent work. You are writing AS ${userName}, in the first person ("I", "my").

A retrospective collects reflections into categories. The categories for this retro are:
${categoryList}

Below is a list of ${userName}'s recent work items (issues, pull requests, calendar events, tasks, and their discussion threads). Based ONLY on this work, draft several short, first-person reflections that ${userName} could contribute to the retro.

Rules:
- Produce MULTIPLE distinct reflections (typically one per meaningful theme in the work), not a single summary. Each reflection is one concise thought.
- Do not just summarize the work done. If a work item does not convey sentiment towards the work that fits the prompt (e.g. what could have been done better), exclude it from consideration and do not use it to create a reflection.
- For EACH reflection, choose the single best-fitting category and return its index ("promptIndex") from the list above.
- Be terse and specific. Every reflection must reference concrete work. No filler, no generic statements.
- Write in the first person ("I", "my"), as if ${userName} wrote it. NEVER refer to ${userName} in the third person.
- Do NOT invent problems or wins that are not evident in the work items. If a category has nothing relevant, simply produce no reflections for it.
- If the work items are empty or irrelevant, return an empty items array.

Return JSON of the form: { "items": [{ "title": "<short heading, or null>", "content": "<the reflection>", "promptIndex": <category index> }] }`

    const instructions = userPrompt
      ? `${userPrompt}

You are writing AS ${userName}, in the first person ("I", "my"). Never refer to ${userName} in the third person. The retro categories are:
${categoryList}

Produce MULTIPLE distinct reflections grounded ONLY in the work items below. For each, choose the single best-fitting category and return its index as "promptIndex".

Return JSON of the form: { "items": [{ "title": "<short heading, or null>", "content": "<text>", "promptIndex": <category index> }] }`
      : defaultPrompt

    try {
      const response = await this.openAIApi.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'user',
            content: `${instructions}\n\nRecent work items:\n${workItemsText}`
          }
        ],
        response_format: {type: 'json_object'},
        reasoning_effort: 'low'
      })

      const content = response.choices[0]?.message?.content
      if (!content) return null

      let parsed: {items?: {title?: string | null; content?: string; promptIndex?: number}[]}
      try {
        parsed = JSON.parse(content)
      } catch {
        logError(new Error('Failed to parse generateRetroInspirationItems JSON response'))
        return null
      }

      const items = (parsed.items ?? [])
        .filter((item) => !!item?.content?.trim())
        .map((item) => {
          // Clamp the model's chosen index into a valid category; default to the first.
          const rawIndex = Number(item.promptIndex)
          const promptIndex =
            Number.isInteger(rawIndex) && rawIndex >= 0 && rawIndex < prompts.length ? rawIndex : 0
          return {title: item.title?.trim() || null, content: item.content!.trim(), promptIndex}
        })

      return {items, tokenCost: response.usage?.total_tokens ?? 10_000}
    } catch (e) {
      const error =
        e instanceof Error ? e : new Error('OpenAI failed to generateRetroInspirationItems')
      logError(error)
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
        model: AI_MODEL,
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\n${yamlData}`
          }
        ],
        reasoning_effort: 'low'
      })

      const content = response.choices[0]?.message.content as string
      return content
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Error in generateInsight')
      logError(error)
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
        model: AI_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        reasoning_effort: 'low',
        max_completion_tokens: 1000
      })
      const title =
        (response.choices[0]?.message?.content?.trim() as string)
          ?.replace(/^[Tt]itle:*\s*/gi, '') // Remove "Title:" prefix
          ?.replaceAll(/['"]/g, '') ?? null

      return title
    } catch (e) {
      const error = e instanceof Error ? e : new Error('OpenAI failed to generate group title')
      logError(error)
      return null
    }
  }
}

export default OpenAIServerManager

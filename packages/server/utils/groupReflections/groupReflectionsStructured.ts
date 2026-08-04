import type OpenAI from 'openai'
import type {ChatCompletionCreateParamsNonStreaming} from 'openai/resources/chat/completions'
import logError from '../logError'
import buildGroupReflectionsPrompt from './buildGroupReflectionsPrompt'
import repairGroups from './repairGroups'
import type {GroupReflectionsInput, GroupReflectionsOptions, GroupReflectionsResult} from './types'

export type GroupingProvider = {
  /** Tags the timing log so two providers can be told apart in one run */
  label: string
  /** DeepSeek speaks the OpenAI wire format, so both providers use the same client class */
  client: OpenAI
  model: string
  /** Provider-specific knobs, e.g. reasoning_effort on gpt-5 */
  params?: Partial<ChatCompletionCreateParamsNonStreaming>
}

/**
 * Asks a provider to group reflections and returns an answer that always covers every input id.
 *
 * Everything except the API call itself lives here rather than in the managers, so swapping
 * providers cannot accidentally change the prompt, the repair, or what gets logged.
 */
const groupReflectionsStructured = async (
  provider: GroupingProvider,
  input: GroupReflectionsInput,
  options: GroupReflectionsOptions = {}
): Promise<GroupReflectionsResult | null> => {
  const {reflections} = input
  if (reflections.length === 0) return null
  const {userPrompt, signal} = options
  const {label, client, model, params} = provider
  const prompt = buildGroupReflectionsPrompt(input, userPrompt)

  try {
    const response = await client.chat.completions.create(
      {
        ...params,
        model,
        messages: [{role: 'user', content: prompt}],
        response_format: {type: 'json_object'}
      },
      signal ? {signal} : undefined
    )

    const content = response.choices[0]?.message?.content
    if (!content) return null

    let parsed: Omit<GroupReflectionsResult, 'tokenCost'>
    try {
      parsed = JSON.parse(content)
    } catch {
      logError(new Error(`Failed to parse ${label} groupReflectionsStructured JSON response`))
      return null
    }

    const repair = repairGroups(parsed, reflections)
    if (!repair) return null

    return {groups: repair.groups, tokenCost: response.usage?.total_tokens ?? 0}
  } catch (e) {
    const error =
      e instanceof Error ? e : new Error(`${label} failed to groupReflectionsStructured`)
    logError(error)
    return null
  }
}

export default groupReflectionsStructured

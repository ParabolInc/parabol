import type {GroupReflectionsInput} from './types'

/**
 * Builds the grouping prompt.
 *
 * Shared by every provider on purpose: comparing OpenAI against DeepSeek is only meaningful if
 * they are handed byte-identical input, and a copy in each manager would drift on the first edit.
 */
const buildGroupReflectionsPrompt = (input: GroupReflectionsInput, userPrompt?: string | null) => {
  const {reflections} = input
  const isScoped = 'prompt' in input
  const columnQuestion = isScoped ? input.prompt : null

  const min = Math.max(1, Math.floor(reflections.length / 6))
  const max = Math.ceil(reflections.length / 3)

  // The grouping STRATEGY, which a userPrompt replaces wholesale. Everything here is a judgment
  // call the user must be able to override, including how many groups to aim for and title style.
  // Written for a reasoning model: state the objective and the constraints, skip the persona and
  // the explanation of what a retrospective is.
  const strategy = `Cluster the retrospective reflections below into themes a team will discuss together.

${
  columnQuestion
    ? `Every reflection answers the same prompt, so treat them as one set.`
    : `Each reflection shows its prompt in parentheses. Group across prompts whenever reflections share an actionable theme — the prompt is context, not a boundary.`
}

Optimize for:
- Root causes and patterns over surface wording. Two reflections belong together when discussing them together produces one conversation instead of two.
- Connections the team would miss on its own. Pairing a frustration with a related success is often more useful than sorting by sentiment.

Constraints:
- Target ${min} to ${max} groups. Deviate only if the reflections genuinely cluster otherwise.
- Titles are 2-5 words, action-oriented, and name what to discuss: "Speed Up Code Reviews", not "Code Reviews".`

  // A scoped batch names its question once in the invariants below, so repeating it on every
  // line would be pure token waste
  const reflectionLines = isScoped
    ? input.reflections.map((r) => `[${r.id}]: ${r.text}`)
    : input.reflections.map((r) => `[${r.id}] (${r.prompt}): ${r.text}`)

  // The INVARIANTS, always appended last so trailing instructions win. "Reflections that don't
  // clearly relate ... remain in their own group" reads like advice but belongs here: it is what
  // makes exactly-once satisfiable, and without it the model drops loners and fails validation.
  // The literal word "JSON" also has to survive here: DeepSeek's json_object mode rejects a
  // request whose prompt never mentions it.
  const invariants = `${columnQuestion ? `All of these reflections answer the prompt "${columnQuestion}". Group only within this set.\n\n` : ''}Here are the reflections:
${reflectionLines.join('\n')}

Rules you must follow exactly:
- Each reflection must belong to exactly one group
- Every reflection id above must appear in your answer
- Reflections that don't clearly relate to others should remain in their own single-reflection group
- Titles must be non-empty and distinct from each other

Return JSON: { "groups": [{ "title": "...", "reflectionIds": ["id1", "id2"] }] }`

  return `${userPrompt || strategy}\n\n${invariants}`
}

export default buildGroupReflectionsPrompt

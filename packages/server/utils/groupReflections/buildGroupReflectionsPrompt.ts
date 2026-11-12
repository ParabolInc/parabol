import type {GroupReflectionsInput} from './types'

/**
 * Builds the grouping prompt.
 *
 * Shared by every provider on purpose: comparing OpenAI against DeepSeek is only meaningful if
 * they are handed byte-identical input, and a copy in each manager would drift on the first edit.
 */
const buildGroupReflectionsPrompt = (input: GroupReflectionsInput, userPrompt?: string | null) => {
  const {reflections, meetingName} = input
  const isScoped = 'prompt' in input
  const columnQuestion = isScoped ? input.prompt : null

  // Calibrated against the groups teams kept in 300 retros: about 0.58 groups per card, a third of
  // cards left alone, most groups 2-3 cards, and 73% of groups inside one column
  const minMultiCardGroups = Math.max(1, Math.round(reflections.length / 6))
  const maxMultiCardGroups = Math.max(2, Math.round(reflections.length / 3.5))

  // The grouping STRATEGY, which a userPrompt replaces wholesale. Everything here is a judgment
  // call the user must be able to override, including how many groups to aim for and title style.
  const strategy = `Group the retrospective reflections below the way a team would on its board before voting.

${
  columnQuestion
    ? `Every reflection answers the same prompt, so treat them as one set.`
    : `Each reflection shows its prompt in parentheses. Teams mostly group within one prompt; group across prompts only when reflections are about the same specific thing.`
}

How teams group:
- Two reflections belong together when they are about the same specific topic, event or problem, so the team would discuss them as one item.
- Duplicates and near-duplicates always go together.
- A broad shared area (both mention "communication", the same project or the same team) is not enough.
- Groups are small: most hold 2 or 3 reflections. Bigger groups happen only when several people wrote about the same thing.
- Leaving a reflection on its own is normal; often a third of reflections stay alone.

Constraints:
- Expect roughly ${minMultiCardGroups} to ${maxMultiCardGroups} groups that hold 2 or more reflections.
- Titles are 2-5 words and name what to discuss.`

  const oneLine = (text: string) => text.replace(/\s+/g, ' ').trim()
  // A scoped batch names its question once in the invariants below, so repeating it on every
  // line would be pure token waste. A cross-column batch lists each column's cards together.
  const reflectionLines = isScoped
    ? input.reflections.map((r) => `[${r.id}]: ${oneLine(r.text)}`)
    : [...new Set(input.reflections.map((r) => r.prompt))].flatMap((prompt) =>
        input.reflections
          .filter((r) => r.prompt === prompt)
          .map((r) => `[${r.id}] (${r.prompt}): ${oneLine(r.text)}`)
      )

  // The INVARIANTS, always appended last so trailing instructions win. "Reflections that don't
  // clearly relate ... remain in their own group" reads like advice but belongs here: it is what
  // makes exactly-once satisfiable, and without it the model drops loners and fails validation.
  // The literal word "JSON" also has to survive here: DeepSeek's json_object mode rejects a
  // request whose prompt never mentions it.
  const invariants = `${meetingName ? `Meeting: ${oneLine(meetingName)}\n\n` : ''}${columnQuestion ? `All of these reflections answer the prompt "${columnQuestion}". Group only within this set.\n\n` : ''}Here are the reflections:
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

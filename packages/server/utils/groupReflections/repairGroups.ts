import type {GroupReflectionsResult, ReflectionInput} from './types'

/**
 * Forces the model's answer to cover every input id exactly once.
 *
 * Repairs rather than rejects. Rejecting made the caller discard the whole batch and fall back to
 * all-singletons, so one forgotten card threw away the grouping for every other card — and avoiding
 * that outcome was the only reason to pay for high reasoning effort. A forgotten card becomes its
 * own group, which is what the prompt asks for unrelated cards anyway.
 *
 * Returns null only when the response is too malformed to salvage.
 */
export const repairGroups = (
  parsed: Omit<GroupReflectionsResult, 'tokenCost'>,
  reflections: readonly ReflectionInput[]
) => {
  if (!parsed.groups || !Array.isArray(parsed.groups)) return null
  const unplaced = new Set(reflections.map((r) => r.id))
  const groups: GroupReflectionsResult['groups'] = []
  for (const group of parsed.groups) {
    if (!Array.isArray(group.reflectionIds)) continue
    // delete() is the membership test: it drops ids we never asked about and second mentions of an
    // id already placed, so exactly-once holds by construction
    const reflectionIds = group.reflectionIds.filter((id) => unplaced.delete(id))
    if (reflectionIds.length === 0) continue
    // An untitled group has nothing for the discuss phase to show, so let its cards stand alone
    if (!group.title) {
      groups.push(...reflectionIds.map((id) => ({title: '', reflectionIds: [id]})))
      continue
    }
    groups.push({title: group.title, reflectionIds})
  }
  const forgotten = [...unplaced]
  groups.push(...forgotten.map((id) => ({title: '', reflectionIds: [id]})))
  return {groups, repaired: forgotten.length}
}

export default repairGroups

// Full, literal Tailwind class strings so the JIT scanner detects them — never build these dynamically.
// A category's color is its position in the globally-ordered category list (sorted by createdAt, then
// name), assigned round-robin so every color is used before any repeats. The tag and dot arrays share
// the same order/family, so a category's pill and its dot are always the same hue.
// Light tags are a 100 fill with 700 text; dark inverts that to a 900 fill with 200 text so the pill
// recedes into the card instead of glowing, while keeping the same hue identity as its dot.
const CATEGORY_TAG_CLASSES = [
  'bg-tomato-100 text-tomato-700 dark:bg-tomato-900 dark:text-tomato-200',
  'bg-gold-100 text-gold-700 dark:bg-gold-900 dark:text-gold-200',
  'bg-jade-100 text-jade-700 dark:bg-jade-900 dark:text-jade-200',
  'bg-aqua-100 text-aqua-700 dark:bg-aqua-900 dark:text-aqua-200',
  'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200',
  'bg-lilac-100 text-lilac-700 dark:bg-lilac-900 dark:text-lilac-200',
  // grape-900 is the dark app background, so this one pill uses grape-800 to stay visible on a card
  'bg-grape-100 text-grape-700 dark:bg-grape-800 dark:text-grape-200',
  'bg-fuscia-100 text-fuscia-700 dark:bg-fuscia-900 dark:text-fuscia-200',
  'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200',
  'bg-forest-100 text-forest-700 dark:bg-forest-900 dark:text-forest-200',
  'bg-grass-100 text-grass-700 dark:bg-grass-900 dark:text-grass-200',
  'bg-terra-100 text-terra-700 dark:bg-terra-900 dark:text-terra-200'
] as const

const CATEGORY_DOT_CLASSES = [
  'bg-tomato-500',
  'bg-gold-500',
  'bg-jade-500',
  'bg-aqua-500',
  'bg-sky-500',
  'bg-lilac-500',
  'bg-grape-500',
  'bg-fuscia-500',
  'bg-rose-500',
  'bg-forest-500',
  'bg-grass-500',
  'bg-terra-500'
] as const

// The globally-ordered category list that drives round-robin color assignment: every category in use
// across the available question packs, deduped and sorted by createdAt then name so the ordering (and
// therefore each category's color) is stable and identical everywhere it's rendered.
export const getOrderedTeamHealthCategories = (
  packs: ReadonlyArray<{
    questions: ReadonlyArray<{category: {id: string; name: string; createdAt: string} | null}>
  }>
) => {
  const categoryMap = new Map<string, {id: string; name: string; createdAt: string}>()
  packs.forEach((pack) =>
    pack.questions.forEach((q) => {
      if (q.category) categoryMap.set(q.category.id, q.category)
    })
  )
  return Array.from(categoryMap.values()).sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt) || a.name.localeCompare(b.name)
  )
}

// index of a category within the ordered list, wrapped round-robin over the palette so all colors are
// exhausted before one repeats. Unknown ids (shouldn't happen) fall back to the first color.
const colorIndex = (categoryId: string, orderedIds: ReadonlyArray<string>) => {
  const i = orderedIds.indexOf(categoryId)
  return (i < 0 ? 0 : i) % CATEGORY_TAG_CLASSES.length
}

export const getTeamHealthCategoryColor = (categoryId: string, orderedIds: ReadonlyArray<string>) =>
  CATEGORY_TAG_CLASSES[colorIndex(categoryId, orderedIds)]!

export const getTeamHealthCategoryDotColor = (
  categoryId: string,
  orderedIds: ReadonlyArray<string>
) => CATEGORY_DOT_CLASSES[colorIndex(categoryId, orderedIds)]!

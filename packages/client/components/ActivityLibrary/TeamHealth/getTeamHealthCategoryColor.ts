// Full, literal Tailwind class strings so the JIT scanner detects them — never build these dynamically.
// A category's color is its position in the globally-ordered category list (sorted by createdAt, then
// name), assigned round-robin so every color is used before any repeats. The tag and dot arrays share
// the same order/family, so a category's pill and its dot are always the same hue.
const CATEGORY_TAG_CLASSES = [
  'bg-tomato-100 text-tomato-700',
  'bg-gold-100 text-gold-700',
  'bg-jade-100 text-jade-700',
  'bg-aqua-100 text-aqua-700',
  'bg-sky-100 text-sky-700',
  'bg-lilac-100 text-lilac-700',
  'bg-grape-100 text-grape-700',
  'bg-fuscia-100 text-fuscia-700',
  'bg-rose-100 text-rose-700',
  'bg-forest-100 text-forest-700',
  'bg-grass-100 text-grass-700',
  'bg-terra-100 text-terra-700'
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

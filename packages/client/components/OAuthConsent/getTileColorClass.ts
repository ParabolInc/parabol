const TILE_COLOR_CLASSES = [
  'bg-gold-700',
  'bg-sky-600',
  'bg-jade-800',
  'bg-grape-600',
  'bg-tomato-700',
  'bg-aqua-800',
  'bg-rose-700',
  'bg-fuscia-700',
  'bg-forest-700',
  'bg-lilac-700'
]

const getTileColorClass = (seed: string) => {
  const hash = [...seed].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 0)
  return TILE_COLOR_CLASSES[hash % TILE_COLOR_CLASSES.length]!
}

export default getTileColorClass

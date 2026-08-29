import type {Node as ProseMirrorNode} from '@tiptap/pm/model'

export interface TableOfContentsItem {
  pos: number
  level: number
  depth: number
  text: string
}

const MAX_LEVEL = 3
const EXCLUDED_CONTAINERS = new Set(['tableCell', 'tableHeader', 'detailsContent'])

export const getTableOfContentsItems = (doc: ProseMirrorNode): TableOfContentsItem[] => {
  const headings: Omit<TableOfContentsItem, 'depth'>[] = []
  doc.descendants((node, pos) => {
    const {name} = node.type
    if (EXCLUDED_CONTAINERS.has(name)) return false
    if (name !== 'heading') return true
    const isPageTitle = pos === 0
    const level = node.attrs.level as number
    const text = node.textContent.trim()
    if (!isPageTitle && level <= MAX_LEVEL && text) headings.push({pos, level, text})
    return false
  })
  if (headings.length === 0) return []
  const minLevel = Math.min(...headings.map(({level}) => level))
  return headings.map((heading) => ({...heading, depth: heading.level - minLevel}))
}

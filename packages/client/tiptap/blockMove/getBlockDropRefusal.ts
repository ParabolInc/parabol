import {hasMinPageRole} from '../../shared/hasMinPageRole'

export type PageRole = Parameters<typeof hasMinPageRole>[1]

export type BlockDropTarget = {
  pageId: string
  viewerRole: PageRole
  isDatabase?: boolean | null
  isMeetingTOC?: boolean | null
  ancestorPageIds?: readonly string[]
}

export type BlockDragState = {
  sourcePageId: string
  childPageIds: readonly string[]
  refusal: string | null
}

export const getBlockDropRefusal = (target: BlockDropTarget, drag: BlockDragState) => {
  if (drag.refusal) return drag.refusal
  if (target.pageId === drag.sourcePageId) return 'This page'
  if (
    drag.childPageIds.includes(target.pageId) ||
    target.ancestorPageIds?.some((ancestorId) => drag.childPageIds.includes(ancestorId))
  ) {
    return 'Inside itself'
  }
  if (target.isDatabase) return 'Database'
  if (target.isMeetingTOC) return 'Read-only'
  if (target.viewerRole && !hasMinPageRole('editor', target.viewerRole)) return 'View only'
  return null
}

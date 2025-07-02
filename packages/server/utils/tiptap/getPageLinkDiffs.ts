import {getPageCodeFromLinkKey} from '../../syncPageLinks'

// Yes, this could be 4 lines, but it's lower level to be as fast as possible
export const getPageLinkDiffs = (oldPageLinkKeys: string[], newPageLinkKeys: string[]) => {
  const oldIds = oldPageLinkKeys.map(getPageCodeFromLinkKey)
  const newIds = newPageLinkKeys.map(getPageCodeFromLinkKey)
  const oldIdSet = new Set(oldIds)
  const newIdSet = new Set(newIds)
  if (oldIdSet.size === newIdSet.size) {
    let same = true
    for (let i = 0; i < oldIds.length; i++) {
      if (!newIdSet.has(oldIds[i]!)) {
        same = false
        break
      }
    }
    if (same) return null
  }
  const additions: number[] = []
  const deletions: number[] = []
  for (let i = 0; i < newIds.length; i++) {
    const id = newIds[i]!
    if (!oldIdSet.has(id)) additions.push(id)
  }
  for (let i = 0; i < oldIds.length; i++) {
    const id = oldIds[i]!
    if (!newIdSet.has(id)) deletions.push(id)
  }
  if (additions.length === 0 && deletions.length === 0) return null
  return {additions, deletions}
}

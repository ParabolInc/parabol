import type {EditorState} from '@tiptap/pm/state'
import type Atmosphere from '../../../Atmosphere'
import {lookupPageViewerGrant} from '../../../hooks/usePageViewerAccess'
import {getPageToDuplicate} from './getPageToDuplicate'

export const getCopyablePage = (
  atmosphere: Atmosphere,
  state: EditorState,
  target: Parameters<typeof getPageToDuplicate>[1]
) => {
  const page = getPageToDuplicate(state, target)
  if (!page || lookupPageViewerGrant(atmosphere, page.pageCode) === null) return null
  return page
}

import {JSONContent} from '@tiptap/core'
import {RawDraftContentState} from 'draft-js'

export const isDraftJSContent = (
  content: JSONContent | RawDraftContentState
): content is RawDraftContentState => {
  return 'blocks' in content
}

import type {JSONContent} from '@tiptap/core'
import {parseMarkdownBlocks} from '../../../client/shared/tiptap/parseMarkdownBlocks'
import {validatePageDoc} from './validatePageDoc'

export const parsePageMarkdown = (
  markdown: string,
  allowedImageSrcs: Set<string>
): JSONContent[] => {
  if (!markdown.trim()) return []
  const content = parseMarkdownBlocks(markdown)
  validatePageDoc({type: 'doc', content}, allowedImageSrcs)
  return content
}

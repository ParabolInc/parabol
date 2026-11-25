import type {JSONContent} from '@tiptap/core'
import {GraphQLError} from 'graphql'
import {parseMarkdownBlocks} from '../../../client/shared/tiptap/parseMarkdownBlocks'
import {validatePageDoc} from './validatePageDoc'

export const parseMarkdownContent = (markdown: string): JSONContent[] => {
  try {
    return parseMarkdownBlocks(markdown)
  } catch (e) {
    if (e instanceof GraphQLError) throw e
    throw new GraphQLError('The content could not be parsed as markdown', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
}

export const parsePageMarkdown = (
  markdown: string,
  allowedImageSrcs: Set<string>
): JSONContent[] => {
  if (!markdown.trim()) return []
  const content = parseMarkdownContent(markdown)
  validatePageDoc({type: 'doc', content}, allowedImageSrcs)
  return content
}

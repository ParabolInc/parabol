import {generateText} from '@tiptap/core'
import {GraphQLError} from 'graphql'
import {serverTipTapExtensions} from '../../../../../client/shared/tiptap/serverTipTapExtensions'
import {convertToTipTap} from '../../../../utils/convertToTipTap'

const MAX_CONTENT_LENGTH = 20_000
const MAX_PLAINTEXT_LENGTH = 2000

export const parsePageCommentContent = (serializedContent: string) => {
  if (serializedContent.length > MAX_CONTENT_LENGTH) throw new GraphQLError('Comment is too long')
  const content = convertToTipTap(serializedContent)
  const plaintextContent = generateText(content, serverTipTapExtensions).trim()
  if (!plaintextContent) throw new GraphQLError('Comment is empty')
  if (plaintextContent.length > MAX_PLAINTEXT_LENGTH) throw new GraphQLError('Comment is too long')
  return {content, plaintextContent}
}

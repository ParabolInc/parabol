import {generateText} from '@tiptap/core'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import {getSimpleGroupTitle} from '../../../../client/utils/getSimpleGroupTitle'
import {convertToTipTap} from '../../../utils/convertToTipTap'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import type {QueryResolvers} from '../resolverTypes'

const toPlaintext = (content: string) => {
  try {
    return generateText(convertToTipTap(content), serverTipTapExtensions)
  } catch {
    return ''
  }
}

const getDemoGroupTitle: QueryResolvers['getDemoGroupTitle'] = async (
  _source,
  {reflectionsContent}
) => {
  const manager = new OpenAIServerManager()
  const reflections = reflectionsContent.map((content) => ({
    plaintextContent: toPlaintext(content)
  }))
  const aiTitle = await manager.generateGroupTitle(reflections)
  return {title: aiTitle || getSimpleGroupTitle(reflections)}
}

export default getDemoGroupTitle

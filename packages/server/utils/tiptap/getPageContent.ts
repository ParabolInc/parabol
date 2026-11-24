import {TiptapTransformer} from '@hocuspocus/transformer'
import {Editor, type JSONContent} from '@tiptap/core'
import {applyUpdate, Doc} from 'yjs'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import type {DataLoaderWorker} from '../../graphql/graphql'
import type {PageContentFormatEnum} from '../../graphql/public/resolverTypes'
import {redisHocusPocus} from '../../hocusPocus'
import {CipherId} from '../CipherId'
import {getPageMarkdownBlocks, PAGE_BLOCK_SEPARATOR} from './getPageMarkdownBlocks'

const readPageJSON = async (pageId: number, dataLoader: DataLoaderWorker) => {
  const liveContent = await redisHocusPocus.handleEvent(
    'readPageContent',
    CipherId.toClient(pageId, 'page'),
    {},
    true
  )
  if (liveContent) return liveContent
  const page = await dataLoader.get('pageYDocs').load(pageId)
  const doc = new Doc()
  if (page?.yDoc) applyUpdate(doc, page.yDoc)
  return TiptapTransformer.fromYdoc(doc, 'default') as JSONContent
}

const toPageMarkdown = (content: JSONContent) => {
  const editor = new Editor({
    element: undefined,
    content: {type: 'doc', content: [{type: 'paragraph'}]},
    extensions: serverTipTapExtensions
  })
  try {
    return getPageMarkdownBlocks(editor, content.content ?? []).join(PAGE_BLOCK_SEPARATOR)
  } finally {
    editor.destroy()
  }
}

export const getPageContent = async (
  pageId: number,
  format: PageContentFormatEnum,
  dataLoader: DataLoaderWorker
) => {
  const content = await readPageJSON(pageId, dataLoader)
  return format === 'markdown' ? toPageMarkdown(content) : JSON.stringify(content)
}

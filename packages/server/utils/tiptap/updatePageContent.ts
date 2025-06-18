import {generateText, type JSONContent} from '@tiptap/core'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import getKysely from '../../postgres/getKysely'

export const updatePageContent = async (
  pageId: number,
  content: JSONContent,
  state: Buffer<ArrayBufferLike>
) => {
  const pg = getKysely()
  const docText = generateText(content, serverTipTapExtensions)
  const delimiter = '\n\n'
  const titleBreakIdx = docText.indexOf(delimiter)
  const safeTitleBreakIdx = titleBreakIdx === -1 ? docText.length : titleBreakIdx
  const title = docText.slice(0, safeTitleBreakIdx).slice(0, 255)
  const plaintextContent = docText.slice(safeTitleBreakIdx + delimiter.length)
  const {titleChanged} = await pg
    .updateTable('Page')
    .set({yDoc: state, title, plaintextContent})
    .where('id', '=', pageId)
    .returning(({eb, selectFrom}) => [
      // if we change the isolation level to "read uncommitted" this will fail, but fine for now
      eb(selectFrom('Page').select('title').where('id', '=', pageId), '!=', title).as(
        'titleChanged'
      )
    ])
    .executeTakeFirstOrThrow()
  return {updatedTitle: titleChanged ? title : undefined}
}

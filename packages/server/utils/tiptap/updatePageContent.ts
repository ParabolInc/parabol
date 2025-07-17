import {generateText, type JSONContent} from '@tiptap/core'
import {getTitleFromPageText} from '../../../client/shared/tiptap/getTitleFromPageText'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import getKysely from '../../postgres/getKysely'

export const updatePageContent = async (
  pageId: number,
  content: JSONContent,
  state: Buffer<ArrayBufferLike>
) => {
  const pg = getKysely()
  const docText = generateText(content, serverTipTapExtensions)
  const {title, contentStartsAt} = getTitleFromPageText(docText)
  const plaintextContent = docText.slice(contentStartsAt)
  const {titleChanged} = await pg
    .updateTable('Page')
    .set({yDoc: state, title, plaintextContent})
    .where('id', '=', pageId)
    .returning(({eb, selectFrom}) => [
      // if we change the isolation level to "read uncommitted" this will fail, but fine for now
      eb(selectFrom('Page').select('title').where('id', '=', pageId), 'is distinct from', title).as(
        'titleChanged'
      )
    ])
    .executeTakeFirstOrThrow()
  return {updatedTitle: titleChanged ? title : undefined}
}

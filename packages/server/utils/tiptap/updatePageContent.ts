import type {JSONContent} from '@tiptap/core'
import getKysely from '../../postgres/getKysely'
import {getPlaintextFromTipTap} from './getPlaintextFromTipTap'

export const updatePageContent = async (
  pageId: number,
  content: JSONContent,
  state: Buffer<ArrayBufferLike>
) => {
  const pg = getKysely()
  const {title, plaintextContent} = getPlaintextFromTipTap(content)
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

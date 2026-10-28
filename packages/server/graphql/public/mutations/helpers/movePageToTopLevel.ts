import getKysely from '../../../../postgres/getKysely'
import {updatePageAncestorIds} from '../../../../postgres/updatePageAncestorIds'

export const movePageToTopLevel = async (viewerId: string, pageId: number, sortOrder: string) => {
  const pg = getKysely()
  await pg
    .with('PageUserSortOrder', (qc) =>
      // this only fires for top-level shared pages
      qc
        .insertInto('PageUserSortOrder')
        .values({
          userId: viewerId,
          pageId,
          sortOrder
        })
        .onConflict((oc) =>
          oc.columns(['userId', 'pageId']).doUpdateSet({
            sortOrder
          })
        )
    )
    .updateTable('Page')
    .set({
      teamId: null,
      parentPageId: null,
      isParentLinked: true,
      sortOrder
    })
    .where('id', '=', pageId)
    .execute()
  await updatePageAncestorIds(pg, pageId)
}

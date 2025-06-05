import getKysely from '../../../../postgres/getKysely'

export const movePageToTopLevel = async (viewerId: string, pageId: number, sortOrder: string) => {
  const pg = getKysely()
  await pg
    .with('PageUserSortOrder', (qc) =>
      // this only fires for top-level shared pages
      qc
        .updateTable('PageUserSortOrder')
        .set({
          sortOrder
        })
        .where('userId', '=', viewerId)
        .where('pageId', '=', pageId)
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
}

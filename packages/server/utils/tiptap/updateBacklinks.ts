import getKysely from '../../postgres/getKysely'

// A same-document move consists of a delete followed by an add
// We could get clever here & debounce delete calls & if an add call is received
// for the same parent & child then cancel them both out
export const updateBacklinks = async (
  fromPageId: number,
  addToPageId?: number | null,
  deleteToPageId?: number | null
) => {
  const pg = getKysely()
  await Promise.all([
    addToPageId &&
      pg
        .insertInto('PageBacklink')
        .columns(['toPageId', 'fromPageId'])
        // SELECT instead of VALUES so the insert is a no-op if the page doesn't exist,
        // avoiding a FK violation when the target page is deleted concurrently
        .expression(
          pg
            .selectFrom('Page')
            .select((eb) => ['id as toPageId', eb.val(fromPageId).as('fromPageId')])
            .where('id', '=', addToPageId)
        )
        .onConflict((oc) => oc.doNothing())
        .execute(),
    deleteToPageId &&
      pg
        .deleteFrom('PageBacklink')
        .where('fromPageId', '=', fromPageId)
        .where('toPageId', '=', deleteToPageId)
        .execute()
  ])
}

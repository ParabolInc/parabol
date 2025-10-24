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
        .values({
          toPageId: addToPageId,
          fromPageId
        })
        // conflict possible in a race condition
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

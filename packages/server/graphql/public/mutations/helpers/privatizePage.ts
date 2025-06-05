import {revokeAccessExceptViewer} from '../../../../postgres/helpers/revokeAccessExceptViewer'

// When making private, remove all permissions for this page and all descendants
// Then re-add ownership for the viewer for all descendants
export const privatizePage = async (viewerId: string, pageId: number, sortOrder: string) => {
  await revokeAccessExceptViewer(pageId, viewerId)
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

export type PageLocation = {parentPageId?: string | null; isPrivate?: boolean | null}

const isTopLevelPrivate = (page: PageLocation) => !!page.isPrivate && !page.parentPageId

export const getDuplicateLanding = (
  source: PageLocation,
  copy: PageLocation
): 'nextTo' | 'private' =>
  isTopLevelPrivate(copy) && !isTopLevelPrivate(source) ? 'private' : 'nextTo'

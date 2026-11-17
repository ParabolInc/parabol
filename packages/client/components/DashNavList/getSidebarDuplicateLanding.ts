type PageLocation = {parentPageId?: string | null; isPrivate?: boolean | null}

const isTopLevelPrivate = (page: PageLocation) => !!page.isPrivate && !page.parentPageId

export const getSidebarDuplicateLanding = (source: PageLocation, copy: PageLocation) =>
  isTopLevelPrivate(copy) && !isTopLevelPrivate(source) ? 'private' : 'nextTo'

interface DialogPage {
  readonly access: {readonly public: string | null | undefined}
  readonly syncedBlockPlacements:
    | {
        readonly pages: ReadonlyArray<{
          readonly hiddenReaderCount: number
          readonly page: {
            readonly id: string
            readonly title: string | null | undefined
            readonly access: {readonly public: string | null | undefined}
          }
        }>
      }
    | null
    | undefined
}

export interface UnsyncCopyConfirm {
  title: string
  body: string
}

export type UnsyncCopyCheck =
  | {kind: 'unknown'}
  | {kind: 'safe'}
  | ({kind: 'confirm'} & UnsyncCopyConfirm)

const morePeople = (count: number) => (count === 1 ? '1 more person' : `${count} more people`)
const peopleOn = (count: number, page: string) =>
  `${count === 1 ? '1 person' : `${count} people`} on ${page}`
const unsyncShows = (reader: string) =>
  `Unsyncing puts its text on the page, where ${reader} can read it.`

export const getUnsyncCopyConfirm = (
  page: DialogPage,
  currentPageId: string | undefined
): UnsyncCopyCheck => {
  const row = page.syncedBlockPlacements?.pages.find(({page}) => page.id === currentPageId)
  if (!row) return {kind: 'unknown'}
  const count = row.hiddenReaderCount
  const isLinkOnly = !!row.page.access.public && !page.access.public
  const title = row.page.title || '<Untitled>'
  if (count === 0 && !isLinkOnly) return {kind: 'safe'}
  if (count === 0) {
    return {
      kind: 'confirm',
      title: 'Show this text to anyone with the link?',
      body: `${title} is shared by link, and this block isn't. ${unsyncShows('anyone with the link')}`
    }
  }
  if (!isLinkOnly) {
    return {
      kind: 'confirm',
      title: `Show this text to ${morePeople(count)}?`,
      body: `${peopleOn(count, title)} can't see this block today. ${unsyncShows('they')}`
    }
  }
  return {
    kind: 'confirm',
    title: `Show this text to ${morePeople(count)} and anyone with the link?`,
    body: `${peopleOn(count, title)} can't see this block today, and the page is shared by link. ${unsyncShows('they')}`
  }
}

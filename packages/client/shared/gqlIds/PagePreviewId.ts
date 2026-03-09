import {PageId} from './PageId'

export const PagePreviewId = {
  join: (id: number) => `pagePreview:${PageId.toClient(id).toString()}`,
  split: (id: string): number => PageId.fromClient(Number(id.split(':')[1])),
  /** Signed DB id → unsigned page code (for URLs, YDoc attrs, storage paths) */
  toClient: PageId.toClient,
  /** Unsigned page code → signed DB id */
  fromClient: PageId.fromClient
}

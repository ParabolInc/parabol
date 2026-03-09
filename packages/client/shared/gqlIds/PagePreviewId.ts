import {PageId} from './PageId'

export const PagePreviewId = {
  join: (id: number) => `pagePreview:${PageId.toClient(id).toString()}`,
  split: (id: string): number => PageId.fromClient(Number(id.split(':')[1]))
}

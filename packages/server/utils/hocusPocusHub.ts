import {EventEmitter} from 'tseep'

export const hocusPocusHub = new EventEmitter<{
  insertChildPageLink: (parentPageId: number, childPageId: number) => void
}>()

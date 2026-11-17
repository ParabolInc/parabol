import type Atmosphere from '../Atmosphere'
import {getPageSlug} from '../tiptap/getPageSlug'
import {GQLID} from './GQLID'

const DUPLICATE_PAGE_SNACK_KEY = 'duplicatePage'

type DuplicateTarget = {kind: 'copyTo'; title: string} | {kind: 'private'} | {kind: 'nextTo'}

type Params =
  | {phase: 'start'; title: string}
  | {phase: 'failed'}
  | {
      phase: 'done'
      title: string
      target: DuplicateTarget
      page: {id: string; title?: string | null}
      navigate: (path: string) => void
    }

const getDoneMessage = (title: string, target: DuplicateTarget) => {
  switch (target.kind) {
    case 'copyTo':
      return `Copied to "${target.title}"`
    case 'private':
      return `Copied "${title}" to your Private pages`
    case 'nextTo':
      return null
  }
}

export const showDuplicatePageSnack = (atmosphere: Atmosphere, params: Params) => {
  const {eventEmitter} = atmosphere
  if (params.phase === 'start') {
    eventEmitter.emit('addSnackbar', {
      key: DUPLICATE_PAGE_SNACK_KEY,
      message: `Duplicating "${params.title}"…`,
      autoDismiss: 0
    })
    return
  }
  eventEmitter.emit('removeSnackbar', ({key}) => key === DUPLICATE_PAGE_SNACK_KEY)
  if (params.phase === 'failed') return
  const message = getDoneMessage(params.title, params.target)
  if (!message) return
  const {page, navigate} = params
  const [pageCode] = GQLID.fromKey(page.id)
  eventEmitter.emit('addSnackbar', {
    key: `${DUPLICATE_PAGE_SNACK_KEY}Done`,
    message,
    autoDismiss: 10,
    action: {
      label: 'Open page',
      callback: () => navigate(`/pages/${getPageSlug(pageCode, page.title)}`)
    }
  })
}

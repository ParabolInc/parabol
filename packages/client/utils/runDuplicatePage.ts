import type Atmosphere from '../Atmosphere'
import {snackOnError} from '../mutations/handlers/snackOnError'
import type {DuplicateExecute} from '../mutations/useDuplicatePageMutation'
import {GQLID} from './GQLID'
import {getDuplicateLanding, type PageLocation} from './getDuplicateLanding'
import {showDuplicatePageSnack} from './showDuplicatePageSnack'

export type DuplicateDestination =
  | {kind: 'nextToSource'; source: PageLocation}
  | {kind: 'copyTo'; parentPageId: string; title: string}

type Params = {
  pageCode: number
  title: string
  destination: DuplicateDestination
  execute: DuplicateExecute
  atmosphere: Atmosphere
  navigate: (path: string) => void
}

const showDuplicateError = (atmosphere: Atmosphere, message: string) => {
  showDuplicatePageSnack(atmosphere, {phase: 'failed'})
  atmosphere.eventEmitter.emit('addSnackbar', {key: 'duplicatePageError', message, autoDismiss: 5})
}

export const runDuplicatePage = ({
  pageCode,
  destination,
  execute,
  atmosphere,
  navigate,
  ...params
}: Params) => {
  const title = params.title || 'Untitled'
  showDuplicatePageSnack(atmosphere, {phase: 'start', title})
  execute({
    variables: {
      pageId: GQLID.toKey(pageCode, 'page'),
      parentPageId: destination.kind === 'copyTo' ? destination.parentPageId : undefined
    },
    onError: (error) => {
      showDuplicatePageSnack(atmosphere, {phase: 'failed'})
      snackOnError(atmosphere, 'duplicatePageError')(error)
    },
    onCompleted: (res, errors) => {
      const page = res.duplicatePage?.page
      const firstError = errors?.[0]?.message
      if (firstError || !page) {
        showDuplicateError(atmosphere, firstError ?? 'Could not duplicate the page')
        return
      }
      const target =
        destination.kind === 'copyTo'
          ? {kind: 'copyTo' as const, title: destination.title}
          : {kind: getDuplicateLanding(destination.source, page)}
      showDuplicatePageSnack(atmosphere, {phase: 'done', title, target, page, navigate})
    }
  })
}

import type Atmosphere from '../../../Atmosphere'
import {snackOnError} from '../../../mutations/handlers/snackOnError'
import type {DuplicateExecute} from '../../../mutations/useDuplicatePageMutation'
import {GQLID} from '../../../utils/GQLID'
import {showDuplicatePageSnack} from '../../../utils/showDuplicatePageSnack'

type Params = {
  pageCode: number
  title: string
  currentPageId?: string
  copyTo?: {parentPageId: string; title: string}
  resolveLanding?: (page: {
    parentPageId?: string | null
    isPrivate?: boolean | null
  }) => 'nextTo' | 'private'
  execute: DuplicateExecute
  atmosphere: Atmosphere
  navigate: (path: string) => void
}

export const runDuplicatePage = (params: Params) => {
  const {pageCode, currentPageId, copyTo, resolveLanding, execute, atmosphere, navigate} = params
  const title = params.title || 'Untitled'
  const landing =
    resolveLanding ??
    ((page: {parentPageId?: string | null}) =>
      page.parentPageId === currentPageId ? 'nextTo' : 'private')
  showDuplicatePageSnack(atmosphere, {phase: 'start', title})
  execute({
    variables: {pageId: GQLID.toKey(pageCode, 'page'), parentPageId: copyTo?.parentPageId},
    onError: (error) => {
      showDuplicatePageSnack(atmosphere, {phase: 'failed'})
      snackOnError(atmosphere, 'duplicatePageError')(error)
    },
    onCompleted: (res, errors) => {
      const firstError = errors?.[0]?.message
      const page = res.duplicatePage?.page
      if (firstError || !page) {
        showDuplicatePageSnack(atmosphere, {phase: 'failed'})
        atmosphere.eventEmitter.emit('addSnackbar', {
          key: 'duplicatePageError',
          message: firstError ?? 'Could not duplicate the page',
          autoDismiss: 5
        })
        return
      }
      showDuplicatePageSnack(atmosphere, {
        phase: 'done',
        title,
        target: copyTo ? {kind: 'copyTo', title: copyTo.title} : {kind: landing(page)},
        page,
        navigate
      })
    }
  })
}

import {redisHocusPocus} from '../../../../../hocusPocus'
import {CipherId} from '../../../../../utils/CipherId'
import {Logger} from '../../../../../utils/Logger'
import type {PageCopy} from './buildPageCopies'
import type {DuplicatePlacement} from './getDuplicatePlacement'

export const linkCopyIntoParent = async (placement: DuplicatePlacement, rootCopy: PageCopy) => {
  if (placement.kind !== 'parent') return
  const {parent, afterPageCode} = placement
  await redisHocusPocus
    .handleEvent('addCanonicalPageLink', CipherId.toClient(parent.id, 'page'), {
      title: rootCopy.title,
      pageCode: CipherId.encrypt(rootCopy.id),
      isDatabase: rootCopy.isDatabase,
      isSyncedBlock: false,
      append: afterPageCode === null,
      afterPageCode: afterPageCode ?? undefined
    })
    .catch(Logger.error)
}

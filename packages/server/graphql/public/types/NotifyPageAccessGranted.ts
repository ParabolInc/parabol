import type {NotifyPageAccessGrantedResolvers} from '../resolverTypes'

const NotifyPageAccessGranted: NotifyPageAccessGrantedResolvers = {
  __isTypeOf: ({type}) => type === 'PAGE_ACCESS_GRANTED',
  ownerName: async ({ownerId}, _args, {dataLoader}) => {
    if (!ownerId) return 'Unknown'
    const owner = await dataLoader.get('users').load(ownerId)
    return owner?.preferredName ?? 'Unknown'
  },
  ownerPicture: async ({ownerId}, _args, {dataLoader}) => {
    if (!ownerId) return null
    const owner = await dataLoader.get('users').load(ownerId)
    return owner?.picture ?? null
  },
  page: ({pageId}, _args, {dataLoader}) => dataLoader.get('pages').loadNonNull(pageId)
}

export default NotifyPageAccessGranted

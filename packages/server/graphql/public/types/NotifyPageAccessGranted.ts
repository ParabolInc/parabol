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
  page: async ({pageId}, _args, {dataLoader}) => {
    const page = await dataLoader.get('pages').loadNonNull(pageId)
    return {
      __typename: 'PagePreview',
      ...page
    }
  }
}

export default NotifyPageAccessGranted

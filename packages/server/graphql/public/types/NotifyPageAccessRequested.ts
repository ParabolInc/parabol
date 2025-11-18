import type {NotifyPageAccessRequestedResolvers} from '../resolverTypes'

const NotifyPageAccessRequested: NotifyPageAccessRequestedResolvers = {
  __isTypeOf: ({type}) => type === 'PAGE_ACCESS_REQUESTED',
  name: async ({requestCreatedBy}, _args, {dataLoader}) => {
    const requester = await dataLoader.get('users').load(requestCreatedBy)
    return requester?.preferredName ?? 'Unknown'
  },
  email: async ({requestCreatedBy}, _args, {dataLoader}) => {
    const requester = await dataLoader.get('users').load(requestCreatedBy)
    return requester?.email ?? ''
  },
  picture: async ({requestCreatedBy}, _args, {dataLoader}) => {
    const requester = await dataLoader.get('users').load(requestCreatedBy)
    return requester?.picture ?? null
  },
  page: async ({pageId}, _args, {dataLoader}) => {
    const page = await dataLoader.get('pages').loadNonNull(pageId)
    return {
      __typename: 'PagePreview',
      ...page
    }
  }
}

export default NotifyPageAccessRequested

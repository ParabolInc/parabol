import {feistelCipher} from '../../../utils/feistelCipher'
import {PageResolvers} from '../resolverTypes'

const Page: PageResolvers = {
  id: ({id}) => `page:${feistelCipher.encrypt(id)}`,
  isPrivate: async ({id, isPrivate}, _args, {dataLoader}) => {
    if (typeof isPrivate === 'boolean') return isPrivate
    return await dataLoader.get('pagePrivacy').load(id)
  },
  access: ({id}) => ({id}),
  parentPage: async ({parentPageId}, _args, {dataLoader}) => {
    if (!parentPageId) return null
    const parentPage = await dataLoader.get('pages').load(parentPageId)
    return parentPage || null
  },
  parentPageId: ({parentPageId}) =>
    parentPageId ? `page:${feistelCipher.encrypt(parentPageId)}` : null
}

export default Page

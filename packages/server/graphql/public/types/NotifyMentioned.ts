import {NotifyMentionedResolvers} from '../resolverTypes'

const NotifyMentioned: NotifyMentionedResolvers = {
  __isTypeOf: ({type}) => type === 'MENTIONED',
  retroReflection: async ({retroReflectionId}, _args, {dataLoader}) => {
    if (!retroReflectionId) return null
    return dataLoader.get('retroReflections').loadNonNull(retroReflectionId)
  },
  senderPicture: async ({senderPicture}, _args, {dataLoader}) => {
    if (!senderPicture) return null
    return dataLoader.get('fileStoreAsset').load(senderPicture)
  }
}

export default NotifyMentioned

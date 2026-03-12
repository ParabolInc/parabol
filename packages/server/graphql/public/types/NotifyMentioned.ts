import type {NotifyMentionedResolvers} from '../resolverTypes'

const NotifyMentioned: NotifyMentionedResolvers = {
  __isTypeOf: ({type}) => type === 'MENTIONED',
  retroReflection: async ({retroReflectionId}, _args, {dataLoader}) => {
    if (!retroReflectionId) return null
    return dataLoader.get('retroReflections').loadNonNull(retroReflectionId)
  }
}

export default NotifyMentioned

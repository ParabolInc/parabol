import {NotifyMentionedResolvers} from '../resolverTypes'

const NotifyMentioned: NotifyMentionedResolvers = {
  __isTypeOf: ({type}) => type === 'MENTIONED',
  retroReflection: async ({retroReflectionId}, _args, {dataLoader}) => {
    if (!retroReflectionId) return null
    return dataLoader.get('retroReflections').load(retroReflectionId) as any // TODO: fix type
  }
}

export default NotifyMentioned

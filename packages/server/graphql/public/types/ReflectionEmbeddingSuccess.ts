import type {ReflectionEmbeddingSuccessResolvers} from '../resolverTypes'

export type ReflectionEmbeddingSuccessSource = {
  reflectionId: string
}

const ReflectionEmbeddingSuccess: ReflectionEmbeddingSuccessResolvers = {
  reflection: ({reflectionId}, _args, {dataLoader}) => {
    return dataLoader.get('retroReflections').loadNonNull(reflectionId)
  }
}

export default ReflectionEmbeddingSuccess

import type {CreatePersonalAccessTokenPayloadResolvers} from '../resolverTypes'

export type CreatePersonalAccessTokenPayloadSource = {
  token: string
  patId: string
}

const CreatePersonalAccessTokenPayload: CreatePersonalAccessTokenPayloadResolvers = {
  token: (source) => `pat_${source.token}`,
  personalAccessToken: async ({patId}, _args, {dataLoader}) => {
    return dataLoader.get('personalAccessTokens').loadNonNull(patId)
  }
}

export default CreatePersonalAccessTokenPayload

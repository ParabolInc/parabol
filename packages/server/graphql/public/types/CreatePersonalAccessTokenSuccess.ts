import type {CreatePersonalAccessTokenSuccessResolvers} from '../resolverTypes'

export type CreatePersonalAccessTokenSuccessSource = {
  token: string
  patId: string
}

const CreatePersonalAccessTokenSuccess: CreatePersonalAccessTokenSuccessResolvers = {
  token: (source) => `pat_${source.token}`,
  personalAccessToken: async ({patId}, _args, {dataLoader}) => {
    return dataLoader.get('personalAccessTokens').loadNonNull(patId)
  }
}

export default CreatePersonalAccessTokenSuccess

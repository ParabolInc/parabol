import type {UpdatePersonalAccessTokenSuccessResolvers} from '../resolverTypes'

export type UpdatePersonalAccessTokenSuccessSource = {
  patId: string
}

const UpdatePersonalAccessTokenSuccess: UpdatePersonalAccessTokenSuccessResolvers = {
  personalAccessToken: async ({patId}, _args, {dataLoader}) => {
    return dataLoader.get('personalAccessTokens').loadNonNull(patId)
  }
}

export default UpdatePersonalAccessTokenSuccess

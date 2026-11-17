import type {UpdatePersonalAccessTokenPayloadResolvers} from '../resolverTypes'

export type UpdatePersonalAccessTokenPayloadSource = {
  patId: string
}

const UpdatePersonalAccessTokenPayload: UpdatePersonalAccessTokenPayloadResolvers = {
  personalAccessToken: async ({patId}, _args, {dataLoader}) => {
    return dataLoader.get('personalAccessTokens').loadNonNull(patId)
  }
}

export default UpdatePersonalAccessTokenPayload

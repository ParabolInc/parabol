import type {PersonalAccessToken} from '../../../postgres/types'
import type {CreatePersonalAccessTokenSuccessResolvers} from '../resolverTypes'

export type CreatePersonalAccessTokenSuccessSource = {
  token: string
  pat: PersonalAccessToken
}

const CreatePersonalAccessTokenSuccess: CreatePersonalAccessTokenSuccessResolvers = {
  token: (source) => `pat_${source.token}`,
  personalAccessToken: (source) => source.pat
}

export default CreatePersonalAccessTokenSuccess

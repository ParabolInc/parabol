import {selectPersonalAccessToken} from '../../../postgres/select'
import type {CreatePersonalAccessTokenSuccessResolvers} from '../resolverTypes'

export type CreatePersonalAccessTokenSuccessSource = {
  token: string
  patId: string
}

const CreatePersonalAccessTokenSuccess: CreatePersonalAccessTokenSuccessResolvers = {
  token: (source) => `pat_${source.token}`,
  personalAccessToken: async ({patId}) => {
    return selectPersonalAccessToken().where('id', '=', patId).executeTakeFirstOrThrow()
  }
}

export default CreatePersonalAccessTokenSuccess

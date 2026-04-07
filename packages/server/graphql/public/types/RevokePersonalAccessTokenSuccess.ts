import {selectPersonalAccessToken} from '../../../postgres/select'
import type {RevokePersonalAccessTokenSuccessResolvers} from '../resolverTypes'

export type RevokePersonalAccessTokenSuccessSource = {
  patId: string
}

const RevokePersonalAccessTokenSuccess: RevokePersonalAccessTokenSuccessResolvers = {
  personalAccessToken: async ({patId}) => {
    return await selectPersonalAccessToken().where('id', '=', patId).executeTakeFirstOrThrow()
  }
}

export default RevokePersonalAccessTokenSuccess

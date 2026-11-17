import isValid from '../../isValid'
import type {UpdateCreditCardPayloadResolvers} from '../resolverTypes'

export type UpdateCreditCardPayloadSource = {
  orgId: string
  teamIds: string[]
}

const UpdateCreditCardPayload: UpdateCreditCardPayloadResolvers = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(orgId)
  },
  teamsUpdated: async ({teamIds}, _args, {dataLoader}) => {
    const teams = await dataLoader.get('teams').loadMany(teamIds)
    return teams.filter(isValid)
  }
}

export default UpdateCreditCardPayload

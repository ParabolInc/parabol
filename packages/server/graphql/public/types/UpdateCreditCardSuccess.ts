import isValid from '../../isValid'
import {UpdateCreditCardSuccessResolvers} from '../resolverTypes'

export type UpdateCreditCardSuccessSource = {
  orgId: string
  teamIds: string[]
}

const UpdateCreditCardSuccess: UpdateCreditCardSuccessResolvers = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(orgId)
  },
  teamsUpdated: async ({teamIds}, _args, {dataLoader}) => {
    const teams = await dataLoader.get('teams').loadMany(teamIds)
    return teams.filter(isValid)
  }
}

export default UpdateCreditCardSuccess

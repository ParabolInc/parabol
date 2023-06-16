// import {UpdateCreditCardSuccessResolvers} from '../resolverTypes'

export type UpdateCreditCardSuccessSource = {
  orgId: string
  teamIds: string[]
}

const UpdateCreditCardSuccess = {
  // const UpdateCreditCardSuccess: UpdateCreditCardSuccessResolvers = {
  organization: async ({id}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').load(id)
  },
  teamsUpdated: async ({teamIds}, _args, {dataLoader}) => {
    return dataLoader.get('teamsByOrgIds').loadMany(teamIds)
  }
}

export default UpdateCreditCardSuccess

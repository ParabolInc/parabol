import type {SetTeamStructureSuccessResolvers} from '../resolverTypes'

export type SetTeamStructureSuccessSource = {
  orgId: string
}

const SetTeamStructureSuccess: SetTeamStructureSuccessResolvers = {
  organization: ({orgId}, _args, {dataLoader}) => dataLoader.get('organizations').loadNonNull(orgId)
}

export default SetTeamStructureSuccess

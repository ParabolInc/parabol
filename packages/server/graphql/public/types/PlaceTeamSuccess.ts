import type {PlaceTeamSuccessResolvers} from '../resolverTypes'

export type PlaceTeamSuccessSource = {
  orgId: string
}

const PlaceTeamSuccess: PlaceTeamSuccessResolvers = {
  organization: ({orgId}, _args, {dataLoader}) => dataLoader.get('organizations').loadNonNull(orgId)
}

export default PlaceTeamSuccess

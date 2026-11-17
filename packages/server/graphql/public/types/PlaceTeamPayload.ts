import type {PlaceTeamPayloadResolvers} from '../resolverTypes'

export type PlaceTeamPayloadSource = {
  orgId: string
}

const PlaceTeamPayload: PlaceTeamPayloadResolvers = {
  organization: ({orgId}, _args, {dataLoader}) => dataLoader.get('organizations').loadNonNull(orgId)
}

export default PlaceTeamPayload

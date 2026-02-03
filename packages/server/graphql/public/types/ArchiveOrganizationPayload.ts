import isValid from '../../isValid'
import type {ArchiveOrganizationPayloadResolvers} from '../resolverTypes'

export type ArchiveOrganizationPayloadSource =
  | {
      orgId: string
      teamIds: string[]
      removedSuggestedActionIds: string[]
    }
  | {error: {message: string}}

const ArchiveOrganizationPayload: ArchiveOrganizationPayloadResolvers = {
  teams: async (source, _args, {dataLoader}) => {
    if ('teamIds' in source) {
      const teams = await dataLoader.get('teams').loadMany(source.teamIds)
      return teams.filter(isValid)
    }
    return null
  }
}

export default ArchiveOrganizationPayload

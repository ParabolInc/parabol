import isValid from '../../isValid'
import type {DowngradeToStarterPayloadResolvers} from '../resolverTypes'

export type DowngradeToStarterPayloadSource = {orgId: string; teamIds: string[]}

const DowngradeToStarterPayload: DowngradeToStarterPayloadResolvers = {
  organization: (source, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(source.orgId)
  },
  teams: async (source, _args, {dataLoader}) => {
    return (await dataLoader.get('teams').loadMany(source.teamIds)).filter(isValid)
  }
}

export default DowngradeToStarterPayload

import type {SetJiraDisplayFieldIdsPayloadResolvers} from '../resolverTypes'

export type SetJiraDisplayFieldIdsPayloadSource = {
  teamId: string
}

const SetJiraDisplayFieldIdsPayload: SetJiraDisplayFieldIdsPayloadResolvers = {
  team: async ({teamId}, _args, {dataLoader}) => {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    return team
  }
}

export default SetJiraDisplayFieldIdsPayload

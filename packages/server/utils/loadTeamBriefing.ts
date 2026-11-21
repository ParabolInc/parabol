import type {DataLoaderInstance} from '../dataloader/RootDataLoader'

/**
 * The background a team's retrospectives taught us about it: its people, projects, systems and jargon.
 * Written for suggested grouping, where it was measured, and given to every other AI suggestion about
 * the team as context. Null until one of the team's retros has ended.
 */
const loadTeamBriefing = async (teamId: string, dataLoader: DataLoaderInstance) => {
  const teamDetail = await dataLoader.get('teamDetails').load(teamId)
  return teamDetail?.groupingBriefing ?? null
}

export default loadTeamBriefing

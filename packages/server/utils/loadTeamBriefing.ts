import type {DataLoaderInstance} from '../dataloader/RootDataLoader'

const loadTeamBriefing = async (teamId: string, dataLoader: DataLoaderInstance) => {
  const teamDetail = await dataLoader.get('teamDetails').load(teamId)
  return teamDetail?.groupingBriefing ?? null
}

export default loadTeamBriefing

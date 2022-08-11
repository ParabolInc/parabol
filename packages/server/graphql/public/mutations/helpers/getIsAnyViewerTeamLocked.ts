import {DataLoaderWorker} from '../../../graphql'
import isValid from '../../../isValid'

const getIsAnyViewerTeamLocked = async (tms: string[], dataLoader: DataLoaderWorker) => {
  const viewerTeams = await dataLoader.get('teams').loadMany(tms)
  return viewerTeams.filter(isValid).some(({isPaid}) => !isPaid)
}

export default getIsAnyViewerTeamLocked

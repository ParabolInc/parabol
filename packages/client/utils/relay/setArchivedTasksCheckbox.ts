import {commitLocalUpdate} from 'react-relay'
import {ITeam} from '../../types/graphql'
import Atmosphere from '../../Atmosphere'

const setArchivedTasksCheckbox = (
  atmosphere: Atmosphere,
  teamId: string,
  showArchivedTasksCheckbox: boolean
) => {
  commitLocalUpdate(atmosphere, (store) => {
    const team = store.get<ITeam>(teamId)
    if (!team) return
    team.setValue(showArchivedTasksCheckbox, 'showArchivedTasksCheckbox')
  })
}

export default setArchivedTasksCheckbox

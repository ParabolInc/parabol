import useAtmosphere from './useAtmosphere'
import {useCallback} from 'react'
import {commitLocalUpdate} from 'relay-runtime'

export const useToggleSidebar = (teamId: string) => {
  const atmosphere = useAtmosphere()
  return useCallback(() => {
    commitLocalUpdate(atmosphere, (store) => {
      const team = store.get(teamId)
      if (!team) return
      const val = team.getValue('isMeetingSidebarCollapsed')
      team.setValue(!val, 'isMeetingSidebarCollapsed')
    })
  }, [atmosphere, teamId])
}

export default useToggleSidebar

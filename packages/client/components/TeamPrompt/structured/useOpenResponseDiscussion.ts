import {useCallback} from 'react'
import {commitLocalUpdate} from 'react-relay'
import useAtmosphere from '../../../hooks/useAtmosphere'

const useOpenResponseDiscussion = (
  meetingId: string,
  rightDrawerOpen: string | null,
  localStageId: string | null
) => {
  const atmosphere = useAtmosphere()
  return useCallback(
    (stageId: string) => {
      const isOpenForStage = rightDrawerOpen === 'discussion' && localStageId === stageId
      commitLocalUpdate(atmosphere, (store) => {
        const proxy = store.get(meetingId)
        if (!proxy) return
        if (isOpenForStage) {
          proxy.setValue(null, 'rightDrawerOpen')
        } else {
          proxy.setValue(stageId, 'localStageId')
          proxy.setValue('discussion', 'rightDrawerOpen')
        }
      })
    },
    [atmosphere, meetingId, rightDrawerOpen, localStageId]
  )
}

export default useOpenResponseDiscussion

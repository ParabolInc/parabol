import {useCallback} from 'react'
import {useDispatch} from 'react-redux'
import {addTeamToChannel} from '../reducers'
import {useCurrentChannel} from './useCurrentChannel'

export const useLinkTeam = () => {
  const dispatch = useDispatch()
  const currentChannel = useCurrentChannel()

  const linkTeam = useCallback(
    async (teamId: string) => {
      dispatch(addTeamToChannel({channel: currentChannel.id, teamId}))
    },
    [currentChannel.id, dispatch]
  )

  return linkTeam
}

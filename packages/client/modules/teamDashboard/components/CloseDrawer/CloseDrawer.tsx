import React from 'react'
import ToggleTeamDrawerMutation from '../../../../mutations/ToggleTeamDrawerMutation'
import IconButton from '../../../../components/IconButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import {TeamDrawer} from '~/__generated__/ToggleTeamDrawerMutation.graphql'

interface Props {
  teamDrawerType: TeamDrawer | null
  teamId: string
}

const CloseDrawer = (props: Props) => {
  const {teamDrawerType, teamId} = props
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const toggleHide = () => {
    if (!submitting) {
      submitMutation()
      ToggleTeamDrawerMutation(
        atmosphere,
        {teamId, teamDrawerType: teamDrawerType || 'agenda'},
        {onError, onCompleted}
      )
    }
  }
  return <IconButton icon={'close'} onClick={toggleHide} palette='midGray' />
}

export default CloseDrawer

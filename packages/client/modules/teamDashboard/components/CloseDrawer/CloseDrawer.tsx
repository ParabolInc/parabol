import React from 'react'
import IconButton from '../../../../components/IconButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import ToggleTeamDrawerMutation from '../../../../mutations/ToggleTeamDrawerMutation'

interface Props {
  teamId: string
}

const CloseDrawer = (props: Props) => {
  const {teamId} = props
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const toggleHide = () => {
    if (!submitting) {
      submitMutation()
      ToggleTeamDrawerMutation(atmosphere, {teamId, teamDrawerType: null}, {onError, onCompleted})
    }
  }
  return <IconButton icon={'close'} onClick={toggleHide} palette='midGray' />
}

export default CloseDrawer

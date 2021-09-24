import React from 'react'
import ToggleTeamDrawerMutation from '../../../../mutations/ToggleTeamDrawerMutation'
import IconButton from '../../../../components/IconButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import {DrawerTypes} from '~/types/constEnums'

interface Props {
  teamDrawerType: DrawerTypes | null
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
        {teamId, teamDrawerType: teamDrawerType || DrawerTypes.AGENDA},
        {onError, onCompleted}
      )
    }
  }
  return <IconButton icon={'close'} onClick={toggleHide} palette='midGray' />
}

export default CloseDrawer

import React from 'react'
import ToggleAgendaListMutation from '../../../../mutations/ToggleAgendaListMutation'
import ToggleManageTeamMutation from '../../../../mutations/ToggleManageTeamMutation'
import IconButton from '../../../../components/IconButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'

interface Props {
  isAgenda?: boolean
  teamId: string
}

const CloseSidebar = (props: Props) => {
  const {isAgenda, teamId} = props
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const toggleHide = () => {
    if (!submitting) {
      submitMutation()
      if (isAgenda) {
        ToggleAgendaListMutation(atmosphere, teamId, onError, onCompleted)
      } else {
        ToggleManageTeamMutation(atmosphere, {teamId}, {onError, onCompleted})
      }
    }
  }
  return <IconButton icon={'close'} iconLarge onClick={toggleHide} palette='midGray' />
}

export default CloseSidebar

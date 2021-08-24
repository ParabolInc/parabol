import React from 'react'
import ToggleAgendaListMutation from '../../../../mutations/ToggleAgendaListMutation'
import IconButton from '../../../../components/IconButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'

interface Props {
  hideAgenda?: boolean
  teamId: string
}

const CloseAgenda = (props: Props) => {
  const {hideAgenda, teamId} = props
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const toggleHide = () => {
    if (!submitting) {
      submitMutation()
      ToggleAgendaListMutation(atmosphere, teamId, onError, onCompleted)
    }
  }
  return (
    <IconButton
      key={`agendaControl${hideAgenda ? 'Show' : 'Hide'}`}
      icon={'close'}
      iconLarge
      onClick={toggleHide}
      palette='midGray'
    />
  )
}

export default CloseAgenda

import React from 'react'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import ToggleAgendaListMutation from '../../../../mutations/ToggleAgendaListMutation'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'
import {CompletedHandler, ErrorHandler} from '../../../../types/relayMutations'
import IconButton from '../../../../components/IconButton'

interface Props extends WithMutationProps, WithAtmosphereProps {
  hideAgenda?: boolean
  onCompleted: CompletedHandler
  onError: ErrorHandler
  teamId: string
}

const CloseAgenda = (props: Props) => {
  const {atmosphere, hideAgenda, submitMutation, submitting, onError, onCompleted, teamId} = props
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

export default withMutationProps(withAtmosphere(CloseAgenda))

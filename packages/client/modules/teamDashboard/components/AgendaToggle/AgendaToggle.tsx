import styled from '@emotion/styled'
import React from 'react'
import FlatButton from '../../../../components/FlatButton'
import IconLabel from '../../../../components/IconLabel'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import ToggleAgendaListMutation from '../../../../mutations/ToggleAgendaListMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import {CompletedHandler, ErrorHandler} from '../../../../types/relayMutations'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'

const StyledButton = styled(FlatButton)({
  color: PALETTE.SKY_500,
  fontWeight: 600,
  lineHeight: 1.1,
  padding: '0 8px',
  ':hover, :focus, :active': {
    color: PALETTE.SKY_600
  }
})

const Label = styled('div')({
  fontSize: 12,
  fontWeight: 600,
  color: PALETTE.SLATE_700
})

interface Props extends WithMutationProps, WithAtmosphereProps {
  onCompleted: CompletedHandler
  onError: ErrorHandler
  teamId: string
}

const AgendaToggle = (props: Props) => {
  const {atmosphere, submitMutation, submitting, onError, onCompleted, teamId} = props
  const toggleHide = () => {
    if (!submitting) {
      submitMutation()
      ToggleAgendaListMutation(atmosphere, teamId, onError, onCompleted)
    }
  }
  return (
    <StyledButton onClick={toggleHide}>
      <IconLabel icon='chat' iconLarge label={<Label>Agenda</Label>} labelBelow />
    </StyledButton>
  )
}

export default withMutationProps(withAtmosphere(AgendaToggle))

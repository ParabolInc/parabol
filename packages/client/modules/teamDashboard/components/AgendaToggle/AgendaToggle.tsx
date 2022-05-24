import styled from '@emotion/styled'
import React from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import ToggleTeamDrawerMutation from '~/mutations/ToggleTeamDrawerMutation'
import Icon from '../../../../components/Icon'
import {PALETTE} from '../../../../styles/paletteV3'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {CompletedHandler, ErrorHandler} from '../../../../types/relayMutations'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'

const Label = styled('div')({
  fontSize: 12,
  fontWeight: 600,
  lineHeight: '16px',
  color: PALETTE.SLATE_700,
  textAlign: 'center'
})

const StyledIcon = styled(Icon)({
  color: PALETTE.SKY_500,
  fontSize: ICON_SIZE.MD24,
  alignSelf: 'center'
})

const IconWrapper = styled('div')({
  height: 28,
  display: 'flex',
  justifyContent: 'center'
})

const Wrapper = styled('div')({
  margin: '0 6px',
  ':hover': {
    cursor: 'pointer'
  },
  ':hover i': {
    color: PALETTE.SKY_600
  }
})

interface Props extends WithMutationProps {
  onCompleted: CompletedHandler
  onError: ErrorHandler
  teamId: string
}

const AgendaToggle = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {submitMutation, submitting, onError, onCompleted, teamId} = props
  const toggleHide = () => {
    if (!submitting) {
      submitMutation()
      ToggleTeamDrawerMutation(
        atmosphere,
        {teamId, teamDrawerType: 'agenda'},
        {onError, onCompleted}
      )
    }
  }
  return (
    <Wrapper onClick={toggleHide}>
      <IconWrapper>
        <StyledIcon>chat</StyledIcon>
      </IconWrapper>
      <Label>Agenda</Label>
    </Wrapper>
  )
}

export default withMutationProps(AgendaToggle)

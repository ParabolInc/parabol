import React from 'react'
import withAtmosphere, {WithAtmosphereProps} from '../../../../decorators/withAtmosphere/withAtmosphere'
import ToggleAgendaListMutation from '../../../../mutations/ToggleAgendaListMutation'
import {Breakpoint, Gutters} from '../../../../types/constEnums'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'
import {CompletedHandler, ErrorHandler} from '../../../../types/relayMutations'
import styled from '@emotion/styled'
import {AGENDA_ITEM_LABEL} from '../../../../utils/constants'
import OutlinedButton from '../../../../components/OutlinedButton'
import FlatButton from '../../../../components/FlatButton'
import IconLabel from '../../../../components/IconLabel'

const RootBlock = styled('div')({
  alignItems: 'flex-end',
  display: 'flex',
  padding: `16px ${Gutters.DASH_GUTTER_SMALL}`,
  width: '100%',

  [`@media (min-width: ${Breakpoint.DASHBOARD_WIDE})`]: {
    padding: `16px ${Gutters.DASH_GUTTER_SMALL}`
  }
})

interface Props extends WithMutationProps, WithAtmosphereProps {
  hideAgenda?: boolean
  onCompleted: CompletedHandler
  onError: ErrorHandler
  teamId: string
}

const AgendaToggle = (props: Props) => {
  const {atmosphere, hideAgenda, submitMutation, submitting, onError, onCompleted, teamId} = props
  const toggleHide = () => {
    if (!submitting) {
      submitMutation()
      ToggleAgendaListMutation(atmosphere, teamId, onError, onCompleted)
    }
  }
  const label = `${hideAgenda ? 'See' : 'Hide'} ${AGENDA_ITEM_LABEL}s`
  const ToggleButton = hideAgenda ? OutlinedButton : FlatButton
  return (
    <RootBlock>
      <ToggleButton
        key={`agendaToggleTo${hideAgenda ? 'Show' : 'Hide'}`}
        onClick={toggleHide}
        palette={hideAgenda ? 'warm' : 'mid'}
        style={{width: '100%'}}
      >
        <IconLabel icon='comment' label={label} />
      </ToggleButton>
    </RootBlock>
  )
}

export default withMutationProps(withAtmosphere(AgendaToggle))

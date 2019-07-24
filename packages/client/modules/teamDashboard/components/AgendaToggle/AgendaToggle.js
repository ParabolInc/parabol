import PropTypes from 'prop-types'
import React from 'react'
import withAtmosphere from '../../../../decorators/withAtmosphere/withAtmosphere'
import ToggleAgendaListMutation from '../../../../mutations/ToggleAgendaListMutation'
import ui from '../../../../styles/ui'
import withMutationProps from '../../../../utils/relay/withMutationProps'
import styled from '@emotion/styled'
import {AGENDA_ITEM_LABEL} from '../../../../utils/constants'
import OutlinedButton from '../../../../components/OutlinedButton'
import FlatButton from '../../../../components/FlatButton'
import IconLabel from '../../../../components/IconLabel'

const RootBlock = styled('div')({
  alignItems: 'flex-end',
  display: 'flex',
  padding: `1rem ${ui.dashGutterSmall}`,
  width: '100%',

  [ui.dashBreakpoint]: {
    padding: `1rem ${ui.dashGutterLarge}`
  }
})

const AgendaToggle = (props) => {
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

AgendaToggle.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  hideAgenda: PropTypes.bool,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  teamId: PropTypes.string
}

export default withMutationProps(withAtmosphere(AgendaToggle))

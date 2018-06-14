import PropTypes from 'prop-types'
import React from 'react'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import ToggleAgendaListMutation from 'universal/mutations/ToggleAgendaListMutation'
import ui from 'universal/styles/ui'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import styled from 'react-emotion'
import {AGENDA_ITEM_LABEL} from 'universal/utils/constants'
import Button from 'universal/components/Button/Button'

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
  return (
    <RootBlock>
      <Button
        buttonSize='small'
        buttonStyle={hideAgenda ? 'outlined' : 'flat'}
        colorPalette={hideAgenda ? 'warm' : 'mid'}
        icon='comments'
        isBlock
        key={`agendaToggleTo${hideAgenda ? 'Show' : 'Hide'}`}
        label={label}
        onClick={toggleHide}
      />
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

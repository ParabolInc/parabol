/**
 * Display a pop-up to show help content per meeting phase.
 *
 * @flow
 */

import React from 'react'
import styled from 'react-emotion'
import LoadableMeetingHelpDialogMenu from 'universal/modules/meeting/components/MeetingHelpDialog/LoadableMeetingHelpDialogMenu'
import LoadableMenu from 'universal/components/LoadableMenu'
import RaisedButton from 'universal/components/RaisedButton'
import IconLabel from 'universal/components/IconLabel'

type Props = {
  meetingType: string,
  phase: string
}

const StyledButton = styled(RaisedButton)({
  paddingLeft: 0,
  paddingRight: 0,
  width: '2rem'
})

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const targetAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const MeetingHelpDialog = ({meetingType, phase}: Props) => {
  const iconButtonToggle = (
    <StyledButton palette='white' depth={2}>
      <IconLabel icon='question' />
    </StyledButton>
  )

  return (
    <LoadableMenu
      LoadableComponent={LoadableMeetingHelpDialogMenu}
      maxWidth={280}
      maxHeight={320}
      originAnchor={originAnchor}
      queryVars={{meetingType, phase}}
      targetAnchor={targetAnchor}
      toggle={iconButtonToggle}
    />
  )
}

export default MeetingHelpDialog

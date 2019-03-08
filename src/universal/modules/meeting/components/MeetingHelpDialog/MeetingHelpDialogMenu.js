// @flow
import React from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import {actionPhaseHelpLookup} from 'universal/utils/meetings/helpLookups'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'

type Props = {
  closePortal: () => void,
  meetingType: string,
  phase: string
}

const DialogContent = styled('div')({
  fontSize: appTheme.typography.s2,
  lineHeight: '1.5',
  position: 'relative',
  padding: '1.25rem 1.25rem .75rem',
  width: '15rem',
  '& h3': {
    fontSize: '1em',
    fontWeight: 600,
    margin: '0 0 1em'
  },
  '& p': {
    margin: '0 0 1em'
  },
  '& a': {
    textDecoration: 'underline'
  }
})

const DialogClose = styled(Icon)({
  color: ui.palette.midGray,
  cursor: 'pointer',
  fontSize: MD_ICONS_SIZE_18,
  position: 'absolute',
  right: '.25rem',
  top: '-.25rem',
  '&:hover': {
    opacity: '.5'
  }
})

const MeetingHelpDialogMenu = (props: Props) => {
  const {closePortal, phase} = props
  const phaseLabel = phaseLabelLookup[phase]

  return (
    <DialogContent>
      <DialogClose onClick={closePortal} title="Close help menu">
        close
      </DialogClose>
      {phaseLabel && <h3>{phaseLabel}</h3>}
      {actionPhaseHelpLookup[phase]}
    </DialogContent>
  )
}

export default MeetingHelpDialogMenu

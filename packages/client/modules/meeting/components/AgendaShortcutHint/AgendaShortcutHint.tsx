import React from 'react'
import {AGENDA_ITEM_LABEL} from '../../../../utils/constants'
import MeetingCopy from '../MeetingCopy/MeetingCopy'

const AgendaShortcutHint = () => {
  return (
    <MeetingCopy>
      {'Press “'}
      <b>{'+'}</b>
      {`” to add an ${AGENDA_ITEM_LABEL} to the left column.`}
    </MeetingCopy>
  )
}

export default AgendaShortcutHint

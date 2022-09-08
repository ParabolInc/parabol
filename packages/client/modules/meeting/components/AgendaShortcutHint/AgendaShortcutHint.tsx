import React from 'react'
import {useTranslation} from 'react-i18next'
import {AGENDA_ITEM_LABEL} from '../../../../utils/constants'
import MeetingCopy from '../MeetingCopy/MeetingCopy'

const AgendaShortcutHint = () => {
  const {t} = useTranslation()

  return (
    <MeetingCopy>
      {t('AgendaShortcutHint.Press')}
      <b>{'+'}</b>
      {t('AgendaShortcutHint.ToAddAnAgendaItemLabelToTheLeftColumn', {
        agendaItemLabel: AGENDA_ITEM_LABEL
      })}
    </MeetingCopy>
  )
}

export default AgendaShortcutHint

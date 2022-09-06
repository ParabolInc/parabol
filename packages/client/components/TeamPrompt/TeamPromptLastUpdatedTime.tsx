import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import useRefreshInterval from '~/hooks/useRefreshInterval'
import {MenuPosition} from '../../hooks/useCoords'
import useTooltip from '../../hooks/useTooltip'
import {PALETTE} from '../../styles/paletteV3'
import absoluteDate from '../../utils/date/absoluteDate'
import relativeDate from '../../utils/date/relativeDate'

const Timestamp = styled('div')({
  color: PALETTE.SLATE_600,
  fontWeight: 600,
  fontSize: 12
})
const Hover = styled('span')({
  cursor: 'pointer'
})

interface Props {
  createdAt: string | Date
  updatedAt: string | Date
}

const RELATIVE_DATES_UPDATE_INTERVAL_MS = 1000

export default function TeamPromptLastUpdatedTime({updatedAt, createdAt}: Props) {
  const {t} = useTranslation()

  useRefreshInterval(RELATIVE_DATES_UPDATE_INTERVAL_MS)

  const {
    tooltipPortal: createdTimePortal,
    openTooltip: showCreatedTime,
    closeTooltip: closeCreatedTime,
    originRef: createdTimeRef
  } = useTooltip<HTMLButtonElement>(MenuPosition.UPPER_CENTER)
  const {
    tooltipPortal: updatedTimePortal,
    openTooltip: showUpdatedTime,
    closeTooltip: closeUpdatedTime,
    originRef: updatedTimeRef
  } = useTooltip<HTMLButtonElement>(MenuPosition.UPPER_CENTER)

  const isEdited = createdAt !== updatedAt
  return (
    <Timestamp>
      <Hover onMouseEnter={showCreatedTime} onMouseLeave={closeCreatedTime} ref={createdTimeRef}>
        {relativeDate(createdAt)}
        {createdTimePortal(absoluteDate(createdAt))}
      </Hover>
      {isEdited && (
        <Hover onMouseEnter={showUpdatedTime} onMouseLeave={closeUpdatedTime} ref={updatedTimeRef}>
          {t('TeamPromptLastUpdatedTime.Edited')}
          {updatedTimePortal(absoluteDate(updatedAt))}
        </Hover>
      )}
    </Timestamp>
  )
}

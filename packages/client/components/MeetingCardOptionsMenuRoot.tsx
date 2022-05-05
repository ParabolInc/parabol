import React, {Suspense} from 'react'
import {MenuProps} from '../hooks/useMenu'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import meetingCardOptionsMenuQuery, {
  MeetingCardOptionsMenuQuery
} from '../__generated__/MeetingCardOptionsMenuQuery.graphql'
import MeetingCardOptionsMenu from './MeetingCardOptionsMenu'

interface Props {
  meetingId: string
  teamId: string
  menuProps: MenuProps
  popTooltip: () => void
}

const MeetingCardOptionsMenuRoot = (props: Props) => {
  const {meetingId, teamId, menuProps, popTooltip} = props
  const queryRef = useQueryLoaderNow<MeetingCardOptionsMenuQuery>(meetingCardOptionsMenuQuery, {
    meetingId,
    teamId
  })
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <MeetingCardOptionsMenu queryRef={queryRef} menuProps={menuProps} popTooltip={popTooltip} />
      )}
    </Suspense>
  )
}

export default MeetingCardOptionsMenuRoot

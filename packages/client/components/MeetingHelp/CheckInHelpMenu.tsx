import React from 'react'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuHeader from './HelpMenuHeader'
import HelpMenuLink from './HelpMenuLink'
import useSegmentTrack from '../../hooks/useSegmentTrack'
import {
  MeetingTypeEnum,
  NewMeetingPhaseTypeEnum,
  SegmentClientEventEnum
} from '../../types/graphql'
import {CHECKIN} from '../../utils/constants'
import {phaseLabelLookup} from '../../utils/meetings/lookups'

const linkLookup = {
  [MeetingTypeEnum.action]:
    'https://www.parabol.co/getting-started-guide/action-meetings-101#social-check-in',
  [MeetingTypeEnum.retrospective]:
    'https://www.parabol.co/getting-started-guide/retrospective-meetings-101#social-check-in'
}

interface Props {
  meetingType: string
}

const CheckInHelpMenu = (props: Props) => {
  const {meetingType} = props
  useSegmentTrack(SegmentClientEventEnum.HelpMenuOpen, {phase: NewMeetingPhaseTypeEnum.checkin})
  return (
    <HelpMenuContent>
      <HelpMenuHeader>{phaseLabelLookup[CHECKIN]}</HelpMenuHeader>
      <HelpMenuCopy>
        {
          'The Social Check-In is an opportunity to quickly share some personal context with your team.'
        }
      </HelpMenuCopy>
      <HelpMenuCopy>
        {'Avoid cross-talk so that everybody can have uninterrupted airtime.'}
      </HelpMenuCopy>
      <HelpMenuLink copy='Learn More' href={linkLookup[meetingType]} />
    </HelpMenuContent>
  )
}

export default CheckInHelpMenu

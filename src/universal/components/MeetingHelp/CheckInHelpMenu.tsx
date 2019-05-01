import React from 'react'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'
import useSegmentTrack from 'universal/hooks/useSegmentTrack'
import {
  MeetingTypeEnum,
  NewMeetingPhaseTypeEnum,
  SegmentClientEventEnum
} from 'universal/types/graphql'
import {ACTION, CHECKIN, RETROSPECTIVE} from 'universal/utils/constants'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'

const linkLookup = {
  [ACTION]: 'https://www.parabol.co/getting-started-guide/action-meetings-101#social-check-in',
  [RETROSPECTIVE]:
    'https://www.parabol.co/getting-started-guide/retrospective-meetings-101#social-check-in'
}

interface Props {
  meetingType: MeetingTypeEnum
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

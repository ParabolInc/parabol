import React, {forwardRef} from 'react'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'
import useSegmentTrack from 'universal/hooks/useSegmentTrack'
import {NewMeetingPhaseTypeEnum, SegmentClientEventEnum} from 'universal/types/graphql'

interface Props {}

const ActionMeetingLastCallHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useSegmentTrack(SegmentClientEventEnum.HelpMenuOpen, {phase: NewMeetingPhaseTypeEnum.firstcall})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuCopy>{'Here’s a chance to add any last topics for discussion.'}</HelpMenuCopy>
      <HelpMenuCopy>
        {'A Meeting Summary will be generated once the Facilitator ends the meeting.'}
      </HelpMenuCopy>
      <HelpMenuLink
        copy='Learn more'
        href='https://www.parabol.co/getting-started-guide/action-meetings-101#team-agenda'
      />
    </HelpMenuContent>
  )
})

export default ActionMeetingLastCallHelpMenu

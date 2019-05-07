import React, {forwardRef} from 'react'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'
import useSegmentTrack from 'universal/hooks/useSegmentTrack'
import {NewMeetingPhaseTypeEnum, SegmentClientEventEnum} from 'universal/types/graphql'

interface Props {}

const ActionMeetingLobbyHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useSegmentTrack(SegmentClientEventEnum.HelpMenuOpen, {phase: NewMeetingPhaseTypeEnum.lobby})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuCopy>{'To learn more about how to run an Action Meeting, see our '}</HelpMenuCopy>
      <div>
        <HelpMenuLink
          copy='Getting Started Guide'
          href='https://www.parabol.co/getting-started-guide/action-meetings-101'
        />
        {' for running an Action Meeting.'}
      </div>
    </HelpMenuContent>
  )
})

export default ActionMeetingLobbyHelpMenu

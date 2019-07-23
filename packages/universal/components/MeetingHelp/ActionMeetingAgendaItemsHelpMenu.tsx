import React, {forwardRef} from 'react'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'
import useSegmentTrack from 'universal/hooks/useSegmentTrack'
import {NewMeetingPhaseTypeEnum, SegmentClientEventEnum} from 'universal/types/graphql'

interface Props {}

const ActionMeetingAgendaItemsHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useSegmentTrack(SegmentClientEventEnum.HelpMenuOpen, {phase: NewMeetingPhaseTypeEnum.firstcall})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuCopy>
        {
          'The goal of this phase is to identify next steps and capture them as task cards assigned to an owner.'
        }
      </HelpMenuCopy>
      <HelpMenuCopy>
        {
          'Sometimes the next task is to schedule a time to discuss a topic more in depth at a later time.'
        }
      </HelpMenuCopy>
      <HelpMenuLink
        copy='Learn more'
        href='https://www.parabol.co/getting-started-guide/action-meetings-101#team-agenda'
      />
    </HelpMenuContent>
  )
})

export default ActionMeetingAgendaItemsHelpMenu

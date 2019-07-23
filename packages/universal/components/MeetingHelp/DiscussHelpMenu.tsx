import React, {forwardRef} from 'react'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'
import useSegmentTrack from 'universal/hooks/useSegmentTrack'
import {NewMeetingPhaseTypeEnum, SegmentClientEventEnum} from 'universal/types/graphql'
import {DISCUSS} from 'universal/utils/constants'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'

interface Props {}

const DiscussHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useSegmentTrack(SegmentClientEventEnum.HelpMenuOpen, {phase: NewMeetingPhaseTypeEnum.discuss})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>{phaseLabelLookup[DISCUSS]}</HelpMenuHeader>
      <HelpMenuCopy>
        The goal of this phase is to identify next steps and capture them as task cards assigned to
        an owner.
      </HelpMenuCopy>
      <HelpMenuCopy>
        Sometimes the next task is to schedule a time to discuss a topic more in depth at a later
        time.
      </HelpMenuCopy>
      <HelpMenuLink
        copy='Learn More'
        href='https://www.parabol.co/getting-started-guide/retrospective-meetings-101#discuss'
      />
    </HelpMenuContent>
  )
})

export default DiscussHelpMenu

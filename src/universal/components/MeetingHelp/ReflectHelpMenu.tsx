import React, {forwardRef} from 'react'
import useSegmentTrack from 'universal/hooks/useSegmentTrack'
import {NewMeetingPhaseTypeEnum, SegmentClientEventEnum} from 'universal/types/graphql'
import {REFLECT} from 'universal/utils/constants'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'

interface Props {}

const ReflectHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useSegmentTrack(SegmentClientEventEnum.HelpMenuOpen, {phase: NewMeetingPhaseTypeEnum.reflect})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>{phaseLabelLookup[REFLECT]}</HelpMenuHeader>
      <HelpMenuCopy>The goal of this phase is to gather honest input from the team.</HelpMenuCopy>
      <HelpMenuCopy>
        As a group, reflect on how work’s going for a specific project or timeframe.
      </HelpMenuCopy>
      <HelpMenuCopy>
        During this phase nobody can see your reflections. After this phase reflections will be
        visible, but remain anonymous.
      </HelpMenuCopy>
      <HelpMenuLink
        copy='Learn More'
        href='https://www.parabol.co/getting-started-guide/retrospective-meetings-101#reflect'
      />
    </HelpMenuContent>
  )
})

export default ReflectHelpMenu

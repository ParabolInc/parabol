import React, {forwardRef} from 'react'
import useSegmentTrack from 'universal/hooks/useSegmentTrack'
import {NewMeetingPhaseTypeEnum, SegmentClientEventEnum} from 'universal/types/graphql'
import {GROUP} from 'universal/utils/constants'
import HelpMenuContent from 'universal/components/MeetingHelp/HelpMenuContent'
import HelpMenuHeader from 'universal/components/MeetingHelp/HelpMenuHeader'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import HelpMenuLink from 'universal/components/MeetingHelp/HelpMenuLink'

interface Props {}

const GroupHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useSegmentTrack(SegmentClientEventEnum.HelpMenuOpen, {phase: NewMeetingPhaseTypeEnum.group})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>{phaseLabelLookup[GROUP]}</HelpMenuHeader>
      <HelpMenuCopy>
        The goal of this phase is to identify common themes and group them for discussion.
      </HelpMenuCopy>
      <HelpMenuCopy>To group, drag and drop a card onto another card or group.</HelpMenuCopy>
      <HelpMenuCopy>Tap group headings to edit.</HelpMenuCopy>
      <HelpMenuLink
        copy='Learn More'
        href='https://www.parabol.co/getting-started-guide/retrospective-meetings-101#group'
      />
    </HelpMenuContent>
  )
})

export default GroupHelpMenu

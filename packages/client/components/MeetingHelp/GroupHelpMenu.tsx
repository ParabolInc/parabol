import React, {forwardRef} from 'react'
import useSegmentTrack from '../../hooks/useSegmentTrack'
import {NewMeetingPhaseTypeEnum, SegmentClientEventEnum} from '../../types/graphql'
import {GROUP} from '../../utils/constants'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuHeader from './HelpMenuHeader'
import HelpMenuCopy from './HelpMenuCopy'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import HelpMenuLink from './HelpMenuLink'
import {ExternalLinks} from '../../types/constEnums'

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
      <HelpMenuLink copy='Learn More' href={`${ExternalLinks.GETTING_STARTED_RETROS}#group`} />
    </HelpMenuContent>
  )
})

export default GroupHelpMenu

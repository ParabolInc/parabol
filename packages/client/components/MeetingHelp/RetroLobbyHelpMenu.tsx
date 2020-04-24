import React, {forwardRef} from 'react'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuLink from './HelpMenuLink'
import useSegmentTrack from '../../hooks/useSegmentTrack'
import {NewMeetingPhaseTypeEnum, SegmentClientEventEnum} from '../../types/graphql'
import {ExternalLinks} from '../../types/constEnums'

interface Props {}

const RetroLobbyHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useSegmentTrack(SegmentClientEventEnum.HelpMenuOpen, {phase: NewMeetingPhaseTypeEnum.lobby})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuCopy>
        {
          'Our software guides your team to surface your teammates’ recent experiences, group them into themes, and develop an action plan, capture learnings, and make improvements.'
        }
      </HelpMenuCopy>
      <div>
        {'See our '}
        <HelpMenuLink copy='Getting Started Guide' href={ExternalLinks.GETTING_STARTED_RETROS} />
        {' for running a Retrospective Meeting.'}
      </div>
    </HelpMenuContent>
  )
})

export default RetroLobbyHelpMenu

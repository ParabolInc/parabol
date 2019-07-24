import React, {forwardRef} from 'react'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuHeader from './HelpMenuHeader'
import HelpMenuLink from './HelpMenuLink'
import useSegmentTrack from '../../hooks/useSegmentTrack'
import {NewMeetingPhaseTypeEnum, SegmentClientEventEnum} from '../../types/graphql'
import {VOTE} from '../../utils/constants'
import {phaseLabelLookup} from '../../utils/meetings/lookups'

interface Props {}

const VoteHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {closePortal} = ref
  useSegmentTrack(SegmentClientEventEnum.HelpMenuOpen, {phase: NewMeetingPhaseTypeEnum.vote})
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>{phaseLabelLookup[VOTE]}</HelpMenuHeader>
      <HelpMenuCopy>
        The goal of this phase is to find signal on what topics are the most important to the team.
      </HelpMenuCopy>
      <HelpMenuCopy>
        Each teammate has 5 total votes, and can vote on a single group up to 3 times.
      </HelpMenuCopy>
      <HelpMenuCopy>
        To vote, simply tap on the thumb-up icon above a group. Toggle votes to remove.
      </HelpMenuCopy>
      <HelpMenuLink
        copy='Learn More'
        href='https://www.parabol.co/getting-started-guide/retrospective-meetings-101#vote'
      />
    </HelpMenuContent>
  )
})

export default VoteHelpMenu

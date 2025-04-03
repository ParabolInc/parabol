import graphql from 'babel-plugin-relay/macro'
import {forwardRef} from 'react'
import {useFragment} from 'react-relay'
import {VoteHelpMenu_meeting$key} from '~/__generated__/VoteHelpMenu_meeting.graphql'
import useClientSideTrack from '../../hooks/useClientSideTrack'
import {ExternalLinks} from '../../types/constEnums'
import {VOTE} from '../../utils/constants'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuHeader from './HelpMenuHeader'
import HelpMenuLink from './HelpMenuLink'

interface Props {
  meetingRef: VoteHelpMenu_meeting$key
}

const VoteHelpMenu = forwardRef((_props: Props, ref: any) => {
  const {meetingRef: meetingRef} = _props
  const {closePortal} = ref
  useClientSideTrack('Help Menu Open', {phase: 'vote'})
  const votes = useFragment(
    graphql`
      fragment VoteHelpMenu_meeting on RetrospectiveMeeting {
        id
        totalVotes
        maxVotesPerGroup
      }
    `,
    meetingRef
  )
  const totalVotes = votes?.totalVotes ?? 5
  const maxVotesPerGroup = votes?.maxVotesPerGroup ?? 3
  return (
    <HelpMenuContent closePortal={closePortal}>
      <HelpMenuHeader>{phaseLabelLookup[VOTE]}</HelpMenuHeader>
      <HelpMenuCopy>
        The goal of this phase is to find signal on what topics are the most important to the team.
      </HelpMenuCopy>
      <HelpMenuCopy>
        Each teammate has {totalVotes} total votes, and can vote on a single group up to{' '}
        {maxVotesPerGroup} times.
      </HelpMenuCopy>
      <HelpMenuCopy>
        To vote, simply tap on the thumb-up icon above a group. Toggle votes to remove.
      </HelpMenuCopy>
      <HelpMenuLink copy='Learn More' href={`${ExternalLinks.GETTING_STARTED_RETROS}#vote`} />
    </HelpMenuContent>
  )
})

export default VoteHelpMenu

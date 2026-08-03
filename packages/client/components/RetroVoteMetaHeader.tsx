import {ExpandMore} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroVoteMetaHeader_meeting$key} from '~/__generated__/RetroVoteMetaHeader_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import lazyPreload from '~/utils/lazyPreload'
import LabelHeading from './LabelHeading/LabelHeading'

const VoteSettingsMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'VoteSettingsMenu' */
      './VoteSettingsMenu'
    )
)

const voteLabelClass = 'whitespace-nowrap text-[12px] normal-case vote-phase:pt-0.5'

const voteMetaBlockClass = 'flex select-none flex-nowrap items-center'

/* font-[family-name:...] preserves FONT_FAMILY.MONOSPACE exactly — the --font-mono
   theme token is missing a comma after 'IBM Plex Mono', so font-mono won't resolve */
const voteCountClass =
  'ml-2 p-0 font-[family-name:"IBM_Plex_Mono",Menlo,Monaco,Consolas,"Courier_New",monospace] font-semibold text-sm leading-5 text-accent vote-phase:ml-3 vote-phase:text-[16px]'

interface Props {
  meeting: RetroVoteMetaHeader_meeting$key
}

const RetroVoteMetaHeader = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroVoteMetaHeader_meeting on RetrospectiveMeeting {
        ...VoteSettingsMenu_meeting
        endedAt
        facilitatorUserId
        viewerMeetingMember {
          votesRemaining
        }
        votesRemaining
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {viewerMeetingMember, endedAt, facilitatorUserId} = meeting
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_RIGHT
  )
  const teamVotesRemaining = meeting.votesRemaining || 0
  const myVotesRemaining = viewerMeetingMember?.votesRemaining || 0
  const isFacilitating = facilitatorUserId === viewerId && !endedAt
  return (
    <div className='mx-auto mt-0 mb-2 vote-phase:mb-4 flex w-full items-center justify-center border-hairline-strong border-b p-2 vote-phase:px-0 vote-phase:pt-0 vote-phase:pb-2'>
      <div className={voteMetaBlockClass}>
        <LabelHeading className={voteLabelClass}>{'My Votes'}</LabelHeading>
        <div className={voteCountClass} data-cy={'my-votes-remaining'}>
          {myVotesRemaining}
        </div>
      </div>
      <div className={`${voteMetaBlockClass} ml-6 vote-phase:ml-8`}>
        <LabelHeading className={voteLabelClass}>{'Team Votes'}</LabelHeading>
        {/* most likely will start out with 2 digits; min-width reduces change in layout */}
        <div className={`${voteCountClass} min-w-5`} data-cy={'team-votes-remaining'}>
          {teamVotesRemaining}
        </div>
      </div>
      {isFacilitating && (
        <>
          <div
            className={`${voteMetaBlockClass} ml-6 vote-phase:ml-8 cursor-pointer`}
            ref={originRef}
            onClick={togglePortal}
            onMouseEnter={VoteSettingsMenu.preload}
          >
            <LabelHeading className={`${voteLabelClass} text-fg-primary`}>
              {'Vote Settings'}
            </LabelHeading>
            <ExpandMore className='text-fg-primary' />
          </div>
          {menuPortal(<VoteSettingsMenu meeting={meeting} menuProps={menuProps} />)}
        </>
      )}
    </div>
  )
}

export default RetroVoteMetaHeader

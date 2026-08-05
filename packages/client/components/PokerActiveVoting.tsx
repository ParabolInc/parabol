import {Check as CheckIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useMemo, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import useMutationProps from '~/hooks/useMutationProps'
import {MAX_FREE_JIRA_EXPORTS} from '~/utils/constants'
import type {PokerActiveVoting_meeting$key} from '../__generated__/PokerActiveVoting_meeting.graphql'
import type {PokerActiveVoting_stage$key} from '../__generated__/PokerActiveVoting_stage.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import PokerRevealVotesMutation from '../mutations/PokerRevealVotesMutation'
import {PokerCards} from '../types/constEnums'
import {cn} from '../ui/cn'
import AvatarList from './AvatarList'
import CircularProgress from './CircularProgress'
import JiraExportUpgradeModal from './JiraExportUpgradeModal'
import MiniPokerCard from './MiniPokerCard'
import PokerVotingNoVotes from './PokerVotingNoVotes'
import PokerVotingRowBase from './PokerVotingRowBase'
import RaisedButton from './RaisedButton'
import TipBanner from './TipBanner'
import {JIRA_EXPORT_UPGRADE_MODAL_DISMISSED_KEY} from './useSetTaskEstimate'

interface Props {
  isClosing: boolean
  meeting: PokerActiveVoting_meeting$key
  stage: PokerActiveVoting_stage$key
  isInitialStageRender: boolean
}

const PokerActiveVoting = (props: Props) => {
  const {isClosing, meeting: meetingRef, stage: stageRef, isInitialStageRender} = props
  const stage = useFragment(
    graphql`
      fragment PokerActiveVoting_stage on EstimateStage {
        id
        scores {
          userId
          user {
            ...AvatarList_users
          }
        }
      }
    `,
    stageRef
  )
  const meeting = useFragment(
    graphql`
      fragment PokerActiveVoting_meeting on PokerMeeting {
        facilitatorUserId
        id
        meetingMembers {
          id
          isSpectating
        }
        team {
          orgId
        }
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {facilitatorUserId, id: meetingId, meetingMembers, team} = meeting
  const {id: stageId, scores} = stage
  const hasVotes = scores.length > 0
  const isFacilitator = viewerId === facilitatorUserId
  const viewerHasVoted = scores.find(({userId}) => userId === viewerId)
  const checkedInCount = useMemo(
    () => meetingMembers.filter(({isSpectating}) => !isSpectating).length,
    [meetingMembers]
  )
  const votePercent = scores.length / checkedInCount
  const allVotesIn = scores.length === checkedInCount
  // Show the facilitator a tooltip if nobody has voted yet
  // Show the participant a tooltip if they haven't voted yet
  // Consider dismissing the tooltip silently if each role has seen their tooltip once
  // - Show the facilitator a tooltip if nobody has voted yet and the facilitator hasn't revealed once
  // - Show the participant a tooltip if they haven't voted once
  const showTip = Boolean((isFacilitator && !hasVotes) || (!isFacilitator && !viewerHasVoted))
  const tipCopy = isFacilitator
    ? 'Votes are automatically revealed once everyone has voted.'
    : 'Tap a card to vote. Swipe to view each dimension.'
  const showRevealButton = isFacilitator && scores.length > 0
  const {onError, onCompleted, submitMutation, submitting, error} = useMutationProps()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isHardBlock, setIsHardBlock] = useState(false)
  const exportCountRef = useRef(MAX_FREE_JIRA_EXPORTS)
  const tryShowUpgradeModal = (extensions: Record<string, unknown> | null | undefined) => {
    const code = extensions?.code
    if (extensions?.exportCount) {
      exportCountRef.current = extensions.exportCount as number
    }
    if (code === 'UPGRADE_REQUIRED') {
      setIsHardBlock(true)
      setShowUpgradeModal(true)
      return true
    }
    if (code === 'UPGRADE_SUGGESTED') {
      sessionStorage.setItem(JIRA_EXPORT_UPGRADE_MODAL_DISMISSED_KEY, 'true')
      setIsHardBlock(false)
      setShowUpgradeModal(true)
      return true
    }
    return false
  }

  const reveal = (forceIgnore?: boolean) => {
    if (submitting) return
    const hideSuggestion = sessionStorage.getItem(JIRA_EXPORT_UPGRADE_MODAL_DISMISSED_KEY)
    const ignoreSuggestedUpgrade = forceIgnore || !!hideSuggestion
    submitMutation()
    PokerRevealVotesMutation(
      atmosphere,
      {meetingId, stageId, ignoreSuggestedUpgrade},
      {
        onError: (err) => {
          const sourceErrors = (err as any)?.source?.errors as
            | Array<{extensions?: Record<string, unknown>}>
            | undefined
          const handled = sourceErrors?.some((e) => tryShowUpgradeModal(e.extensions))
          if (handled) return
          onError(err)
        },
        onCompleted: (res, errors) => {
          onCompleted(res, errors)
          errors?.find((e) => tryShowUpgradeModal(e.extensions))
        }
      }
    )
  }

  const handleModalClose = () => {
    setShowUpgradeModal(false)
    if (!isHardBlock) {
      reveal(true)
    }
  }

  const users = scores.map(({user}) => user)
  return (
    <>
      <PokerVotingRowBase>
        <div className='mr-4'>
          <MiniPokerCard>
            <CheckIcon className='text-jade-400' />
          </MiniPokerCard>
        </div>
        <AvatarList
          users={isClosing ? [] : users}
          size={PokerCards.AVATAR_WIDTH as 46}
          isAnimated={!isInitialStageRender}
          borderColor='var(--color-surface-well)'
          emptyEl={<PokerVotingNoVotes />}
        />
      </PokerVotingRowBase>
      <div className='min-h-12 px-4 py-2'>
        {showRevealButton && (
          <RaisedButton
            className='relative h-14 bg-surface-card font-semibold text-fg-secondary'
            disabled={submitting}
            onClick={() => reveal()}
          >
            <CircularProgress
              className='z-[1] [transform:translate(-4px,0px)]'
              radius={22}
              thickness={4}
              stroke={'var(--color-jade-400)'}
              progress={votePercent}
            />
            <div
              className={cn(
                'absolute top-[7px] left-[19px] flex h-10 w-10 items-center justify-center rounded-[100%] border border-[rgba(130,128,154,0.2)] shadow-[0px_0px_2px_rgba(68,66,88,0.14),0px_2px_2px_rgba(68,66,88,0.12),0px_1px_3px_rgba(68,66,88,0.2)] [&_svg]:fill-current [&_svg]:stroke-1 [&_svg]:stroke-current',
                allVotesIn ? 'text-jade-400' : 'text-fg-muted'
              )}
            >
              <CheckIcon />
            </div>
            <div className={cn('pl-2', allVotesIn ? 'text-jade-400' : 'text-fg-secondary')}>
              {'Reveal Votes'}
            </div>
          </RaisedButton>
        )}
        {error && (
          <div className='pt-1 pl-2 font-semibold text-[14px] text-fg-error'>{error.message}</div>
        )}
      </div>
      <div
        className={cn(
          'mx-auto px-4 py-2 transition-opacity duration-200 ease-[cubic-bezier(0,0,.2,1)]',
          showTip ? 'opacity-100' : 'opacity-0'
        )}
      >
        <TipBanner className='m-auto'>{tipCopy}</TipBanner>
      </div>
      <JiraExportUpgradeModal
        isOpen={showUpgradeModal}
        exportCount={exportCountRef.current}
        isHardBlock={isHardBlock}
        orgId={team.orgId}
        onClose={handleModalClose}
      />
    </>
  )
}

export default PokerActiveVoting

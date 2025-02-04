import * as RadioGroup from '@radix-ui/react-radio-group'
import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import {ReactElement} from 'react'
import {useFragment} from 'react-relay'
import {TeamHealth_meeting$key} from '~/__generated__/TeamHealth_meeting.graphql'
import useGotoStageId from '~/hooks/useGotoStageId'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import RevealTeamHealthVotesMutation from '../mutations/RevealTeamHealthVotesMutation'
import SetTeamHealthVoteMutation from '../mutations/SetTeamHealthVoteMutation'
import getTeamHealthVoteColor from '../utils/getTeamHealthVoteColor'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import RaisedButton from './RaisedButton'
import StageTimerDisplay from './StageTimerDisplay'
import TeamHealthVotingRow from './TeamHealthVotingRow'

interface Props {
  avatarGroup: ReactElement
  meeting: TeamHealth_meeting$key
  toggleSidebar: () => void
  gotoStageId?: ReturnType<typeof useGotoStageId>
}

const TeamHealth = (props: Props) => {
  const {avatarGroup, meeting: meetingRef, toggleSidebar} = props
  const atmosphere = useAtmosphere()
  const meeting = useFragment(
    graphql`
      fragment TeamHealth_meeting on NewMeeting {
        ...StageTimerDisplay_meeting
        ...StageTimerControl_meeting
        id
        endedAt
        showSidebar
        facilitatorUserId
        localStage {
          id
          ...TeamHealthLocalStage @relay(mask: false)
        }
        phases {
          stages {
            id
            ...TeamHealthLocalStage @relay(mask: false)
          }
        }
        teamId
      }
    `,
    meetingRef
  )
  const {id: meetingId, endedAt, showSidebar, localStage, facilitatorUserId} = meeting
  const {id: stageId, question, labels, viewerVote, votes, votedUserIds, isRevealed} = localStage
  const {viewerId} = atmosphere
  const {onError, onCompleted, submitMutation, submitting} = useMutationProps()

  const isFacilitator = facilitatorUserId === viewerId
  const canVote = !isRevealed && !endedAt
  const canReveal = isFacilitator && votedUserIds && votedUserIds.length > 0 && canVote

  const onVote = (label: string) => {
    if (!canVote || submitting) return
    submitMutation()
    SetTeamHealthVoteMutation(atmosphere, {meetingId, stageId, label}, {onError, onCompleted})
  }

  const onRevealVotes = () => {
    if (!canReveal || submitting) return
    submitMutation()
    RevealTeamHealthVotesMutation(atmosphere, {meetingId, stageId}, {onError, onCompleted})
  }

  return (
    <MeetingContent>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.TEAM_HEALTH}</PhaseHeaderTitle>
        </MeetingTopBar>
        <PhaseWrapper>
          <StageTimerDisplay meeting={meeting} />
          <div className='flex h-[300px] flex-col items-center'>
            <div className='text-center text-2xl'>{question}</div>
            {isRevealed && votes ? (
              <>
                <div className='flex flex-row'>
                  {labels?.map((label, index) => (
                    <div
                      key={label}
                      className='m-3 flex h-32 w-20 flex-col justify-start rounded-sm'
                      style={{backgroundColor: getTeamHealthVoteColor(votes, votes[index]!)}}
                    >
                      <div className='flex h-24 items-center justify-center text-4xl'>{label}</div>
                      <label className='text-center text-xl font-semibold text-white'>
                        {votes[index]}
                      </label>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <RadioGroup.Root
                  className='flex flex-row'
                  onValueChange={onVote}
                  value={viewerVote ?? undefined}
                >
                  {labels?.map((label) => (
                    <RadioGroup.Item
                      id={`radio-${label}`}
                      key={label}
                      value={label}
                      className={clsx(
                        'group m-3 flex h-32 w-20 flex-col items-center justify-start rounded-sm bg-slate-300 p-0 data-[state=checked]:bg-grape-300',
                        canVote
                          ? 'hover:cursor-pointer hover:bg-grape-100'
                          : 'hover:cursor-not-allowed'
                      )}
                    >
                      <label
                        htmlFor={`radio-${label}`}
                        className={clsx(
                          'flex h-24 items-center justify-center text-4xl group-data-[state=checked]:text-5xl',
                          canVote ? 'hover:cursor-pointer' : 'hover:cursor-not-allowed'
                        )}
                      >
                        {label}
                      </label>
                    </RadioGroup.Item>
                  ))}
                </RadioGroup.Root>
                <TeamHealthVotingRow stage={localStage} />
                {isFacilitator && (
                  <RaisedButton
                    palette='white'
                    onClick={onRevealVotes}
                    className='mt-4 h-14 w-44 rounded-full text-slate-600 disabled:bg-slate-300 disabled:text-slate-600'
                    disabled={!canReveal}
                  >
                    Reveal Results
                  </RaisedButton>
                )}
              </>
            )}
          </div>
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

graphql`
  fragment TeamHealthLocalStage on TeamHealthStage {
    ...TeamHealthVotingRow_stage
    question
    labels
    votes
    votedUserIds
    viewerVote
    isRevealed
  }
`

export default TeamHealth

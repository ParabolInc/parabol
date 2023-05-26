import graphql from 'babel-plugin-relay/macro'
import React, {ReactElement} from 'react'
import {useFragment} from 'react-relay'
import useGotoStageId from '~/hooks/useGotoStageId'
import {TeamHealth_meeting$key} from '~/__generated__/TeamHealth_meeting.graphql'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import TeamHealthVotingRow from './TeamHealthVotingRow'
import BaseButton from './BaseButton'
import useMutationProps from '../hooks/useMutationProps'
import useAtmosphere from '../hooks/useAtmosphere'
import SetTeamHealthScoreMutation from '../mutations/SetTeamHealthScoreMutation'
import * as RadioGroup from '@radix-ui/react-radio-group'

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
  const {id: stageId, question, labels, viewerVote} = localStage
  const {viewerId} = atmosphere
  const {onError, onCompleted, submitMutation, submitting} = useMutationProps()

  const onVote = (label: string) => {
    if (submitting) return
    submitMutation()
    SetTeamHealthScoreMutation(atmosphere, {meetingId, stageId, label}, {onError, onCompleted})
  }

  const isFacilitator = facilitatorUserId === viewerId

  const onRevealVotes = () => {
    console.log('GEORG WAS HERE')
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
          <div className='text-center text-2xl'>{question}</div>
          <RadioGroup.Root
            className='flex flex-row'
            onValueChange={onVote}
            value={viewerVote ?? undefined}
          >
            {labels?.map((label) => (
              <RadioGroup.Item
                key={label}
                value={label}
                className='flex h-24 w-24 items-center justify-center bg-transparent p-8 text-4xl hover:text-5xl data-[state=checked]:text-6xl'
              >
                {label}
              </RadioGroup.Item>
            ))}
          </RadioGroup.Root>
          <TeamHealthVotingRow stage={localStage} />
          {isFacilitator && (
            <BaseButton
              onClick={onRevealVotes}
              className='mt-4 h-14 rounded-full bg-slate-300 text-slate-600'
            >
              Reveal Results
            </BaseButton>
          )}
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
    viewerVote
  }
`

export default TeamHealth

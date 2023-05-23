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
        facilitatorStageId
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
  const {id: meetingId, endedAt, showSidebar, localStage} = meeting
  const {id: stageId, question, labels, scores} = localStage
  const {viewerId} = atmosphere
  const viewerScore = scores?.find((score) => score.userId === viewerId)
  const {onError, onCompleted, submitMutation, error, submitting} = useMutationProps()

  const onVote = (label: string) => {
    if (submitting) return
    submitMutation()
    SetTeamHealthScoreMutation(atmosphere, {meetingId, stageId, label}, {onError, onCompleted})
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
          <div className='text-2xl text-center'>{question}</div>
          <RadioGroup.Root
            className='flex flex-row'
            onValueChange={onVote}
            value={viewerScore?.label}
          >
            {labels?.map((label) => (
              <RadioGroup.Item
                key={label}
                value={label}
                className='flex items-center justify-center w-24 h-24 p-8 group'
              >
                <label
                  className='text-4xl hover:text-5xl group-data-[state=checked]:text-6xl'
                >
                  {label}
                </label>
              </RadioGroup.Item>
            ))}
          </RadioGroup.Root>
          <TeamHealthVotingRow scores={scores} />
          <BaseButton className='mt-4 rounded-full h-14 bg-slate-300 text-slate-600'>Reveal Results</RaisedButton>
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

graphql`
  fragment TeamHealthLocalStage on TeamHealthStage {
    question
    labels
    scores {
      ...TeamHealthVotingRow_scores
      id
      userId
      label
    }
  }
`

export default TeamHealth

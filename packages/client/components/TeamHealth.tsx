import graphql from 'babel-plugin-relay/macro'
import React, {ReactElement} from 'react'
import {useFragment} from 'react-relay'
import useGotoStageId from '~/hooks/useGotoStageId'
import {TeamHealth_meeting$key} from '~/__generated__/TeamHealth_meeting.graphql'
import findStageAfterId from '../utils/meetings/findStageAfterId'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'

interface Props {
  avatarGroup: ReactElement
  meeting: TeamHealth_meeting$key
  toggleSidebar: () => void
  gotoStageId?: ReturnType<typeof useGotoStageId>
}

const TeamHealth = (props: Props) => {
  const {avatarGroup, meeting: meetingRef, toggleSidebar} = props
  const meeting = useFragment(
    graphql`
      fragment TeamHealth_meeting on NewMeeting {
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
  const {endedAt, showSidebar, localStage, phases} = meeting
  const {id: localStageId, question, labels} = localStage
  const nextStageRes = findStageAfterId(phases, localStageId)
  // in case the checkin is the last phase of the meeting
  if (!nextStageRes) return null
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
          <form
            className='flex flex-row'
            onChange={(e: React.ChangeEvent<HTMLFormElement>) =>
              console.log('TODO: Vote changed', e.target.value)
            }
          >
            {labels?.map((label) => (
              <div key={label} className='flex h-24 w-24 justify-center p-8'>
                <input name='foo' className='peer hidden' type='radio' id={label} value={label} />
                <label
                  htmlFor={label}
                  className='text-4xl drop-shadow-lg sepia hover:text-5xl hover:blur-none hover:sepia-[0.5] peer-checked:text-6xl peer-checked:blur-none peer-checked:sepia-0'
                >
                  {label}
                </label>
              </div>
            ))}
          </form>
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
      id
      userId
      label
    }
  }
`

export default TeamHealth

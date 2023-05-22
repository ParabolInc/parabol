import graphql from 'babel-plugin-relay/macro'
import React, {ReactElement} from 'react'
import {useFragment} from 'react-relay'
import {TeamHealth_meeting$key} from '~/__generated__/TeamHealth_meeting.graphql'
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
}

const TeamHealth = (props: Props) => {
  const {avatarGroup, meeting: meetingRef, toggleSidebar} = props
  const meeting = useFragment(
    graphql`
      fragment TeamHealth_meeting on NewMeeting {
        endedAt
        showSidebar
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
      }
    `,
    meetingRef
  )
  const {endedAt, showSidebar, localStage} = meeting
  const {question, labels} = localStage
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
          <form
            className='flex flex-row'
            onChange={(e: React.ChangeEvent<HTMLFormElement>) =>
              console.log('TODO: Vote changed', e.target.value)
            }
          >
            {labels?.map((label) => (
              //center vertically
              <div key={label} className='flex items-center justify-center w-24 h-24 p-8'>
                <input name='foo' className='hidden peer' type='radio' id={label} value={label} />
                <label
                  htmlFor={label}
                  className='text-4xl opacity-75 drop-shadow-lg hover:text-5xl hover:opacity-100 hover:blur-none peer-checked:text-6xl peer-checked:opacity-100 peer-checked:blur-none'
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
  }
`

export default TeamHealth

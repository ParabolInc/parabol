import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroTeamHealthQuestions_teamHealthMeeting$key} from '~/__generated__/RetroTeamHealthQuestions_teamHealthMeeting.graphql'
import TeamHealthResponsePhase from '../TeamHealth/TeamHealthResponsePhase'
import RetroTeamHealthCheckBar from './RetroTeamHealthCheckBar'

interface Props {
  teamHealthMeeting: RetroTeamHealthQuestions_teamHealthMeeting$key
  isStartedHere: boolean
  gotoStageId: (stageId: string) => void
}

const RetroTeamHealthQuestions = (props: Props) => {
  const {teamHealthMeeting: teamHealthMeetingRef, isStartedHere, gotoStageId} = props
  const teamHealthMeeting = useFragment(
    graphql`
      fragment RetroTeamHealthQuestions_teamHealthMeeting on TeamHealthMeeting {
        ...TeamHealthResponsePhase_meeting
        ...RetroTeamHealthCheckBar_teamHealthMeeting
      }
    `,
    teamHealthMeetingRef
  )
  return (
    <div className='mx-auto flex w-full max-w-2xl flex-col gap-3 py-4'>
      <RetroTeamHealthCheckBar
        teamHealthMeeting={teamHealthMeeting}
        isStartedHere={isStartedHere}
      />
      {/* as a flex item, the phase's auto margins would shrink it to its content and overflow a phone */}
      <div>
        <TeamHealthResponsePhase meeting={teamHealthMeeting} gotoStageId={gotoStageId} />
      </div>
      <p className='m-0 text-center text-fg-muted text-sm'>
        Anonymous · your individual answers are never shown to anyone
      </p>
    </div>
  )
}

export default RetroTeamHealthQuestions

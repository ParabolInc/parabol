import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroTeamHealthStatusActions_teamHealthMeeting$key} from '~/__generated__/RetroTeamHealthStatusActions_teamHealthMeeting.graphql'
import {OpenInNew} from '~/ui/icons'
import useSetTeamHealthSpectateMutation from '../../mutations/useSetTeamHealthSpectateMutation'
import {Button} from '../../ui/Button/Button'
import type {RetroTeamHealthStatusState} from './getRetroTeamHealthStatusCopy'

interface Props {
  teamHealthMeeting: RetroTeamHealthStatusActions_teamHealthMeeting$key
  state: RetroTeamHealthStatusState
  gotoStageId: (stageId: string) => void
}

const RetroTeamHealthStatusActions = (props: Props) => {
  const {teamHealthMeeting: teamHealthMeetingRef, state, gotoStageId} = props
  const teamHealthMeeting = useFragment(
    graphql`
      fragment RetroTeamHealthStatusActions_teamHealthMeeting on TeamHealthMeeting {
        id
        viewerMeetingMember {
          ... on TeamHealthMeetingMember {
            isSpectating
          }
        }
        phases {
          phaseType
          stages {
            id
            ... on TeamHealthResponseStage {
              viewerResponse {
                score
              }
            }
          }
        }
      }
    `,
    teamHealthMeetingRef
  )
  const {id: teamHealthMeetingId, viewerMeetingMember, phases} = teamHealthMeeting
  const [setSpectate] = useSetTeamHealthSpectateMutation()
  const responseStages =
    phases.find(({phaseType}) => phaseType === 'TEAM_HEALTH_RESPONSE')?.stages ?? []
  const firstStageId = responseStages[0]?.id
  const firstUnansweredStageId = responseStages.find(
    (stage) => stage.viewerResponse?.score == null
  )?.id
  if (viewerMeetingMember?.isSpectating) {
    const answerToo = () => {
      setSpectate({variables: {meetingId: teamHealthMeetingId, isSpectating: false}})
      if (firstStageId) gotoStageId(firstStageId)
    }
    return (
      <div className='mt-7 flex w-full flex-col items-center gap-3 border-hairline border-t pt-5'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' shape='default' size='md' onClick={answerToo}>
            Answer too
          </Button>
          <a
            href={`/meet/${teamHealthMeetingId}`}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-1 font-semibold text-accent text-sm'
          >
            Open the check
            <OpenInNew className='size-4' />
          </a>
        </div>
      </div>
    )
  }
  if (state === 'toGo' && firstUnansweredStageId) {
    return (
      <Button
        variant='primary'
        shape='default'
        size='lg'
        className='mt-7'
        onClick={() => gotoStageId(firstUnansweredStageId)}
      >
        Answer the rest
      </Button>
    )
  }
  if (!firstStageId) return null
  return (
    <Button
      variant='link'
      size='md'
      className='mt-5 font-bold text-accent'
      onClick={() => gotoStageId(firstStageId)}
    >
      Change my answers
    </Button>
  )
}

export default RetroTeamHealthStatusActions

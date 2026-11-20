import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroTeamHealthStatus_teamHealthMeeting$key} from '~/__generated__/RetroTeamHealthStatus_teamHealthMeeting.graphql'
import {CheckCircle, MonitorHeart, Schedule} from '~/ui/icons'
import useAtmosphere from '../../hooks/useAtmosphere'
import {cn} from '../../ui/cn'
import {getTeamHealthRespondents} from '../TeamHealth/getTeamHealthRespondents'
import TeamHealthProgress from '../TeamHealth/TeamHealthProgress'
import getRetroTeamHealthStatusCopy from './getRetroTeamHealthStatusCopy'
import RetroTeamHealthReveal from './RetroTeamHealthReveal'
import RetroTeamHealthStatusActions from './RetroTeamHealthStatusActions'

interface Props {
  teamHealthMeeting: RetroTeamHealthStatus_teamHealthMeeting$key
  isStartedHere: boolean
  gotoStageId: (stageId: string) => void
  onRevealed: () => void
}

const RetroTeamHealthStatus = (props: Props) => {
  const {teamHealthMeeting: teamHealthMeetingRef, isStartedHere, gotoStageId, onRevealed} = props
  const teamHealthMeeting = useFragment(
    graphql`
      fragment RetroTeamHealthStatus_teamHealthMeeting on TeamHealthMeeting {
        ...RetroTeamHealthReveal_teamHealthMeeting
        ...RetroTeamHealthStatusActions_teamHealthMeeting
        name
        scheduledEndTime
        respondentCount
        respondentUserIds
        facilitatorUserId
        meetingSeries {
          ownerUserId
        }
        team {
          teamMembers {
            userId
            user {
              preferredName
              picture
            }
          }
        }
        meetingMembers {
          userId
          ... on TeamHealthMeetingMember {
            isSpectating
          }
        }
        viewerMeetingMember {
          teamMember {
            isOrgAdmin
          }
          ... on TeamHealthMeetingMember {
            isSpectating
          }
        }
        phases {
          phaseType
          stages {
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
  const {name, scheduledEndTime, respondentCount, respondentUserIds} = teamHealthMeeting
  const {facilitatorUserId, meetingSeries} = teamHealthMeeting
  const {team, meetingMembers, viewerMeetingMember, phases} = teamHealthMeeting
  const {viewerId} = useAtmosphere()
  // the check's own rule: whoever runs it, owns its series, or administers the org
  const canReveal =
    facilitatorUserId === viewerId ||
    !!viewerMeetingMember?.teamMember.isOrgAdmin ||
    (!!meetingSeries?.ownerUserId && meetingSeries.ownerUserId === viewerId)
  const respondents = getTeamHealthRespondents(team.teamMembers, meetingMembers).map(
    ({userId, user}) => ({userId, preferredName: user.preferredName, picture: user.picture})
  )
  const pendingCount = Math.max(0, respondents.length - respondentCount)
  const responseStages =
    phases.find(({phaseType}) => phaseType === 'TEAM_HEALTH_RESPONSE')?.stages ?? []
  const {state, title, body} = getRetroTeamHealthStatusCopy({
    checkName: name,
    scheduledEndTime,
    isStartedHere,
    isSpectating: !!viewerMeetingMember?.isSpectating,
    canReveal,
    respondentTotal: respondents.length,
    pendingCount,
    questionCount: responseStages.length,
    answeredCount: responseStages.filter((stage) => stage.viewerResponse?.score != null).length
  })
  const isCollecting = state === 'collecting'
  const Icon = isCollecting ? MonitorHeart : state === 'toGo' ? Schedule : CheckCircle
  return (
    <div className='flex w-full justify-center px-6 py-8'>
      <section className='flex w-full max-w-lg flex-col items-center rounded-3xl bg-surface-card px-8 py-10 text-center shadow-card-raised'>
        <span
          className={cn(
            'flex size-14 items-center justify-center rounded-2xl',
            isCollecting ? 'bg-lilac-100 dark:bg-lilac-900' : 'bg-jade-100 dark:bg-jade-900'
          )}
        >
          <Icon
            className={
              isCollecting
                ? 'text-grape-700 dark:text-lilac-200'
                : 'text-jade-700 dark:text-jade-300'
            }
          />
        </span>
        <h2 className='mt-6 mb-0 font-bold text-3xl text-fg-primary'>{title}</h2>
        <p className='mt-2 mb-0 text-balance text-fg-secondary'>{body}</p>
        <TeamHealthProgress
          className='mt-7'
          respondentCount={respondentCount}
          respondentUserIds={respondentUserIds}
          respondents={respondents}
        />
        {canReveal && (
          <RetroTeamHealthReveal
            teamHealthMeeting={teamHealthMeeting}
            isStartedHere={isStartedHere}
            pendingCount={pendingCount}
            onRevealed={onRevealed}
          />
        )}
        <RetroTeamHealthStatusActions
          teamHealthMeeting={teamHealthMeeting}
          state={state}
          gotoStageId={gotoStageId}
        />
      </section>
    </div>
  )
}

export default RetroTeamHealthStatus

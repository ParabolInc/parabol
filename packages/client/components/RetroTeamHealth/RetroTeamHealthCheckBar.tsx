import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useFragment} from 'react-relay'
import type {RetroTeamHealthCheckBar_teamHealthMeeting$key} from '~/__generated__/RetroTeamHealthCheckBar_teamHealthMeeting.graphql'
import {MonitorHeart} from '~/ui/icons'
import {getTeamHealthRespondents} from '../TeamHealth/getTeamHealthRespondents'

interface Props {
  teamHealthMeeting: RetroTeamHealthCheckBar_teamHealthMeeting$key
  isStartedHere: boolean
}

const RetroTeamHealthCheckBar = (props: Props) => {
  const {teamHealthMeeting: teamHealthMeetingRef, isStartedHere} = props
  const teamHealthMeeting = useFragment(
    graphql`
      fragment RetroTeamHealthCheckBar_teamHealthMeeting on TeamHealthMeeting {
        name
        scheduledEndTime
        respondentCount
        team {
          teamMembers {
            userId
          }
        }
        meetingMembers {
          userId
          ... on TeamHealthMeetingMember {
            isSpectating
          }
        }
      }
    `,
    teamHealthMeetingRef
  )
  const {name, scheduledEndTime, respondentCount, team, meetingMembers} = teamHealthMeeting
  const respondentTotal = getTeamHealthRespondents(team.teamMembers, meetingMembers).length
  const closes = isStartedHere
    ? 'closes when this retro ends'
    : scheduledEndTime
      ? `open until ${dayjs(scheduledEndTime).format('ddd, MMM D')}`
      : null
  return (
    <div className='flex items-center justify-between gap-4 px-8 text-fg-secondary text-sm'>
      <span className='flex min-w-0 items-center gap-2'>
        <MonitorHeart className='size-[18px] shrink-0 text-grape-700 dark:text-lilac-200' />
        <span className='truncate'>
          <span className='font-semibold text-fg-primary'>{name}</span>
          {closes && ` · ${closes}`}
        </span>
      </span>
      <span className='shrink-0'>{`${respondentCount} of ${respondentTotal} teammates in`}</span>
    </div>
  )
}

export default RetroTeamHealthCheckBar

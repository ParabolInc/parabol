import {ChangeHistory, GroupWork, History} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import CardsSVG from 'parabol-client/components/CardsSVG'
import {ReactNode} from 'react'

import {useSelector} from 'react-redux'
import {useFragment} from 'react-relay'
import {
  MeetingRow_meeting$key,
  MeetingTypeEnum
} from '../../__generated__/MeetingRow_meeting.graphql'
import {useInviteToMeeting} from '../../hooks/useInviteToMeeting'
import {getPluginServerRoute} from '../../selectors'

export const meetingTypeToIcon = {
  retrospective: <History fontSize='large' />,
  action: <ChangeHistory fontSize='large' />,
  poker: <CardsSVG />,
  teamPrompt: <GroupWork fontSize='large' />
} as Record<MeetingTypeEnum, ReactNode>

type Props = {
  meetingRef: MeetingRow_meeting$key
}

const MeetingRow = ({meetingRef}: Props) => {
  const meeting = useFragment(
    graphql`
      fragment MeetingRow_meeting on NewMeeting {
        ...useInviteToMeeting_meeting
        id
        name
        meetingType
        team {
          name
        }
      }
    `,
    meetingRef
  )
  const {id, name, team, meetingType} = meeting
  const pluginServerRoute = useSelector(getPluginServerRoute)

  const invite = useInviteToMeeting(meeting)

  const handleInvite = () => {
    invite?.()
  }

  return (
    <div className='my-4 flex rounded-lg border border-slate-300'>
      <div className='pt-4 pl-2 text-2xl text-slate-400'>{meetingTypeToIcon[meetingType]}</div>
      <div className='flex flex-col items-start p-2'>
        <div className='flex flex-col'>
          <a
            href={`${pluginServerRoute}/parabol/meet/${id}`}
            target='_blank'
            className='text-2xl font-bold'
          >
            {name}
          </a>
          <div className='font-semibold text-slate-400'>{team?.name}</div>
        </div>
        <div className='py-2'>
          <button className='btn btn-sm btn-primary' onClick={handleInvite}>
            Invite
          </button>
        </div>
      </div>
    </div>
  )
}

export default MeetingRow

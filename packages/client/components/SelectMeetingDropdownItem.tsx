import {
  ArrowForward as ArrowForwardIcon,
  ChangeHistory,
  GroupWork,
  History
} from '@mui/icons-material'
import * as Sentry from '@sentry/browser'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {SelectMeetingDropdownItem_meeting$key} from '~/__generated__/SelectMeetingDropdownItem_meeting.graphql'
import useRouter from '~/hooks/useRouter'
import getMeetingPhase from '~/utils/getMeetingPhase'
import {meetingTypeToIcon, phaseLabelLookup} from '~/utils/meetings/lookups'
import {MenuItem} from '../ui/Menu/MenuItem'

interface Props {
  meeting: SelectMeetingDropdownItem_meeting$key
}

const SelectMeetingDropdownItem = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment SelectMeetingDropdownItem_meeting on NewMeeting {
        id
        name
        meetingType
        phases {
          phaseType
          stages {
            isComplete
          }
        }
        team {
          name
        }
      }
    `,
    meetingRef
  )
  const {history} = useRouter()
  const {name, team, id: meetingId, meetingType, phases} = meeting
  if (!team) {
    // 95% sure there's a bug in relay causing this
    const errObj = {id: meetingId} as any
    if (meeting.hasOwnProperty('team')) {
      errObj.team = team
    }
    Sentry.captureException(new Error(`Missing Team on Meeting ${JSON.stringify(errObj)}`))
    return null
  }
  const {name: teamName} = team
  const gotoMeeting = () => {
    history.push(`/meet/${meetingId}`)
  }
  //FIXME 6062: change to React.ComponentType
  const IconOrSVG = meetingTypeToIcon[meetingType]
  const meetingPhase = getMeetingPhase(phases)
  const meetingPhaseLabel = (meetingPhase && phaseLabelLookup[meetingPhase.phaseType]) || 'Complete'

  return (
    <MenuItem
      onClick={gotoMeeting}>
      {typeof IconOrSVG === 'string' ? (
        <div className='text-slate-600 size-6 m-2'>
          {
            {
              group_work: <GroupWork />,
              change_history: <ChangeHistory />,
              history: <History />
            }[IconOrSVG]
          }
        </div>
      ) : (
        <div className='p-2'>
          <IconOrSVG />
        </div>
      )}
      <div className='flex flex-col px-2'>
        <div className='text-slate-700 text-base font-semibold'>
          {name}
        </div>
        <div className='text-slate-600 text-xs'>
          {meetingPhaseLabel} • {teamName}
        </div>
      </div>
      <div className='flex flex-grow justify-end items-center size-6'>
        <ArrowForwardIcon />
      </div>
    </MenuItem>
  )
}

export default SelectMeetingDropdownItem

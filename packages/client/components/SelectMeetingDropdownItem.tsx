import {datadogRum} from '@datadog/browser-rum'
import {
  ArrowForward as ArrowForwardIcon,
  ChangeHistory,
  GroupWork,
  History
} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {SelectMeetingDropdownItem_meeting$key} from '~/__generated__/SelectMeetingDropdownItem_meeting.graphql'
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
            id
            isComplete
          }
        }
        facilitatorStageId
        team {
          name
        }
      }
    `,
    meetingRef
  )
  const {history} = useRouter()
  const {name, team, id: meetingId, meetingType, phases, facilitatorStageId} = meeting
  if (!team) {
    // 95% sure there's a bug in relay causing this
    const errObj = {id: meetingId} as any
    datadogRum.addError(new Error(`Missing Team on Meeting ${JSON.stringify(errObj)}`))
    return null
  }
  const {name: teamName} = team
  const gotoMeeting = () => {
    history.push(`/meet/${meetingId}`)
  }
  //FIXME 6062: change to React.ComponentType
  const IconOrSVG = meetingTypeToIcon[meetingType]!
  const meetingPhase = getMeetingPhase(phases, facilitatorStageId)
  const meetingPhaseLabel = (meetingPhase && phaseLabelLookup[meetingPhase.phaseType]) || 'Complete'

  return (
    <MenuItem onClick={gotoMeeting}>
      {typeof IconOrSVG === 'string' ? (
        <div className='m-2 size-6 text-slate-600'>
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
        <div className='text-base font-semibold text-slate-700'>{name}</div>
        <div className='text-xs text-slate-600'>
          {teamName} • {meetingPhaseLabel}
        </div>
      </div>
      <div className='flex size-6 grow items-center justify-end'>
        <ArrowForwardIcon />
      </div>
    </MenuItem>
  )
}

export default SelectMeetingDropdownItem

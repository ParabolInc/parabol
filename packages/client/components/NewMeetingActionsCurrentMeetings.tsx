import {Forum} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {NewMeetingActionsCurrentMeetings_team$key} from '~/__generated__/NewMeetingActionsCurrentMeetings_team.graphql'
import useSnacksForNewMeetings from '~/hooks/useSnacksForNewMeetings'
import plural from '~/utils/plural'
import {cn} from '../ui/cn'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import FlatButton from './FlatButton'
import SelectMeetingDropdown from './SelectMeetingDropdown'

interface Props {
  team: NewMeetingActionsCurrentMeetings_team$key
}

const NewMeetingActionsCurrentMeetings = (props: Props) => {
  const {team: teamRef} = props
  const team = useFragment(
    graphql`
      fragment NewMeetingActionsCurrentMeetings_team on Team {
        id
        activeMeetings {
          ...SelectMeetingDropdown_meetings
          ...useSnacksForNewMeetings_meetings
          id
        }
      }
    `,
    teamRef
  )
  const {activeMeetings} = team
  useSnacksForNewMeetings(activeMeetings as any)
  const meetingCount = activeMeetings.length
  const label = `${meetingCount} Active ${plural(meetingCount, 'Meeting')}`
  if (!meetingCount) return null
  return (
    <Menu
      trigger={
        <FlatButton
          className={cn(
            'font-semibold text-[16px] text-rose-500',
            meetingCount > 0 ? 'h-[50px]' : 'invisible h-0'
          )}
          size={'large'}
        >
          <Forum className='mr-3' />
          {label}
        </FlatButton>
      }
    >
      <MenuContent className='w-[var(--radix-dropdown-menu-trigger-width)]'>
        <SelectMeetingDropdown meetings={activeMeetings!} />
      </MenuContent>
    </Menu>
  )
}

export default NewMeetingActionsCurrentMeetings

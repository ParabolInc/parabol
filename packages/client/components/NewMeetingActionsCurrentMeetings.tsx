import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {NewMeetingActionsCurrentMeetings_team$key} from '~/__generated__/NewMeetingActionsCurrentMeetings_team.graphql'
import useSnacksForNewMeetings from '~/hooks/useSnacksForNewMeetings'
import {Forum} from '~/ui/icons'
import plural from '~/utils/plural'
import {Button} from '../ui/Button/Button'
import {cn} from '../ui/cn'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
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
        <Button
          variant='flat'
          className={cn(
            'font-semibold text-[16px] text-rose-500',
            meetingCount > 0 ? 'h-[50px]' : 'invisible h-0'
          )}
          size={'lg'}
        >
          <Forum className='mr-3' />
          {label}
        </Button>
      }
    >
      <MenuContent className='w-[var(--radix-dropdown-menu-trigger-width)]'>
        <SelectMeetingDropdown meetings={activeMeetings!} />
      </MenuContent>
    </Menu>
  )
}

export default NewMeetingActionsCurrentMeetings

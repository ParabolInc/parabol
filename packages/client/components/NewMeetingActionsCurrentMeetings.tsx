import styled from '@emotion/styled'
import {Forum} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {NewMeetingActionsCurrentMeetings_team$key} from '~/__generated__/NewMeetingActionsCurrentMeetings_team.graphql'
import useSnacksForNewMeetings from '~/hooks/useSnacksForNewMeetings'
import {PALETTE} from '~/styles/paletteV3'
import plural from '~/utils/plural'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import FlatButton from './FlatButton'
import SelectMeetingDropdown from './SelectMeetingDropdown'

const CurrentButton = styled(FlatButton)<{hasMeetings: boolean}>(({hasMeetings}) => ({
  color: PALETTE.ROSE_500,
  fontSize: 16,
  fontWeight: 600,
  height: hasMeetings ? 50 : 0,
  visibility: hasMeetings ? undefined : 'hidden'
}))

const ForumIcon = styled(Forum)({
  marginRight: 12
})

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
        <CurrentButton hasMeetings={meetingCount > 0} size={'large'}>
          <ForumIcon />
          {label}
        </CurrentButton>
      }
    >
      <MenuContent className='w-[var(--radix-dropdown-menu-trigger-width)]'>
        <SelectMeetingDropdown meetings={activeMeetings!} />
      </MenuContent>
    </Menu>
  )
}

export default NewMeetingActionsCurrentMeetings

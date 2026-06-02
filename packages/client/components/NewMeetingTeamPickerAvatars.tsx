import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {NewMeetingTeamPickerAvatars_team$key} from '../__generated__/NewMeetingTeamPickerAvatars_team.graphql'
import {cn} from '../ui/cn'
import getShuffledArr from '../utils/getShuffledArr'
import Avatar from './Avatar/Avatar'

interface Props {
  teamRef: NewMeetingTeamPickerAvatars_team$key
}

const NewMeetingTeamPickerAvatars = (props: Props) => {
  const {teamRef} = props

  const team = useFragment(
    graphql`
      fragment NewMeetingTeamPickerAvatars_team on Team {
        teamMembers {
          id
          user {
            picture
          }
          isLead
        }
      }
    `,
    teamRef
  )

  const avatars = useMemo(() => {
    const lead = team.teamMembers.find((m) => m.isLead)
    const others = getShuffledArr(team.teamMembers.filter((m) => !m.isLead))
    return (lead ? [lead, ...others] : others).slice(0, 4)
  }, [team.teamMembers])

  return (
    <div className='flex max-w-11 flex-wrap'>
      {avatars.map((member, i) => (
        <Avatar
          key={member.id}
          picture={member.user.picture}
          className={cn(
            'flex-wrap border border-slate-200 border-solid',
            avatars.length < 2 ? 'h-7 w-7' : 'h-6 w-6',
            i % 2 && '-ml-2',
            i > 1 && '-mt-2',
            avatars.length === 3 && i === 2 && 'mx-auto'
          )}
        />
      ))}
    </div>
  )
}

export default NewMeetingTeamPickerAvatars

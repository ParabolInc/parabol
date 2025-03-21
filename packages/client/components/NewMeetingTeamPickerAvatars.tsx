import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {NewMeetingTeamPickerAvatars_team$key} from '../__generated__/NewMeetingTeamPickerAvatars_team.graphql'
import getShuffledArr from '../utils/getShuffledArr'
import Avatar from './Avatar/Avatar'
import ErrorBoundary from './ErrorBoundary'

const Container = styled('div')<{count: number}>(({count}) => ({
  width: 44,
  display: 'flex',
  justifyContent: count > 1 ? 'flex-start' : 'center',
  flexWrap: 'wrap',
  bottom: count > 2 ? 4 : 0,
  position: 'relative'
}))

const AvatarWrapper = styled('div')<{count: number}>(({count}) => ({
  width: count > 1 ? 20 : 'auto',
  height: count > 2 ? 20 : 'auto'
}))

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
          isSelf
        }
      }
    `,
    teamRef
  )

  const {teamMembers} = team

  const randomAvatars = useMemo(() => {
    const randomTeamMembers = getShuffledArr(teamMembers)

    const filteredMembers = [] as typeof randomTeamMembers
    randomTeamMembers.forEach((member) => {
      // Always show the lead first
      if (member.isLead) {
        filteredMembers.unshift(member)
      } else if (teamMembers.length <= 4 || !member.isSelf) {
        filteredMembers.push(member)
      }
    })

    return filteredMembers.slice(0, 4)
  }, [teamMembers])

  return (
    <Container count={randomAvatars.length}>
      {randomAvatars.map((teamMember) => {
        const {user} = teamMember
        const {picture} = user
        return (
          <ErrorBoundary key={`pickerAvatar${teamMember.id}`}>
            <AvatarWrapper count={randomAvatars.length}>
              <Avatar
                picture={picture}
                className={`h-7 w-7 border-2 border-solid border-slate-200`}
              />
            </AvatarWrapper>
          </ErrorBoundary>
        )
      })}
    </Container>
  )
}

export default NewMeetingTeamPickerAvatars

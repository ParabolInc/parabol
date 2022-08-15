import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '../styles/paletteV3'
import defaultUserAvatar from '../styles/theme/images/avatar-user.svg'
import getShuffledArr from '../utils/getShuffledArr'
import {NewMeetingTeamPickerAvatars_team$key} from '../__generated__/NewMeetingTeamPickerAvatars_team.graphql'
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

const StyledAvatar = styled(Avatar)({
  border: `2px solid ${PALETTE.SLATE_200}`
})

interface Props {
  teamRef: NewMeetingTeamPickerAvatars_team$key
}

interface TeamMember {
  id: string
  picture: string
}

const NewMeetingTeamPickerAvatars = (props: Props) => {
  const {teamRef} = props

  const team = useFragment(
    graphql`
      fragment NewMeetingTeamPickerAvatars_team on Team {
        teamMembers {
          id
          picture
        }
      }
    `,
    teamRef
  )

  const {teamMembers} = team

  if (!teamMembers) {
    return null
  }

  const randomAvatars = useMemo(() => {
    const randomTeamMembers = getShuffledArr(teamMembers as TeamMember[])
    return randomTeamMembers.slice(0, 4)
  }, [teamMembers])

  return (
    <Container count={randomAvatars.length}>
      {randomAvatars.map((teamMember) => {
        const {picture} = teamMember
        return (
          <ErrorBoundary key={`pickerAvatar${teamMember.id}`}>
            <AvatarWrapper count={randomAvatars.length}>
              <StyledAvatar {...teamMember} picture={picture || defaultUserAvatar} size={28} />
            </AvatarWrapper>
          </ErrorBoundary>
        )
      })}
    </Container>
  )
}

export default NewMeetingTeamPickerAvatars

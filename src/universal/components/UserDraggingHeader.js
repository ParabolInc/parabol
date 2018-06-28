import React from 'react'
import appTheme from 'universal/styles/theme/appTheme'
import {createFragmentContainer} from 'react-relay'
import styled from 'react-emotion'
import {UserDraggingHeader_user as User} from './__generated__/UserDraggingHeader_user.graphql'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import Tag from 'universal/components/Tag/Tag'

type Props = {
  user: User
}

const Header = styled('div')({
  bottom: '100%',
  color: appTheme.palette.warm,
  fontSize: '.6875rem',
  lineHeight: '1.125rem',
  position: 'absolute',
  right: 0,
  textAlign: 'end'
})

const UserDraggingHeader = (props: Props) => {
  const {
    atmosphere: {viewerId},
    user
  } = props
  if (!user) return null
  const {userId, preferredName} = user
  const name = userId === viewerId ? 'Your ghost 👻' : preferredName
  return (
    <Header>
      <Tag colorPalette='purple' label={name} />
    </Header>
  )
}

export default createFragmentContainer(
  withAtmosphere(UserDraggingHeader),
  graphql`
    fragment UserDraggingHeader_user on User {
      userId: id
      preferredName
    }
  `
)

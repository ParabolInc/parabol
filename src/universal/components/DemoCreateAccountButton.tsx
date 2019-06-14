import React from 'react'
import styled from 'react-emotion'
import SecondaryButton from 'universal/components/SecondaryButton'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {meetingAvatarMediaQueries} from 'universal/styles/meeting'

const StyledButton = styled(SecondaryButton)({
  height: 32,
  paddingLeft: 16,
  paddingRight: 16,
  [meetingAvatarMediaQueries[0]]: {
    fontSize: 15,
    height: 48,
    paddingLeft: 24,
    paddingRight: 24
  },
  [meetingAvatarMediaQueries[1]]: {
    fontSize: 16,
    height: 56,
    paddingLeft: 32,
    paddingRight: 32
  }
})

const DemoCreateAccountButton = (props: RouteComponentProps) => {
  const {history} = props
  const handleClick = () => history.push('/create-account?from=demo')
  return <StyledButton onClick={handleClick}>{'Create Free Account'}</StyledButton>
}

export default withRouter(DemoCreateAccountButton)

import React from 'react'
import styled from '@emotion/styled'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {meetingAvatarMediaQueries} from '../styles/meeting'
import LinkButton from './LinkButton'
import GiftSVG from './GiftSVG'
import useBreakpoint from '../hooks/useBreakpoint'

const StyledButton = styled(LinkButton)({
  fontSize: 13,
  fontWeight: 600,
  height: 32,
  marginRight: 16,
  [meetingAvatarMediaQueries[0]]: {
    fontSize: 15
  },
  [meetingAvatarMediaQueries[1]]: {
    fontSize: 16
  }
})

const Label = styled('div')({
  marginLeft: 8
})

const DemoCreateAccountButton = (props: RouteComponentProps) => {
  const {history} = props
  const handleClick = () => history.push('/create-account?from=demo')
  const isBreakpoint = useBreakpoint(480)
  return (
    <StyledButton palette='blue' onClick={handleClick}>
      <GiftSVG />
      {isBreakpoint && <Label>{'Create Free Account'}</Label>}
    </StyledButton>
  )
}

export default withRouter(DemoCreateAccountButton)

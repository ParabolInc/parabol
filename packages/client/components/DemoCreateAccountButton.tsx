import styled from '@emotion/styled'
import {useHistory} from 'react-router'
import useBreakpoint from '../hooks/useBreakpoint'
import {meetingAvatarMediaQueries} from '../styles/meeting'
import GiftSVG from './GiftSVG'
import LinkButton from './LinkButton'

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

const DemoCreateAccountButton = () => {
  const history = useHistory()
  const handleClick = () => history.push('/create-account?from=demo')
  const isBreakpoint = useBreakpoint(480)
  return (
    <StyledButton palette='blue' onClick={handleClick}>
      <GiftSVG />
      {isBreakpoint && <Label>{'Create Free Account'}</Label>}
    </StyledButton>
  )
}

export default DemoCreateAccountButton

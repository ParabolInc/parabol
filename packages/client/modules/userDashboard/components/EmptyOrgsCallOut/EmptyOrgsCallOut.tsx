import styled from '@emotion/styled'
import {useNavigate} from 'react-router-dom'
import Panel from '../../../../components/Panel/Panel'
import PrimaryButton from '../../../../components/PrimaryButton'

const Body = styled('div')({
  padding: '32px',
  textAlign: 'center'
})

const Heading = styled('h2')({
  fontSize: 20,
  lineHeight: '30px',
  margin: '0 0 16px'
})

const Copy = styled('p')({
  fontSize: 14,
  lineHeight: '21px',
  margin: '0 0 24px'
})

const StyledButton = styled(PrimaryButton)({
  margin: '0 auto'
})

const EmptyOrgsCallOut = () => {
  const navigate = useNavigate()
  const gotoNewTeam = () => {
    navigate('/newteam')
  }

  return (
    <Panel>
      <Body>
        <Heading>{'You aren’t in any organizations!'}</Heading>
        <Copy>
          {'You can create a new organization'}
          <br />
          {'and manage your own teams and tasks.'}
        </Copy>
        <StyledButton onClick={gotoNewTeam} size='medium'>
          {'Start a New Organization'}
        </StyledButton>
      </Body>
    </Panel>
  )
}

export default EmptyOrgsCallOut

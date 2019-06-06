import React from 'react'
import styled from 'react-emotion'
import SecondaryButton from 'universal/components/SecondaryButton'
import {RouteComponentProps, withRouter} from 'react-router-dom'

const StyledButton = styled(SecondaryButton)({
  paddingLeft: 16,
  paddingRight: 16
})

const CreateAccountButton = (props: RouteComponentProps) => {
  const {history} = props
  const handleClick = () => history.push('/create-account?from=demo')
  return <StyledButton onClick={handleClick}>{'Create Free Account'}</StyledButton>
}

export default withRouter(CreateAccountButton)

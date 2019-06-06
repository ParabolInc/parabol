import React from 'react'
import PrimaryButton from 'universal/components/PrimaryButton'
import {RouteComponentProps, withRouter} from 'react-router-dom'

const CreateAccountPrimaryButton = (props: RouteComponentProps) => {
  const {history} = props
  const handleClick = () => history.push('/create-account?from=demo')
  return <PrimaryButton onClick={handleClick}>{'Create Free Account'}</PrimaryButton>
}

export default withRouter(CreateAccountPrimaryButton)

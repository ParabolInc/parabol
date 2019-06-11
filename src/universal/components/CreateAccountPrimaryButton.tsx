import React from 'react'
import PrimaryButton from 'universal/components/PrimaryButton'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import hasToken from 'universal/utils/hasToken'

const CreateAccountPrimaryButton = (props: RouteComponentProps) => {
  const {history} = props
  const path = hasToken() ? '/me' : '/create-account?from=demo'
  const label = hasToken() ? 'My Dashboard' : 'Create Free Account'
  const handleClick = () => history.push(path)
  return <PrimaryButton onClick={handleClick}>{label}</PrimaryButton>
}

export default withRouter(CreateAccountPrimaryButton)

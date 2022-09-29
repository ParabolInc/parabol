import React from 'react'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import hasToken from '../utils/hasToken'
import PrimaryButton from './PrimaryButton'

const DemoCreateAccountPrimaryButton = (props: RouteComponentProps) => {
  const {history} = props
  const path = hasToken() ? '/meetings' : '/create-account?from=demo'
  const label = hasToken() ? 'My Dashboard' : 'Create Free Account'
  const handleClick = () => history.push(path)
  return (
    <PrimaryButton onClick={handleClick} size='medium'>
      {label}
    </PrimaryButton>
  )
}

export default withRouter(DemoCreateAccountPrimaryButton)

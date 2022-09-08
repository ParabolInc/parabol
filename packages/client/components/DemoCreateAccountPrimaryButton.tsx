import React from 'react'
import {useTranslation} from 'react-i18next'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import hasToken from '../utils/hasToken'
import PrimaryButton from './PrimaryButton'

const DemoCreateAccountPrimaryButton = (props: RouteComponentProps) => {
  const {history} = props

  const {t} = useTranslation()

  const path = hasToken() ? '/meetings' : '/create-account?from=demo'
  const label = hasToken()
    ? t('DemoCreateAccountPrimaryButton.MyDashboard')
    : t('DemoCreateAccountPrimaryButton.CreateFreeAccount')
  const handleClick = () => history.push(path)
  return (
    <PrimaryButton onClick={handleClick} size='medium'>
      {label}
    </PrimaryButton>
  )
}

export default withRouter(DemoCreateAccountPrimaryButton)
